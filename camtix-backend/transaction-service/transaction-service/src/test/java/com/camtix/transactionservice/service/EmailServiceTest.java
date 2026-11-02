package com.camtix.transactionservice.service;

import com.google.zxing.BinaryBitmap;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.RGBLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import jakarta.mail.BodyPart;
import jakarta.mail.Multipart;
import jakarta.mail.Part;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmailServiceTest {
    private JavaMailSender sender;
    private EmailService service;

    @BeforeEach
    void setUp() {
        sender = mock(JavaMailSender.class);
        service = new EmailService(sender);
        ReflectionTestUtils.setField(service, "fromEmail", "tickets@example.com");
        ReflectionTestUtils.setField(service, "frontendUrl", "https://camtix.vercel.app/");
    }

    private EmailService.TicketEmail sample() {
        return new EmailService.TicketEmail("Nadia Putri", "CTX-DEMO-2027", "Live Session Jakarta",
                "2027-05-20", "19:00:00", "Music Hall", "Jakarta", "Regular", 2, new BigDecimal("300000"));
    }

    @Test
    void rendersReadableDetailsAndEscapesHtmlValues() throws Exception {
        var ticket = new EmailService.TicketEmail("Nadia <script>alert(1)</script>", "CTX<&123",
                "Jazz & Friends", "2027-05-20", "19:00:00", "Hall <A>", "Jakarta", "Regular", 2, new BigDecimal("300000"));
        String html = service.renderHtml(ticket);
        assertTrue(html.contains("Nadia &lt;script&gt;"));
        assertFalse(html.contains("<script>"));
        assertTrue(html.contains("Jazz &amp; Friends"));
        assertTrue(html.contains("20 Mei 2027"));
        assertTrue(html.contains("19.00"));
        assertTrue(html.contains("Hall &lt;A&gt;"));
        assertTrue(html.contains("300.000"));
        assertTrue(html.contains("href=\"https://camtix.vercel.app/history\""));
        assertFalse(html.contains("{{"));
        assertFalse(html.contains("api.qrserver"));
        assertFalse(html.contains("**"));
    }

    @Test
    void generatesOneMultipartEmailWithDecodableInlineQrAndTextFallback() throws Exception {
        MimeMessage message = new MimeMessage(Session.getInstance(new Properties()));
        when(sender.createMimeMessage()).thenReturn(message);
        service.sendETicketEmail("preview@example.com", sample());
        verify(sender, times(1)).send(message);
        message.saveChanges();
        List<Part> parts = new ArrayList<>();
        collectParts(message, parts);
        Part htmlPart = parts.stream().filter(part -> mimeIs(part, "text/html")).findFirst().orElseThrow();
        Part plainPart = parts.stream().filter(part -> mimeIs(part, "text/plain")).findFirst().orElseThrow();
        Part qrPart = parts.stream().filter(part -> mimeIs(part, "image/png")).findFirst().orElseThrow();
        String html = (String) htmlPart.getContent();
        assertTrue(html.contains("cid:camtix-ticket-qr"));
        assertTrue(((String) plainPart.getContent()).contains("https://camtix.vercel.app/history"));
        assertTrue(((String) plainPart.getContent()).contains("CTX-DEMO-2027"));
        assertEquals("<camtix-ticket-qr>", qrPart.getHeader("Content-ID")[0]);
        assertEquals(Part.INLINE, qrPart.getDisposition());
        byte[] bytes = qrPart.getInputStream().readAllBytes();
        BufferedImage qr = ImageIO.read(new ByteArrayInputStream(bytes));
        assertEquals(320, qr.getWidth());
        assertEquals(0xffffff, qr.getRGB(0, 0) & 0xffffff);
        int[] pixels = qr.getRGB(0, 0, qr.getWidth(), qr.getHeight(), null, 0, qr.getWidth());
        var bitmap = new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(qr.getWidth(), qr.getHeight(), pixels)));
        assertEquals("CTX-DEMO-2027", new MultiFormatReader().decode(bitmap).getText());

        Path preview = Path.of("target", "email-preview");
        Files.createDirectories(preview);
        Files.writeString(preview.resolve("e-ticket.html"), html.replace("cid:camtix-ticket-qr", "data:image/png;base64," + Base64.getEncoder().encodeToString(bytes)), StandardCharsets.UTF_8);
        try (var output = Files.newOutputStream(preview.resolve("e-ticket.eml"))) { message.writeTo(output); }
    }

    @Test
    void missingMetadataDoesNotInventVenueOrTime() throws Exception {
        var ticket = new EmailService.TicketEmail(null, "CTX-123", "Concert", null, null, null, null, null, 1, null);
        String html = service.renderHtml(ticket);
        assertTrue(html.contains("Belum tersedia"));
        assertFalse(html.contains("Stadium Arena"));
        assertFalse(html.contains("19.00"));
        assertFalse(html.contains("VIP"));
    }

    @Test
    void replacementValuesCannotIntroduceAnotherTemplateToken() throws Exception {
        var ticket = new EmailService.TicketEmail("Customer {{eventName}}", "CTX-123", "Concert", null, null, null, null, "Regular", 1, BigDecimal.ZERO);
        assertTrue(service.renderHtml(ticket).contains("Customer {{eventName}}"));
    }

    @Test
    void rejectsNonHttpTicketLinksBeforeSendingMail() {
        ReflectionTestUtils.setField(service, "frontendUrl", "javascript:alert(1)");
        assertThrows(IllegalArgumentException.class, () -> service.renderHtml(sample()));
        verifyNoInteractions(sender);
    }

    private static boolean mimeIs(Part part, String type) {
        try { return part.isMimeType(type); }
        catch (Exception exception) { throw new AssertionError(exception); }
    }

    private static void collectParts(Part part, List<Part> parts) throws Exception {
        if (part.getContent() instanceof Multipart multipart) {
            for (int index = 0; index < multipart.getCount(); index++) {
                BodyPart child = multipart.getBodyPart(index);
                collectParts(child, parts);
            }
        } else { parts.add(part); }
    }
}
