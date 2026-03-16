package com.econgame.repository;

import com.econgame.entity.StrikeVote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface StrikeVoteRepository extends JpaRepository<StrikeVote, Long> {
    Optional<StrikeVote> findByCompanyIdAndRoundNumberAndResolvedFalse(Long companyId, Integer roundNumber);
    List<StrikeVote> findByRoundNumberAndResolvedFalse(Integer roundNumber);
}
