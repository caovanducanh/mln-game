package com.econgame.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "strike_votes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StrikeVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false)
    private Integer roundNumber;

    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal threshold = new BigDecimal("0.50");

    @Builder.Default
    private Boolean resolved = false;

    @Builder.Default
    private Boolean passed = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
