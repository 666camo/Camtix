package com.camtix.eventservice.repository;

import com.camtix.eventservice.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("SELECT e FROM Event e WHERE " +
            "((CAST(:eventName AS string) IS NULL AND CAST(:artistName AS string) IS NULL) OR " +
            " (CAST(:eventName AS string) IS NOT NULL AND LOWER(e.eventName) LIKE LOWER(CONCAT('%', CAST(:eventName AS string), '%'))) OR " +
            " (CAST(:artistName AS string) IS NOT NULL AND LOWER(e.artistName) LIKE LOWER(CONCAT('%', CAST(:artistName AS string), '%')))) AND " +
            "(CAST(:city AS string) IS NULL OR LOWER(e.city) LIKE LOWER(CONCAT('%', CAST(:city AS string), '%'))) AND " +
            "(CAST(:category AS string) IS NULL OR LOWER(e.category) LIKE LOWER(CONCAT('%', CAST(:category AS string), '%')))")
    List<Event> searchEvents(
            @Param("eventName") String eventName,
            @Param("artistName") String artistName,
            @Param("city") String city,
            @Param("category") String category
    );

    @Query("SELECT e FROM Event e WHERE " +
            "(:search IS NULL OR " +
            " LOWER(e.eventName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(e.artistName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(e.city) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(e.category) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:status IS NULL OR e.status = :status) AND " +
            "(:category IS NULL OR LOWER(e.category) = LOWER(:category)) AND " +
            "(:city IS NULL OR LOWER(e.city) = LOWER(:city)) AND " +
            "(CAST(:startDate AS date) IS NULL OR e.eventDate >= :startDate) AND " +
            "(CAST(:endDate AS date) IS NULL OR e.eventDate <= :endDate)")
    Page<Event> findWithFilters(
            @Param("search") String search,
            @Param("status") String status,
            @Param("category") String category,
            @Param("city") String city,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );

    List<Event> findByEventDateBeforeAndStatusNotIn(LocalDate date, List<String> statuses);

    Optional<Event> findBySlug(String slug);
}
