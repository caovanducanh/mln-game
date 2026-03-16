package com.econgame.service;

import com.econgame.dto.GameDTO;
import com.econgame.entity.*;
import com.econgame.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkerService {

    private final WorkerRepository workerRepository;
    private final CompanyRepository companyRepository;
    private final StrikeVoteRepository strikeVoteRepository;
    private final StrikeVoteRecordRepository strikeVoteRecordRepository;
    private final WorkerUnionRepository workerUnionRepository;
    private final GameRoundRepository gameRoundRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public GameDTO.WorkerResponse joinCompany(Long companyId, User user) {
        // Check if already employed
        Worker existing = workerRepository.findByUserIdAndLeftAtIsNull(user.getId()).orElse(null);
        if (existing != null && existing.getCompany() != null) {
            throw new RuntimeException("Bạn đang làm việc cho công ty " + existing.getCompany().getName() + ". Hãy nghỉ việc trước.");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công ty"));

        if (company.getBankrupt()) {
            throw new RuntimeException("Công ty này đã phá sản");
        }

        int currentWorkers = workerRepository.countActiveByCompanyId(companyId);
        if (currentWorkers >= company.getMaxWorkers()) {
            throw new RuntimeException("Công ty đã đủ nhân viên (" + company.getMaxWorkers() + "/" + company.getMaxWorkers() + ")");
        }

        // If user has an unemployed worker record, update it; otherwise create new
        Worker worker;
        if (existing != null && existing.getCompany() == null) {
            existing.setCompany(company);
            existing.setJoinedAt(LocalDateTime.now());
            worker = workerRepository.save(existing);
        } else {
            worker = Worker.builder()
                    .user(user)
                    .company(company)
                    .build();
            worker = workerRepository.save(worker);
        }

        broadcastCompanies();
        return toResponse(worker);
    }

    @Transactional
    public void quitCompany(User user) {
        Worker worker = workerRepository.findByUserIdAndLeftAtIsNull(user.getId())
                .orElseThrow(() -> new RuntimeException("Bạn chưa làm việc cho công ty nào"));

        if (worker.getCompany() == null) {
            throw new RuntimeException("Bạn đang thất nghiệp");
        }

        worker.setLeftAt(LocalDateTime.now());
        workerRepository.save(worker);

        // Create new unemployed worker record
        Worker unemployed = Worker.builder()
                .user(user)
                .company(null)
                .build();
        workerRepository.save(unemployed);

        broadcastCompanies();
    }

    public GameDTO.WorkerResponse getMyWorkerStatus(User user) {
        Worker worker = workerRepository.findByUserIdAndLeftAtIsNull(user.getId()).orElse(null);
        if (worker == null) {
            return GameDTO.WorkerResponse.builder()
                    .userId(user.getId())
                    .userName(user.getName())
                    .build();
        }
        return toResponse(worker);
    }

    @Transactional
    public GameDTO.StrikeVoteResponse initiateStrike(Long companyId, User user) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công ty"));

        if (company.getSalaryPerWorker().compareTo(new BigDecimal("10")) >= 0) {
            throw new RuntimeException("Chỉ được đình công khi lương dưới 10$");
        }

        int currentRound = getCurrentRound();
        StrikeVote existing = strikeVoteRepository
                .findByCompanyIdAndRoundNumberAndResolvedFalse(companyId, currentRound).orElse(null);

        if (existing != null) {
            throw new RuntimeException("Đang có cuộc bỏ phiếu đình công cho công ty này");
        }

        StrikeVote vote = StrikeVote.builder()
                .company(company)
                .roundNumber(currentRound)
                .build();
        vote = strikeVoteRepository.save(vote);

        int totalWorkers = workerRepository.countActiveByCompanyId(companyId);
        return GameDTO.StrikeVoteResponse.builder()
                .id(vote.getId())
                .companyId(companyId)
                .companyName(company.getName())
                .votesFor(0)
                .votesAgainst(0)
                .totalWorkers(totalWorkers)
                .resolved(false)
                .passed(false)
                .build();
    }

    @Transactional
    public GameDTO.StrikeVoteResponse castStrikeVote(Long companyId, User user, boolean voteFor) {
        int currentRound = getCurrentRound();
        StrikeVote strikeVote = strikeVoteRepository
                .findByCompanyIdAndRoundNumberAndResolvedFalse(companyId, currentRound)
                .orElseThrow(() -> new RuntimeException("Không có cuộc bỏ phiếu đình công nào"));

        Worker worker = workerRepository.findByUserIdAndLeftAtIsNull(user.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải nhân viên"));

        if (worker.getCompany() == null || !worker.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("Bạn không phải nhân viên công ty này");
        }

        if (strikeVoteRecordRepository.existsByStrikeVoteIdAndWorkerId(strikeVote.getId(), worker.getId())) {
            throw new RuntimeException("Bạn đã bỏ phiếu rồi");
        }

        StrikeVoteRecord record = StrikeVoteRecord.builder()
                .strikeVote(strikeVote)
                .worker(worker)
                .vote(voteFor)
                .build();
        strikeVoteRecordRepository.save(record);

        int votesFor = strikeVoteRecordRepository.countByStrikeVoteIdAndVoteTrue(strikeVote.getId());
        int votesAgainst = strikeVoteRecordRepository.countByStrikeVoteIdAndVoteFalse(strikeVote.getId());
        int totalWorkers = workerRepository.countActiveByCompanyId(companyId);

        // Auto-resolve if all workers voted
        if (votesFor + votesAgainst >= totalWorkers) {
            strikeVote.setResolved(true);
            strikeVote.setPassed(votesFor > votesAgainst);
            strikeVoteRepository.save(strikeVote);

            if (strikeVote.getPassed()) {
                Company company = strikeVote.getCompany();
                company.setReputation(Math.max(0, company.getReputation() - 10));
                companyRepository.save(company);
            }
        }

        return GameDTO.StrikeVoteResponse.builder()
                .id(strikeVote.getId())
                .companyId(companyId)
                .companyName(strikeVote.getCompany().getName())
                .votesFor(votesFor)
                .votesAgainst(votesAgainst)
                .totalWorkers(totalWorkers)
                .resolved(strikeVote.getResolved())
                .passed(strikeVote.getPassed())
                .build();
    }

    @Transactional
    public String createUnion(Long companyId, User user, String unionName, BigDecimal demandedSalary) {
        Worker worker = workerRepository.findByUserIdAndLeftAtIsNull(user.getId())
                .orElseThrow(() -> new RuntimeException("Bạn chưa làm việc"));

        if (worker.getCompany() == null || !worker.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("Bạn không phải nhân viên công ty này");
        }

        WorkerUnion existing = workerUnionRepository.findByCompanyIdAndStatus(companyId, "NEGOTIATING").orElse(null);
        if (existing != null) {
            throw new RuntimeException("Đã có công đoàn đang đàm phán");
        }

        Company company = companyRepository.findById(companyId).orElseThrow();

        WorkerUnion union = WorkerUnion.builder()
                .name(unionName)
                .company(company)
                .leader(worker)
                .demandedSalary(demandedSalary)
                .build();
        workerUnionRepository.save(union);

        return "Công đoàn '" + unionName + "' đã được thành lập! Yêu cầu lương: " + demandedSalary + "$";
    }

    private GameDTO.WorkerResponse toResponse(Worker worker) {
        return GameDTO.WorkerResponse.builder()
                .id(worker.getId())
                .userId(worker.getUser().getId())
                .userName(worker.getUser().getName())
                .companyId(worker.getCompany() != null ? worker.getCompany().getId() : null)
                .companyName(worker.getCompany() != null ? worker.getCompany().getName() : null)
                .salary(worker.getCompany() != null ? worker.getCompany().getSalaryPerWorker() : null)
                .build();
    }

    private int getCurrentRound() {
        return gameRoundRepository.findTopByOrderByRoundNumberDesc()
                .map(GameRound::getRoundNumber)
                .orElse(0);
    }

    private void broadcastCompanies() {
        messagingTemplate.convertAndSend("/topic/companies", "update");
    }
}
