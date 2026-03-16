package com.econgame.controller;

import com.econgame.dto.GameDTO;
import com.econgame.entity.GameEvent;
import com.econgame.entity.GameRound;
import com.econgame.repository.GameRoundRepository;
import com.econgame.service.game.EventProcessor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventProcessor eventProcessor;
    private final GameRoundRepository gameRoundRepository;

    @PostMapping("/trigger")
    public ResponseEntity<GameDTO.ApiResponse<GameDTO.EventResponse>> triggerEvent(
            @RequestBody GameDTO.EventRequest request) {
        try {
            int currentRound = gameRoundRepository.findTopByOrderByRoundNumberDesc()
                    .map(GameRound::getRoundNumber)
                    .orElse(1);

            GameEvent event = eventProcessor.triggerEvent(
                    request.getType(),
                    request.getDescription(),
                    request.getTargetCompanyId(),
                    currentRound);

            GameDTO.EventResponse response = GameDTO.EventResponse.builder()
                    .id(event.getId())
                    .type(event.getType())
                    .description(event.getDescription())
                    .roundNumber(event.getRoundNumber())
                    .active(event.getActive())
                    .build();

            return ResponseEntity.ok(GameDTO.ApiResponse.ok("Sự kiện đã được kích hoạt!", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(GameDTO.ApiResponse.error(e.getMessage()));
        }
    }
}
