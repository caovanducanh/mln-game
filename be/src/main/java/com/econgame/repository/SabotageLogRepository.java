package com.econgame.repository;

import com.econgame.entity.SabotageLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SabotageLogRepository extends JpaRepository<SabotageLog, Long> {
    int countByAttackerIdAndRoundNumber(Long attackerId, Integer roundNumber);
    int countByAttackerId(Long attackerId);
}
