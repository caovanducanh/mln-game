package com.econgame.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_rounds")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GameRound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer roundNumber;

    @Column(nullable = false)
    @Builder.Default
    private String status = "WAITING";

    @Builder.Default
    private Integer roundDurationSeconds = 60;

    @Column(precision = 12, scale = 2)
    private BigDecimal gdp;

    @Column(precision = 12, scale = 2)
    private BigDecimal avgSalary;

    @Column(precision = 5, scale = 2)
    private BigDecimal unemploymentRate;

    private Integer totalProductsSold;

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;
}
