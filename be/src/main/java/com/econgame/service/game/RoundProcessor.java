package com.econgame.service.game;

import com.econgame.entity.*;
import com.econgame.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoundProcessor {

    private final CompanyRepository companyRepository;
    private final WorkerRepository workerRepository;
    private final StrikeVoteRepository strikeVoteRepository;
    private final GameEventRepository gameEventRepository;
    private final GameRoundRepository gameRoundRepository;

    @Transactional
    public GameRound processRound(GameRound round) {
        log.info("Processing round {}", round.getRoundNumber());

        List<Company> companies = companyRepository.findByBankruptFalse();
        List<GameEvent> activeEvents = gameEventRepository.findByRoundNumberAndActiveTrue(round.getRoundNumber());

        BigDecimal totalGDP = BigDecimal.ZERO;
        BigDecimal totalSalaryPaid = BigDecimal.ZERO;
        int totalProductsSold = 0;
        int totalSalaryWorkers = 0;

        // Event modifiers
        double demandMultiplier = 1.0;
        double priceMultiplier = 1.0;
        double taxRate = 0.0;
        BigDecimal minimumWage = BigDecimal.ZERO;

        for (GameEvent event : activeEvents) {
            switch (event.getType()) {
                case "ECONOMIC_CRISIS" -> demandMultiplier *= 0.5;
                case "MARKET_BOOM" -> { demandMultiplier *= 2.0; priceMultiplier *= 1.5; }
                case "TAX_POLICY" -> taxRate += 0.2;
                case "LABOR_LAW" -> minimumWage = new BigDecimal("12");
            }
        }

        for (Company company : companies) {
            List<Worker> workers = workerRepository.findByCompanyIdAndLeftAtIsNull(company.getId());
            int workerCount = workers.size();

            if (workerCount == 0) {
                continue;
            }

            // Enforce minimum wage if LABOR_LAW active
            if (minimumWage.compareTo(BigDecimal.ZERO) > 0 &&
                company.getSalaryPerWorker().compareTo(minimumWage) < 0) {
                company.setSalaryPerWorker(minimumWage);
            }

            // 1. Pay salaries FIRST
            BigDecimal totalSalaryCost = company.getSalaryPerWorker().multiply(new BigDecimal(workerCount));

            if (company.getBudget().compareTo(totalSalaryCost) < 0) {
                // Can't pay → workers quit, reputation drops
                log.warn("Company {} can't pay salaries. Workers leaving.", company.getName());
                company.setReputation(Math.max(0, company.getReputation() - 10));
                for (Worker worker : workers) {
                    worker.setLeftAt(java.time.LocalDateTime.now());
                    workerRepository.save(worker);
                    // Create unemployed record
                    workerRepository.save(Worker.builder()
                            .user(worker.getUser())
                            .company(null)
                            .build());
                }
                companyRepository.save(company);
                continue;
            }

            company.setBudget(company.getBudget().subtract(totalSalaryCost));
            totalSalaryPaid = totalSalaryPaid.add(totalSalaryCost);
            totalSalaryWorkers += workerCount;

            // 2. Check for strikes
            boolean onStrike = strikeVoteRepository
                    .findByCompanyIdAndRoundNumberAndResolvedFalse(company.getId(), round.getRoundNumber())
                    .map(sv -> sv.getPassed() != null && sv.getPassed())
                    .orElse(false);

            // Also check WORKER_STRIKE event
            for (GameEvent event : activeEvents) {
                if ("WORKER_STRIKE".equals(event.getType())) {
                    if (company.getSalaryPerWorker().compareTo(new BigDecimal("10")) < 0) {
                        onStrike = true;
                    }
                }
            }

            // 3. Production (if not on strike)
            int productionCount = 0;
            if (!onStrike) {
                BigDecimal totalProductionCost = company.getProductionCost().multiply(new BigDecimal(workerCount));

                if (company.getBudget().compareTo(totalProductionCost) >= 0) {
                    productionCount = workerCount;
                    company.setBudget(company.getBudget().subtract(totalProductionCost));
                } else {
                    // Produce what you can afford
                    productionCount = company.getBudget().divide(company.getProductionCost(), 0, RoundingMode.DOWN).intValue();
                    BigDecimal actualCost = company.getProductionCost().multiply(new BigDecimal(productionCount));
                    company.setBudget(company.getBudget().subtract(actualCost));
                }
            }

            // 4. Sell products
            int soldCount = (int) Math.round(productionCount * demandMultiplier);
            BigDecimal revenue = company.getProductPrice()
                    .multiply(new BigDecimal(priceMultiplier))
                    .multiply(new BigDecimal(soldCount));

            // 5. Apply tax
            if (taxRate > 0) {
                BigDecimal tax = revenue.multiply(new BigDecimal(taxRate));
                revenue = revenue.subtract(tax);
            }

            company.setBudget(company.getBudget().add(revenue));
            totalGDP = totalGDP.add(revenue);
            totalProductsSold += soldCount;

            // 6. Good salary reputation bonus
            if (company.getSalaryPerWorker().compareTo(new BigDecimal("15")) >= 0) {
                company.setReputation(Math.min(100, company.getReputation() + 3));
            }

            // 7. Bankruptcy check
            if (company.getBudget().compareTo(BigDecimal.ZERO) < 0) {
                company.setBankrupt(true);
                log.warn("Company {} is bankrupt!", company.getName());
                // Free all workers
                for (Worker worker : workers) {
                    worker.setLeftAt(java.time.LocalDateTime.now());
                    workerRepository.save(worker);
                    workerRepository.save(Worker.builder()
                            .user(worker.getUser())
                            .company(null)
                            .build());
                }
            }

            companyRepository.save(company);
        }

        // Calculate economy stats
        int totalActiveWorkers = workerRepository.countAllActive();
        int unemployed = workerRepository.countUnemployed();
        BigDecimal unemploymentRate = totalActiveWorkers > 0
                ? new BigDecimal(unemployed).divide(new BigDecimal(totalActiveWorkers), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;
        BigDecimal avgSalary = totalSalaryWorkers > 0
                ? totalSalaryPaid.divide(new BigDecimal(totalSalaryWorkers), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        round.setGdp(totalGDP);
        round.setAvgSalary(avgSalary);
        round.setUnemploymentRate(unemploymentRate);
        round.setTotalProductsSold(totalProductsSold);
        round.setStatus("FINISHED");
        round.setEndedAt(java.time.LocalDateTime.now());

        // Deactivate events for this round
        for (GameEvent event : activeEvents) {
            event.setActive(false);
            gameEventRepository.save(event);
        }

        return gameRoundRepository.save(round);
    }
}
