package com.econgame.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "strike_vote_records",
       uniqueConstraints = @UniqueConstraint(columnNames = {"strike_vote_id", "worker_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StrikeVoteRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "strike_vote_id", nullable = false)
    private StrikeVote strikeVote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker worker;

    @Column(nullable = false)
    private Boolean vote;

    @Builder.Default
    private LocalDateTime votedAt = LocalDateTime.now();
}
