package com.econgame.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sabotage_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SabotageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attacker_id", nullable = false)
    private Company attacker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_id", nullable = false)
    private Company target;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cost;

    @Column(nullable = false)
    private Integer roundNumber;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
