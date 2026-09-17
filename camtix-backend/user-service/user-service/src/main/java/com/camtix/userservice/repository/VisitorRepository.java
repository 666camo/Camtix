package com.camtix.userservice.repository;

import com.camtix.userservice.entity.Visitor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    @Query("SELECT v FROM Visitor v WHERE " +
            "(:search IS NULL OR LOWER(v.activity) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Visitor> findWithFilters(@Param("search") String search, Pageable pageable);
}
