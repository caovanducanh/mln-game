package com.econgame.repository;

import com.econgame.entity.GameEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GameEventRepository extends JpaRepository<GameEvent, Long> {
    List<GameEvent> findByRoundNumber(Integer roundNumber);
    List<GameEvent> findByActiveTrue();
    List<GameEvent> findByRoundNumberAndActiveTrue(Integer roundNumber);
}
