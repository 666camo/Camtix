package com.camtix.eventservice.repository;

import com.camtix.eventservice.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByEventId(Long eventId);

    @Modifying
    @Query("UPDATE Ticket t SET t.stock = t.stock - :quantity WHERE t.idTicket = :idTicket AND t.stock >= :quantity")
    int reduceStockAtomic(@Param("idTicket") Long idTicket, @Param("quantity") int quantity);

    @Modifying
    @Query("UPDATE Ticket t SET t.stock = t.stock + :quantity WHERE t.idTicket = :idTicket")
    int restoreStockAtomic(@Param("idTicket") Long idTicket, @Param("quantity") int quantity);
}
