package com.econgame.controller;

import com.econgame.dto.GameDTO;
import com.econgame.entity.GameRound;
import com.econgame.service.CompanyService;
import com.econgame.service.game.GameEngineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
public class GameController {

    private final GameEngineService gameEngineService;
    private final CompanyService companyService;

    @PostMapping("/start")
    public ResponseEntity<GameDTO.ApiResponse<String>> startGame() {
        try {
            GameRound round = gameEngineService.startGame();
            return ResponseEntity.ok(GameDTO.ApiResponse.ok(
                    "Game bắt đầu! Vòng " + round.getRoundNumber(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(GameDTO.ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/next-round")
    public ResponseEntity<GameDTO.ApiResponse<String>> nextRound() {
        try {
            GameRound round = gameEngineService.nextRound();
            return ResponseEntity.ok(GameDTO.ApiResponse.ok(
                    "Vòng " + round.getRoundNumber() + " bắt đầu!", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(GameDTO.ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/state")
    public ResponseEntity<GameDTO.ApiResponse<GameDTO.GameState>> getGameState() {
        return ResponseEntity.ok(GameDTO.ApiResponse.ok(gameEngineService.getGameState()));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<GameDTO.ApiResponse<List<GameDTO.LeaderboardEntry>>> getLeaderboard() {
        return ResponseEntity.ok(GameDTO.ApiResponse.ok(companyService.getLeaderboard()));
    }
}
