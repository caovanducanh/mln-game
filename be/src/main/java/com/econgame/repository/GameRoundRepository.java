package com.econgame.repository;

import com.econgame.entity.GameRound;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GameRoundRepository extends JpaRepository<GameRound, Long> {
    Optional<GameRound> findTopByOrderByRoundNumberDesc();
    Optional<GameRound> findByRoundNumber(Integer roundNumber);
    Optional<GameRound> findByStatus(String status);
}
