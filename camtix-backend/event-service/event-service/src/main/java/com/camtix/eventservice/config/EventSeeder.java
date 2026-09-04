package com.camtix.eventservice.config;

import com.camtix.eventservice.entity.Event;
import com.camtix.eventservice.entity.Ticket;
import com.camtix.eventservice.repository.EventRepository;
import com.camtix.eventservice.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventSeeder implements CommandLineRunner {

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;

    private String generateSlug(String text) {
        if (text == null) return "";
        return text.trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    @Override
    public void run(String... args) throws Exception {
        if (eventRepository.count() > 0) {
            log.info("Event database already has data. Skipping seeder to preserve existing events.");
            return;
        }

        log.info("Resetting event/ticket database: clearing existing tickets and events...");
        ticketRepository.deleteAll();
        eventRepository.deleteAll();

        log.info("Seeding Concert Event & Ticket data for presentation...");

        // 1. NIKI
        Event niki = Event.builder()
                .eventName("NIKI - Buzz World Tour 2026")
                .artistName("NIKI")
                .city("Jakarta")
                .location("Beach City International Stadium")
                .eventDate(LocalDate.of(2026, 8, 10))
                .eventTime("19:30")
                .category("Concert")
                .description("The global sensation NIKI is returning to Jakarta for her highly anticipated Buzz World Tour. Experience her soulful indie-pop hits and acoustic melodies live!")
                .picture("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800")
                .status("UPCOMING")
                .slug(generateSlug("NIKI - Buzz World Tour 2026"))
                .build();

        // 2. SEVENTEEN
        Event seventeen = Event.builder()
                .eventName("SEVENTEEN - Right Here World Tour 2026")
                .artistName("SEVENTEEN")
                .city("Tangerang")
                .location("ICE BSD Hall 1-4")
                .eventDate(LocalDate.of(2026, 10, 5))
                .eventTime("18:30")
                .category("Concert")
                .description("Prepare for an explosive, high-energy night with the 13 members of SEVENTEEN. Featuring breathtaking choreographies, synchronization, and unforgettable fan interaction!")
                .picture("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800")
                .status("UPCOMING")
                .slug(generateSlug("SEVENTEEN - Right Here World Tour 2026"))
                .build();

        // 3. Wave to Earth
        Event waveToEarth = Event.builder()
                .eventName("Wave to Earth - Play with Earth Tour 2026")
                .artistName("Wave to Earth")
                .city("Bandung")
                .location("Sasana Budaya Ganesha")
                .eventDate(LocalDate.of(2026, 11, 20))
                .eventTime("20:00")
                .category("Concert")
                .description("The indie-lofi jazz rock band Wave to Earth is coming to Bandung! An intimate evening with dreamy guitar riffs, soothing bass lines, and romantic melodies.")
                .picture("https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800")
                .status("UPCOMING")
                .slug(generateSlug("Wave to Earth - Play with Earth Tour 2026"))
                .build();

        // 4. Bruno Mars
        Event brunoMars = Event.builder()
                .eventName("Bruno Mars - Live in Jakarta 2026")
                .artistName("Bruno Mars")
                .city("Jakarta")
                .location("Jakarta International Stadium (JIS)")
                .eventDate(LocalDate.of(2026, 12, 15))
                .eventTime("20:00")
                .category("Concert")
                .description("The 24K Magic is back! Multi-Grammy award winner Bruno Mars returns to Jakarta for a massive stadium show. Sing along to Uptown Funk, Just the Way You Are, and more!")
                .picture("https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=800")
                .status("UPCOMING")
                .slug(generateSlug("Bruno Mars - Live in Jakarta 2026"))
                .build();

        eventRepository.saveAll(Arrays.asList(niki, seventeen, waveToEarth, brunoMars));

        // Tickets for NIKI
        Ticket nikiFestival = Ticket.builder()
                .eventId(niki.getIdEvent())
                .ticketType("FESTIVAL (Free Standing)")
                .price(new BigDecimal("1500000"))
                .stock(150)
                .description("Free standing area in front of the stage.")
                .build();

        Ticket nikiVip = Ticket.builder()
                .eventId(niki.getIdEvent())
                .ticketType("VIP EXPERIENCE")
                .price(new BigDecimal("2800000"))
                .stock(50)
                .description("Includes early entry, exclusive merchandise, and prime view near the barrier.")
                .build();

        // Tickets for SEVENTEEN
        Ticket svtCat1 = Ticket.builder()
                .eventId(seventeen.getIdEvent())
                .ticketType("CAT 1 (Numbered Seating)")
                .price(new BigDecimal("1800000"))
                .stock(100)
                .description("Standard numbered seats in the main gallery.")
                .build();

        Ticket svtVip = Ticket.builder()
                .eventId(seventeen.getIdEvent())
                .ticketType("VIP EXPERIENCE (Standing)")
                .price(new BigDecimal("3500000"))
                .stock(60)
                .description("Includes soundcheck access, VIP laminate, early entry, and closest view of the extended stage.")
                .build();

        // Tickets for Wave to Earth
        Ticket wteGa = Ticket.builder()
                .eventId(waveToEarth.getIdEvent())
                .ticketType("GENERAL ADMISSION")
                .price(new BigDecimal("850000"))
                .stock(150)
                .description("General admission standing/seating inside Sabuga Hall.")
                .build();

        Ticket wteVip = Ticket.builder()
                .eventId(waveToEarth.getIdEvent())
                .ticketType("VIP PACKAGE")
                .price(new BigDecimal("1500000"))
                .stock(40)
                .description("Includes Meet & Greet, group photo, signed poster, and priority entrance.")
                .build();

        // Tickets for Bruno Mars
        Ticket bmCat2 = Ticket.builder()
                .eventId(brunoMars.getIdEvent())
                .ticketType("CAT 2 (Seating)")
                .price(new BigDecimal("2000000"))
                .stock(100)
                .description("Standard tier seating with a full view of the stage.")
                .build();

        Ticket bmFestival = Ticket.builder()
                .eventId(brunoMars.getIdEvent())
                .ticketType("FESTIVAL (Standing)")
                .price(new BigDecimal("3500000"))
                .stock(120)
                .description("Main floor standing area in the center of the stadium.")
                .build();

        Ticket bmVip = Ticket.builder()
                .eventId(brunoMars.getIdEvent())
                .ticketType("VIP GOLD PACKAGE")
                .price(new BigDecimal("7500000"))
                .stock(30)
                .description("Premium VIP lounge access, official program, custom merchandise, and reserved prime seating.")
                .build();

        ticketRepository.saveAll(Arrays.asList(nikiFestival, nikiVip, svtCat1, svtVip, wteGa, wteVip, bmCat2, bmFestival, bmVip));
        log.info("Concert Events & Tickets successfully seeded for presentation!");
    }
}
