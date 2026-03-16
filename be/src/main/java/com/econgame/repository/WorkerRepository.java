package com.econgame.repository;

import com.econgame.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface WorkerRepository extends JpaRepository<Worker, Long> {

    Optional<Worker> findByUserIdAndLeftAtIsNull(Long userId);

    List<Worker> findByCompanyIdAndLeftAtIsNull(Long companyId);

    @Query("SELECT COUNT(w) FROM Worker w WHERE w.company.id = :companyId AND w.leftAt IS NULL")
    int countActiveByCompanyId(@Param("companyId") Long companyId);

    @Query("SELECT COUNT(w) FROM Worker w WHERE w.leftAt IS NULL")
    int countAllActive();

    @Query("SELECT COUNT(w) FROM Worker w WHERE w.company IS NULL AND w.leftAt IS NULL")
    int countUnemployed();

    List<Worker> findByLeftAtIsNull();

    @Query("SELECT w FROM Worker w WHERE w.company IS NULL AND w.leftAt IS NULL")
    List<Worker> findUnemployed();
}
