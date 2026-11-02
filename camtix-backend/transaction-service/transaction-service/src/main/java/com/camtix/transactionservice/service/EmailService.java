package com.camtix.transactionservice.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;
    private static final Locale INDONESIAN = Locale.forLanguageTag("id-ID");
    private static final Pattern TOKEN = Pattern.compile("\\{\\{(\\w+)\\}\\}");

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public record TicketEmail(String customerName, String bookingCode, String eventName,
                              String eventDate, String eventTime, String venue, String city,
                              String ticketType, int quantity, BigDecimal totalPrice) {}

    public void sendETicketEmail(String toEmail, TicketEmail ticket) {
        try {
            if (ticket.bookingCode() == null || ticket.bookingCode().isBlank()) {
                throw new IllegalArgumentException("Ticket booking code is required");
            }
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(fromEmail, "CamTix");
            helper.setTo(toEmail);
            helper.setSubject("Tiket " + display(ticket.eventName()).replaceAll("[\\r\\n]", " ") + " | CamTix");
            helper.setText(renderPlainText(ticket), renderHtml(ticket));
            // Inline images must be added after the alternative text/HTML bodies.
            helper.addInline("camtix-ticket-qr", new ByteArrayResource(createQrPng(ticket.bookingCode())), "image/png");
            mailSender.send(message);
            log.info("Successfully sent e-ticket email to {}", toEmail);
        } catch (Exception exception) {
            // Preserve payment confirmation even when the mail server is unavailable.
            log.error("Failed to send e-ticket email to {}", toEmail, exception);
        }
    }

    String renderHtml(TicketEmail ticket) throws java.io.IOException {
        String template;
        try (var stream = new ClassPathResource("templates/email/e-ticket.html").getInputStream()) {
            template = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
        Map<String, String> values = Map.ofEntries(
                Map.entry("customerName", display(ticket.customerName())),
                Map.entry("bookingCode", display(ticket.bookingCode())),
                Map.entry("eventName", display(ticket.eventName())),
                Map.entry("eventDate", formatDate(ticket.eventDate())),
                Map.entry("eventTime", formatTime(ticket.eventTime())),
                Map.entry("venue", display(ticket.venue())),
                Map.entry("city", display(ticket.city())),
                Map.entry("ticketType", display(ticket.ticketType())),
                Map.entry("quantity", Integer.toString(ticket.quantity())),
                Map.entry("totalPrice", formatPrice(ticket.totalPrice())),
                Map.entry("ticketUrl", ticketUrl()),
                Map.entry("year", Year.now().toString()));
        Matcher matcher = TOKEN.matcher(template);
        StringBuilder html = new StringBuilder();
        while (matcher.find()) {
            String value = values.get(matcher.group(1));
            if (value == null) throw new IllegalArgumentException("Unknown email template token: " + matcher.group(1));
            matcher.appendReplacement(html, Matcher.quoteReplacement(HtmlUtils.htmlEscape(value)));
        }
        matcher.appendTail(html);
        return html.toString();
    }

    String renderPlainText(TicketEmail ticket) {
        return "Halo " + display(ticket.customerName()) + ",\n\n"
                + "Pembayaran terkonfirmasi. Tiket konsermu sudah siap.\n\n"
                + "Konser: " + display(ticket.eventName()) + "\n"
                + "Tanggal: " + formatDate(ticket.eventDate()) + "\n"
                + "Jam acara: " + formatTime(ticket.eventTime()) + " (waktu lokal venue)\n"
                + "Venue: " + display(ticket.venue()) + "\nKota: " + display(ticket.city()) + "\n"
                + "Kategori: " + display(ticket.ticketType()) + "\nJumlah: " + ticket.quantity() + " tiket\n"
                + "Total pembayaran: " + formatPrice(ticket.totalPrice()) + "\n"
                + "Kode booking: " + display(ticket.bookingCode()) + "\n\n"
                + "Buka tiket saya: " + ticketUrl() + "\n\n"
                + "Jaga kerahasiaan kode QR dan booking. Siapkan tiket dan identitas pemesan saat masuk venue.\n\nCamTix";
    }

    byte[] createQrPng(String bookingCode) throws Exception {
        BitMatrix matrix = new QRCodeWriter().encode(bookingCode, BarcodeFormat.QR_CODE, 320, 320,
                Map.of(EncodeHintType.CHARACTER_SET, "UTF-8", EncodeHintType.MARGIN, 4));
        BufferedImage image = new BufferedImage(matrix.getWidth(), matrix.getHeight(), BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < matrix.getHeight(); y++) {
            for (int x = 0; x < matrix.getWidth(); x++) {
                image.setRGB(x, y, matrix.get(x, y) ? 0x191a20 : 0xffffff);
            }
        }
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }

    private String ticketUrl() {
        URI base = URI.create(frontendUrl.strip());
        if (!("https".equalsIgnoreCase(base.getScheme()) || "http".equalsIgnoreCase(base.getScheme()))
                || base.getHost() == null || base.getRawUserInfo() != null
                || base.getRawQuery() != null || base.getRawFragment() != null) {
            throw new IllegalArgumentException("frontend.url must be an HTTP(S) site URL");
        }
        return base.toString().replaceAll("/+$", "") + "/history";
    }

    private static String display(String value) {
        return value == null || value.isBlank() ? "Belum tersedia" : value.strip();
    }

    private static String formatDate(String value) {
        if (value == null || value.isBlank()) return "Belum tersedia";
        try { return LocalDate.parse(value).format(DateTimeFormatter.ofPattern("EEEE, d MMMM uuuu", INDONESIAN)); }
        catch (DateTimeParseException exception) { return value; }
    }

    private static String formatTime(String value) {
        if (value == null || value.isBlank()) return "Belum tersedia";
        try { return LocalTime.parse(value).format(DateTimeFormatter.ofPattern("HH.mm")); }
        catch (DateTimeParseException exception) { return value; }
    }

    private static String formatPrice(BigDecimal value) {
        if (value == null) return "Belum tersedia";
        NumberFormat currency = NumberFormat.getCurrencyInstance(INDONESIAN);
        currency.setMaximumFractionDigits(0);
        currency.setMinimumFractionDigits(0);
        return currency.format(value);
    }
}
