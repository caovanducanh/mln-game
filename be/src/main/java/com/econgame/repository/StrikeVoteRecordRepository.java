package com.econgame.repository;

import com.econgame.entity.StrikeVoteRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StrikeVoteRecordRepository extends JpaRepository<StrikeVoteRecord, Long> {
    boolean existsByStrikeVoteIdAndWorkerId(Long strikeVoteId, Long workerId);
    List<StrikeVoteRecord> findByStrikeVoteId(Long strikeVoteId);
    int countByStrikeVoteIdAndVoteTrue(Long strikeVoteId);
    int countByStrikeVoteIdAndVoteFalse(Long strikeVoteId);
}
