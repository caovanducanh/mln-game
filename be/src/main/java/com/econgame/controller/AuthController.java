package com.econgame.controller;

import com.econgame.dto.GameDTO;
import com.econgame.entity.User;
import com.econgame.service.UserService;
import com.econgame.service.WorkerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final WorkerService workerService;

    @GetMapping("/me")
    public ResponseEntity<GameDTO.ApiResponse<GameDTO.UserResponse>> getCurrentUser(
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(GameDTO.ApiResponse.error("Chưa đăng nhập"));
        }
        return ResponseEntity.ok(GameDTO.ApiResponse.ok(userService.toResponse(user)));
    }

    @GetMapping("/me/worker")
    public ResponseEntity<GameDTO.ApiResponse<GameDTO.WorkerResponse>> getMyWorkerStatus(
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(GameDTO.ApiResponse.error("Chưa đăng nhập"));
        }
        return ResponseEntity.ok(GameDTO.ApiResponse.ok(workerService.getMyWorkerStatus(user)));
    }

    @PostMapping("/admin/make-admin/{userId}")
    public ResponseEntity<GameDTO.ApiResponse<String>> makeAdmin(
            @PathVariable Long userId,
            @AuthenticationPrincipal User user) {
        if (user == null || !"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403)
                    .body(GameDTO.ApiResponse.error("Không có quyền"));
        }
        userService.makeAdmin(userId);
        return ResponseEntity.ok(GameDTO.ApiResponse.ok("Đã cấp quyền admin", null));
    }
}
