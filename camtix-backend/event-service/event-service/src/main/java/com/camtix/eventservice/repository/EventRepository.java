package com.camtix.eventservice.repository;

import com.camtix.eventservice.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

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

    List<Event> findByEventDateBeforeAndStatusNotIn(LocalDate date, List<String> statuses);

    java.util.Optional<Event> findBySlug(String slug);
}
