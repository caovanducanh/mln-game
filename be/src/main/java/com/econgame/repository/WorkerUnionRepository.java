package com.econgame.repository;

import com.econgame.entity.WorkerUnion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface WorkerUnionRepository extends JpaRepository<WorkerUnion, Long> {
    Optional<WorkerUnion> findByCompanyIdAndStatus(Long companyId, String status);
    List<WorkerUnion> findByCompanyId(Long companyId);
}
