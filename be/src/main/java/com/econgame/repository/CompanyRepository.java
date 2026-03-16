package com.econgame.repository;

import com.econgame.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByBankruptFalse();
    Optional<Company> findByOwnerId(Long ownerId);
    boolean existsByOwnerId(Long ownerId);

    @Query("SELECT c FROM Company c WHERE c.bankrupt = false ORDER BY c.budget DESC")
    List<Company> findLeaderboard();
}
