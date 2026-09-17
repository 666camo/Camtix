package com.camtix.eventservice.repository;

import com.camtix.eventservice.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByEventId(Long eventId);

    @Query("SELECT t FROM Ticket t WHERE " +
            "(:search IS NULL OR LOWER(t.ticketType) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:eventId IS NULL OR t.eventId = :eventId)")
    Page<Ticket> findWithFilters(
            @Param("search") String search,
            @Param("eventId") Long eventId,
            Pageable pageable
    );

    @Modifying
    @Query("UPDATE Ticket t SET t.stock = t.stock - :quantity WHERE t.idTicket = :idTicket AND t.stock >= :quantity")
    int reduceStockAtomic(@Param("idTicket") Long idTicket, @Param("quantity") int quantity);

    @Modifying
    @Query("UPDATE Ticket t SET t.stock = t.stock + :quantity WHERE t.idTicket = :idTicket")
    int restoreStockAtomic(@Param("idTicket") Long idTicket, @Param("quantity") int quantity);
}
