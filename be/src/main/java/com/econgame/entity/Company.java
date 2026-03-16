package com.econgame.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal budget = new BigDecimal("1000.00");

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal salaryPerWorker = new BigDecimal("15.00");

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal productionCost = new BigDecimal("10.00");

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal productPrice = new BigDecimal("20.00");

    @Builder.Default
    private Integer reputation = 50;

    @Builder.Default
    private Integer maxWorkers = 10;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Builder.Default
    private Boolean bankrupt = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
