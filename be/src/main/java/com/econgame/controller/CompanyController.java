package com.econgame.controller;

import com.econgame.dto.GameDTO;
import com.econgame.entity.Company;
import com.econgame.entity.User;
import com.econgame.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping("/company")
    public ResponseEntity<GameDTO.ApiResponse<GameDTO.CompanyResponse>> createCompany(
            @RequestBody GameDTO.CompanyRequest request,
            @AuthenticationPrincipal User user) {
        try {
            Company company = companyService.createCompany(request.getName(), user);
            return ResponseEntity.ok(GameDTO.ApiResponse.ok("Tạo công ty thành công!", companyService.toResponse(company)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(GameDTO.ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/companies")
    public ResponseEntity<GameDTO.ApiResponse<List<GameDTO.CompanyResponse>>> getAllCompanies() {
        return ResponseEntity.ok(GameDTO.ApiResponse.ok(companyService.getAllCompanies()));
    }

    @GetMapping("/company/{id}")
    public ResponseEntity<GameDTO.ApiResponse<GameDTO.CompanyResponse>> getCompany(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(GameDTO.ApiResponse.ok(companyService.getCompanyById(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(GameDTO.ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/company/{id}/salary")
    public ResponseEntity<GameDTO.ApiResponse<String>> setSalary(
            @PathVariable Long id,
            @RequestBody GameDTO.SalaryRequest request,
            @AuthenticationPrincipal User user) {
        try {
            companyService.setSalary(id, request.getSalary(), user);
            return ResponseEntity.ok(GameDTO.ApiResponse.ok("Đã cập nhật lương: " + request.getSalary() + "$", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(GameDTO.ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/company/{id}/sabotage")
    public ResponseEntity<GameDTO.ApiResponse<String>> sabotage(
            @PathVariable Long id,
            @RequestBody GameDTO.SabotageRequest request,
            @AuthenticationPrincipal User user) {
        try {
            String result = companyService.sabotage(id, request.getTargetCompanyId(), user);
            return ResponseEntity.ok(GameDTO.ApiResponse.ok(result, null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(GameDTO.ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/company/{id}/takeover")
    public ResponseEntity<GameDTO.ApiResponse<String>> takeover(
            @PathVariable Long id,
            @RequestBody GameDTO.TakeoverRequest request,
            @AuthenticationPrincipal User user) {
        try {
            String result = companyService.hostileTakeover(id, request.getTargetCompanyId(), user);
            return ResponseEntity.ok(GameDTO.ApiResponse.ok(result, null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(GameDTO.ApiResponse.error(e.getMessage()));
        }
    }
}
