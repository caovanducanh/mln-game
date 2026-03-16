package com.econgame.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

public class GameDTO {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String email;
        private String name;
        private String avatarUrl;
        private String role;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CompanyRequest {
        private String name;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CompanyResponse {
        private Long id;
        private String name;
        private BigDecimal budget;
        private BigDecimal salaryPerWorker;
        private BigDecimal productionCost;
        private BigDecimal productPrice;
        private Integer reputation;
        private Integer maxWorkers;
        private Integer currentWorkers;
        private Long ownerId;
        private String ownerName;
        private Boolean bankrupt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SalaryRequest {
        private BigDecimal salary;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SabotageRequest {
        private Long targetCompanyId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TakeoverRequest {
        private Long targetCompanyId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class WorkerResponse {
        private Long id;
        private Long userId;
        private String userName;
        private Long companyId;
        private String companyName;
        private BigDecimal salary;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UnionRequest {
        private String name;
        private BigDecimal demandedSalary;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class EventRequest {
        private String type;
        private String description;
        private Long targetCompanyId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class EventResponse {
        private Long id;
        private String type;
        private String description;
        private Integer roundNumber;
        private Boolean active;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class GameState {
        private Integer currentRound;
        private String roundStatus;
        private Integer roundTimeRemaining;
        private EconomyStats economy;
        private List<CompanyResponse> companies;
        private List<EventResponse> activeEvents;
        private List<LeaderboardEntry> leaderboard;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class EconomyStats {
        private BigDecimal gdp;
        private BigDecimal avgSalary;
        private BigDecimal unemploymentRate;
        private Integer totalWorkers;
        private Integer unemployedWorkers;
        private Integer totalCompanies;
        private Integer bankruptCompanies;
        private Integer totalProductsSold;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LeaderboardEntry {
        private Integer rank;
        private Long companyId;
        private String companyName;
        private BigDecimal budget;
        private Integer reputation;
        private Integer workers;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class StrikeVoteResponse {
        private Long id;
        private Long companyId;
        private String companyName;
        private Integer votesFor;
        private Integer votesAgainst;
        private Integer totalWorkers;
        private Boolean resolved;
        private Boolean passed;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public static <T> ApiResponse<T> ok(T data) {
            return new ApiResponse<>(true, null, data);
        }

        public static <T> ApiResponse<T> ok(String message, T data) {
            return new ApiResponse<>(true, message, data);
        }

        public static <T> ApiResponse<T> error(String message) {
            return new ApiResponse<>(false, message, null);
        }
    }
}
