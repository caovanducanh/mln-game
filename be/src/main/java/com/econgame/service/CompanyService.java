package com.econgame.service;

import com.econgame.dto.GameDTO;
import com.econgame.entity.*;
import com.econgame.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final WorkerRepository workerRepository;
    private final SabotageLogRepository sabotageLogRepository;
    private final UserRepository userRepository;
    private final GameRoundRepository gameRoundRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${app.game.starting-budget}")
    private BigDecimal startingBudget;

    @Value("${app.game.default-salary}")
    private BigDecimal defaultSalary;

    @Transactional
    public Company createCompany(String name, User owner) {
        if (companyRepository.existsByOwnerId(owner.getId())) {
            throw new RuntimeException("Bạn đã sở hữu một công ty rồi");
        }

        Company company = Company.builder()
                .name(name)
                .budget(startingBudget)
                .salaryPerWorker(defaultSalary)
                .owner(owner)
                .build();

        company = companyRepository.save(company);
        broadcastCompanies();
        return company;
    }

    public List<GameDTO.CompanyResponse> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public GameDTO.CompanyResponse getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công ty"));
        return toResponse(company);
    }

    @Transactional
    public void setSalary(Long companyId, BigDecimal salary, User owner) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công ty"));

        if (!company.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Bạn không phải chủ công ty này");
        }

        if (salary.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Lương không được âm");
        }

        company.setSalaryPerWorker(salary);
        companyRepository.save(company);

        if (salary.compareTo(new BigDecimal("15")) >= 0) {
            company.setReputation(Math.min(100, company.getReputation() + 2));
        } else if (salary.compareTo(new BigDecimal("8")) < 0) {
            company.setReputation(Math.max(0, company.getReputation() - 5));
        }
        companyRepository.save(company);
        broadcastCompanies();
    }

    @Transactional
    public String sabotage(Long attackerId, Long targetId, User owner) {
        Company attacker = companyRepository.findById(attackerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công ty tấn công"));
        Company target = companyRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công ty mục tiêu"));

        if (!attacker.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Bạn không phải chủ công ty này");
        }
        if (attacker.getBankrupt()) {
            throw new RuntimeException("Công ty đã phá sản");
        }
        if (attackerId.equals(targetId)) {
            throw new RuntimeException("Không thể phá hoại chính mình");
        }

        int currentRound = getCurrentRound();
        int sabotageCount = sabotageLogRepository.countByAttackerIdAndRoundNumber(attackerId, currentRound);
        if (sabotageCount > 0) {
            throw new RuntimeException("Chỉ được phá hoại 1 lần mỗi vòng");
        }

        int totalSabotages = sabotageLogRepository.countByAttackerId(attackerId);
        BigDecimal cost = new BigDecimal(30 + totalSabotages * 10);

        if (attacker.getBudget().compareTo(cost) < 0) {
            throw new RuntimeException("Không đủ ngân sách (cần " + cost + "$)");
        }

        attacker.setBudget(attacker.getBudget().subtract(cost));
        target.setBudget(target.getBudget().subtract(cost));
        target.setReputation(Math.max(0, target.getReputation() - 5));

        companyRepository.save(attacker);
        companyRepository.save(target);

        sabotageLogRepository.save(SabotageLog.builder()
                .attacker(attacker)
                .target(target)
                .cost(cost)
                .roundNumber(currentRound)
                .build());

        broadcastCompanies();
        return "Phá hoại thành công! Chi phí: " + cost + "$";
    }

    @Transactional
    public String hostileTakeover(Long attackerId, Long targetId, User owner) {
        Company attacker = companyRepository.findById(attackerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công ty"));
        Company target = companyRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công ty mục tiêu"));

        if (!attacker.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Bạn không phải chủ công ty này");
        }

        BigDecimal requiredBudget = target.getBudget().multiply(new BigDecimal("1.5"));
        if (attacker.getBudget().compareTo(requiredBudget) < 0) {
            throw new RuntimeException("Cần ít nhất " + requiredBudget.setScale(2, RoundingMode.HALF_UP) + "$ để thâu tóm");
        }

        attacker.setBudget(attacker.getBudget().subtract(target.getBudget()));
        attacker.setBudget(attacker.getBudget().add(target.getBudget()));

        // Transfer workers
        List<Worker> targetWorkers = workerRepository.findByCompanyIdAndLeftAtIsNull(targetId);
        for (Worker w : targetWorkers) {
            w.setCompany(attacker);
            workerRepository.save(w);
        }

        target.setBankrupt(true);
        target.setBudget(BigDecimal.ZERO);
        companyRepository.save(attacker);
        companyRepository.save(target);

        broadcastCompanies();
        return "Thâu tóm thành công công ty " + target.getName() + "!";
    }

    public List<GameDTO.LeaderboardEntry> getLeaderboard() {
        List<Company> companies = companyRepository.findLeaderboard();
        return companies.stream()
                .map(c -> {
                    int workerCount = workerRepository.countActiveByCompanyId(c.getId());
                    return GameDTO.LeaderboardEntry.builder()
                            .rank(companies.indexOf(c) + 1)
                            .companyId(c.getId())
                            .companyName(c.getName())
                            .budget(c.getBudget())
                            .reputation(c.getReputation())
                            .workers(workerCount)
                            .build();
                })
                .toList();
    }

    public GameDTO.CompanyResponse toResponse(Company company) {
        int workerCount = workerRepository.countActiveByCompanyId(company.getId());
        return GameDTO.CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .budget(company.getBudget())
                .salaryPerWorker(company.getSalaryPerWorker())
                .productionCost(company.getProductionCost())
                .productPrice(company.getProductPrice())
                .reputation(company.getReputation())
                .maxWorkers(company.getMaxWorkers())
                .currentWorkers(workerCount)
                .ownerId(company.getOwner().getId())
                .ownerName(company.getOwner().getName())
                .bankrupt(company.getBankrupt())
                .build();
    }

    private int getCurrentRound() {
        return gameRoundRepository.findTopByOrderByRoundNumberDesc()
                .map(GameRound::getRoundNumber)
                .orElse(0);
    }

    private void broadcastCompanies() {
        messagingTemplate.convertAndSend("/topic/companies", getAllCompanies());
    }
}
