package com.econgame.service.game;

import com.econgame.dto.GameDTO;
import com.econgame.entity.*;
import com.econgame.repository.*;
import com.econgame.service.CompanyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameEngineService {

    private final GameRoundRepository gameRoundRepository;
    private final CompanyRepository companyRepository;
    private final WorkerRepository workerRepository;
    private final GameEventRepository gameEventRepository;
    private final RoundProcessor roundProcessor;
    private final CompanyService companyService;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${app.game.round-duration-seconds}")
    private int roundDurationSeconds;

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private ScheduledFuture<?> currentRoundTask;

    @Transactional
    public GameRound startGame() {
        // Check if game already running
        GameRound existing = gameRoundRepository.findByStatus("RUNNING").orElse(null);
        if (existing != null) {
            throw new RuntimeException("Game đang chạy! Vòng " + existing.getRoundNumber());
        }

        GameRound round = GameRound.builder()
                .roundNumber(1)
                .status("RUNNING")
                .roundDurationSeconds(roundDurationSeconds)
                .startedAt(LocalDateTime.now())
                .build();
        round = gameRoundRepository.save(round);

        scheduleRoundEnd(round.getId());
        broadcastRoundTimer(round);

        return round;
    }

    @Transactional
    public GameRound nextRound() {
        GameRound lastRound = gameRoundRepository.findTopByOrderByRoundNumberDesc()
                .orElseThrow(() -> new RuntimeException("Chưa bắt đầu game"));

        if ("RUNNING".equals(lastRound.getStatus())) {
            throw new RuntimeException("Vòng hiện tại chưa kết thúc");
        }

        GameRound newRound = GameRound.builder()
                .roundNumber(lastRound.getRoundNumber() + 1)
                .status("RUNNING")
                .roundDurationSeconds(roundDurationSeconds)
                .startedAt(LocalDateTime.now())
                .build();
        newRound = gameRoundRepository.save(newRound);

        scheduleRoundEnd(newRound.getId());
        broadcastRoundTimer(newRound);

        return newRound;
    }

    private void scheduleRoundEnd(Long roundId) {
        if (currentRoundTask != null && !currentRoundTask.isDone()) {
            currentRoundTask.cancel(false);
        }

        currentRoundTask = scheduler.schedule(() -> {
            try {
                GameRound round = gameRoundRepository.findById(roundId).orElse(null);
                if (round != null && "RUNNING".equals(round.getStatus())) {
                    GameRound processed = roundProcessor.processRound(round);
                    broadcastGameState();
                    log.info("Round {} processed successfully", processed.getRoundNumber());
                }
            } catch (Exception e) {
                log.error("Error processing round", e);
            }
        }, roundDurationSeconds, TimeUnit.SECONDS);

        // Start countdown broadcaster
        scheduler.scheduleAtFixedRate(() -> {
            try {
                GameRound round = gameRoundRepository.findById(roundId).orElse(null);
                if (round != null && "RUNNING".equals(round.getStatus())) {
                    broadcastRoundTimer(round);
                }
            } catch (Exception e) {
                // ignore
            }
        }, 0, 1, TimeUnit.SECONDS);
    }

    public GameDTO.GameState getGameState() {
        GameRound currentRound = gameRoundRepository.findTopByOrderByRoundNumberDesc().orElse(null);

        int timeRemaining = 0;
        if (currentRound != null && "RUNNING".equals(currentRound.getStatus())) {
            long elapsed = ChronoUnit.SECONDS.between(currentRound.getStartedAt(), LocalDateTime.now());
            timeRemaining = Math.max(0, currentRound.getRoundDurationSeconds() - (int) elapsed);
        }

        List<GameDTO.CompanyResponse> companies = companyService.getAllCompanies();
        List<GameDTO.LeaderboardEntry> leaderboard = companyService.getLeaderboard();
        List<GameDTO.EventResponse> events = gameEventRepository.findByActiveTrue().stream()
                .map(e -> GameDTO.EventResponse.builder()
                        .id(e.getId())
                        .type(e.getType())
                        .description(e.getDescription())
                        .roundNumber(e.getRoundNumber())
                        .active(e.getActive())
                        .build())
                .toList();

        // Economy stats
        int totalWorkers = workerRepository.countAllActive();
        int unemployed = workerRepository.countUnemployed();
        int totalCompanies = (int) companyRepository.count();
        int bankruptCompanies = totalCompanies - companyRepository.findByBankruptFalse().size();

        BigDecimal unemploymentRate = totalWorkers > 0
                ? new BigDecimal(unemployed).divide(new BigDecimal(totalWorkers), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;

        GameDTO.EconomyStats economy = GameDTO.EconomyStats.builder()
                .gdp(currentRound != null && currentRound.getGdp() != null ? currentRound.getGdp() : BigDecimal.ZERO)
                .avgSalary(currentRound != null && currentRound.getAvgSalary() != null ? currentRound.getAvgSalary() : BigDecimal.ZERO)
                .unemploymentRate(unemploymentRate)
                .totalWorkers(totalWorkers)
                .unemployedWorkers(unemployed)
                .totalCompanies(totalCompanies)
                .bankruptCompanies(bankruptCompanies)
                .totalProductsSold(currentRound != null && currentRound.getTotalProductsSold() != null ? currentRound.getTotalProductsSold() : 0)
                .build();

        return GameDTO.GameState.builder()
                .currentRound(currentRound != null ? currentRound.getRoundNumber() : 0)
                .roundStatus(currentRound != null ? currentRound.getStatus() : "WAITING")
                .roundTimeRemaining(timeRemaining)
                .economy(economy)
                .companies(companies)
                .activeEvents(events)
                .leaderboard(leaderboard)
                .build();
    }

    private void broadcastGameState() {
        GameDTO.GameState state = getGameState();
        messagingTemplate.convertAndSend("/topic/economy", state.getEconomy());
        messagingTemplate.convertAndSend("/topic/companies", state.getCompanies());
        messagingTemplate.convertAndSend("/topic/leaderboard", state.getLeaderboard());
    }

    private void broadcastRoundTimer(GameRound round) {
        long elapsed = ChronoUnit.SECONDS.between(round.getStartedAt(), LocalDateTime.now());
        int remaining = Math.max(0, round.getRoundDurationSeconds() - (int) elapsed);
        messagingTemplate.convertAndSend("/topic/round-timer",
                java.util.Map.of(
                        "round", round.getRoundNumber(),
                        "status", round.getStatus(),
                        "timeRemaining", remaining
                ));
    }
}
