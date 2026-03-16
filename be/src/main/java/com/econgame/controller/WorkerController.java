package com.econgame.controller;

import com.econgame.dto.GameDTO;
import com.econgame.entity.User;
import com.econgame.service.WorkerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worker")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerService workerService;

    @PostMapping("/join/{companyId}")
    public ResponseEntity<GameDTO.ApiResponse<GameDTO.WorkerResponse>> joinCompany(
            @PathVariable Long companyId,
            @AuthenticationPrincipal User user) {
        try {
            GameDTO.WorkerResponse response = workerService.joinCompany(companyId, user);
            return ResponseEntity.ok(GameDTO.ApiResponse.ok("Đã gia nhập công ty!", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(GameDTO.ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/quit")
    public ResponseEntity<GameDTO.ApiResponse<String>> quitCompany(
            @AuthenticationPrincipal User user) {
        try {
            workerService.quitCompany(user);
            return ResponseEntity.ok(GameDTO.ApiResponse.ok("Đã nghỉ việc!", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(GameDTO.ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/strike/{companyId}")
    public ResponseEntity<GameDTO.ApiResponse<GameDTO.StrikeVoteResponse>> initiateStrike(
            @PathVariable Long companyId,
            @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(GameDTO.ApiResponse.ok("Đã khởi xướng đình công!",
                    workerService.initiateStrike(companyId, user)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(GameDTO.ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/strike/{companyId}/vote")
    public ResponseEntity<GameDTO.ApiResponse<GameDTO.StrikeVoteResponse>> castStrikeVote(
            @PathVariable Long companyId,
            @RequestParam boolean voteFor,
            @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(GameDTO.ApiResponse.ok(
                    workerService.castStrikeVote(companyId, user, voteFor)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(GameDTO.ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/union/{companyId}")
    public ResponseEntity<GameDTO.ApiResponse<String>> createUnion(
            @PathVariable Long companyId,
            @RequestBody GameDTO.UnionRequest request,
            @AuthenticationPrincipal User user) {
        try {
            String result = workerService.createUnion(companyId, user, request.getName(), request.getDemandedSalary());
            return ResponseEntity.ok(GameDTO.ApiResponse.ok(result, null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(GameDTO.ApiResponse.error(e.getMessage()));
        }
    }
}
