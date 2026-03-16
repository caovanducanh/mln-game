package com.econgame.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "worker_unions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkerUnion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_worker_id", nullable = false)
    private Worker leader;

    @Column(precision = 12, scale = 2)
    private BigDecimal demandedSalary;

    @Column(nullable = false)
    @Builder.Default
    private String status = "NEGOTIATING";

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
