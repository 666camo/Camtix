package com.camtix.transactionservice.repository;

import com.camtix.transactionservice.entity.PaymentMethod;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByIsActiveTrue();

    @Query("SELECT p FROM PaymentMethod p WHERE " +
            "(:search IS NULL OR LOWER(p.methodName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.provider) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:isActive IS NULL OR p.isActive = :isActive)")
    Page<PaymentMethod> findWithFilters(
            @Param("search") String search,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );
}
