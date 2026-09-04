package com.camtix.transactionservice.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendETicketEmail(
            String toEmail,
            String bookingCode,
            String eventName,
            String eventDate,
            String city,
            String ticketType,
            int quantity,
            BigDecimal totalPrice) {
        log.info("Preparing e-ticket email for: [{}] - Code: [{}]", toEmail, bookingCode);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🎟️ E-Ticket Resmi CamTix - " + eventName);

            // Premium HTML Email Template
            String htmlContent = "<div style=\"font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px;\">" +
                    "  <div style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);\">" +
                    "    <!-- Header -->" +
                    "    <div style=\"background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 35px 40px; text-align: center;\">" +
                    "      <h1 style=\"color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px;\">CAMTIX</h1>" +
                    "      <p style=\"color: #bfdbfe; margin: 5px 0 0 0; font-size: 14px; font-weight: 500;\">Pembayaran Terverifikasi &amp; E-Ticket Resmi</p>" +
                    "    </div>" +
                    "    " +
                    "    <!-- Ticket Body -->" +
                    "    <div style=\"padding: 40px;\">" +
                    "      <h2 style=\"color: #0f172a; margin: 0 0 10px 0; font-size: 20px; font-weight: 800;\">Halo Penonton Konser! 👋</h2>" +
                    "      <p style=\"color: #475569; margin: 0 0 30px 0; font-size: 14px; line-height: 1.6;\">" +
                    "        Pembayaran Anda telah berhasil diverifikasi oleh sistem. Berikut adalah lembar **E-Ticket Resmi** digital Anda yang harus ditunjukkan saat penukaran gelang/pintu masuk konser." +
                    "      </p>" +
                    "      " +
                    "      <!-- Ticket Pass Layout -->" +
                    "      <div style=\"background: linear-gradient(to bottom, #ffffff, #fafafa); border: 2px dashed #cbd5e1; border-radius: 16px; padding: 25px; margin-bottom: 30px; position: relative;\">" +
                    "        <div style=\"border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 15px;\">" +
                    "          <span style=\"font-size: 10px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 1.5px;\">Nama Konser / Event</span>" +
                    "          <h3 style=\"color: #0f172a; margin: 5px 0 0 0; font-size: 18px; font-weight: 800;\">" + eventName + "</h3>" +
                    "        </div>" +
                    "        " +
                    "        <div style=\"margin-bottom: 15px;\">" +
                    "          <div style=\"display: inline-block; width: 48%; min-width: 120px; margin-bottom: 10px; vertical-align: top;\">" +
                    "            <span style=\"font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;\">Tanggal Konser</span>" +
                    "            <p style=\"margin: 4px 0 0 0; font-size: 13px; font-weight: 700; color: #334155;\">" + eventDate + "</p>" +
                    "          </div>" +
                    "          <div style=\"display: inline-block; width: 48%; min-width: 120px; margin-bottom: 10px; vertical-align: top;\">" +
                    "            <span style=\"font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;\">Kota Lokasi</span>" +
                    "            <p style=\"margin: 4px 0 0 0; font-size: 13px; font-weight: 700; color: #334155;\">📍 " + city + "</p>" +
                    "          </div>" +
                    "        </div>" +
                    "        " +
                    "        <div style=\"border-top: 1px solid #f1f5f9; padding-top: 15px; margin-bottom: 15px;\">" +
                    "          <div style=\"display: inline-block; width: 48%; min-width: 120px; margin-bottom: 10px; vertical-align: top;\">" +
                    "            <span style=\"font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;\">Kategori Tiket</span>" +
                    "            <p style=\"margin: 4px 0 0 0; font-size: 13px; font-weight: 700; color: #2563eb;\">" + ticketType + "</p>" +
                    "          </div>" +
                    "          <div style=\"display: inline-block; width: 48%; min-width: 120px; margin-bottom: 10px; vertical-align: top;\">" +
                    "            <span style=\"font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;\">Jumlah Tiket</span>" +
                    "            <p style=\"margin: 4px 0 0 0; font-size: 13px; font-weight: 700; color: #334155;\">" + quantity + " Tiket</p>" +
                    "          </div>" +
                    "        </div>" +
                    "        " +
                    "        <div style=\"border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center;\">" +
                    "          <span style=\"font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 10px;\">Kode Booking / QR Security</span>" +
                    "          <span style=\"font-family: monospace; font-size: 18px; font-weight: 800; color: #0f172a; background-color: #f1f5f9; padding: 8px 16px; border-radius: 8px; border: 1px solid #cbd5e1; display: inline-block;\">" + bookingCode + "</span>" +
                    "          <div style=\"margin-top: 15px;\">" +
                    "            <img src=\"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + bookingCode + "\" alt=\"QR Code E-Ticket\" style=\"border: 1px solid #cbd5e1; padding: 8px; border-radius: 8px; background-color: #ffffff;\" />" +
                    "          </div>" +
                    "        </div>" +
                    "      </div>" +
                    "      " +
                    "      <div style=\"background-color: #eff6ff; border-radius: 12px; border: 1px solid #bfdbfe; padding: 15px; text-align: left; font-size: 12px; color: #1e3a8a; line-height: 1.5;\">" +
                    "        <strong>💡 PENTING:</strong> E-ticket ini berisikan QR Code unik dan rahasia. Jangan membagikan tangkapan layar (screenshot) kode QR ini kepada siapa pun untuk mencegah penyalahgunaan atau duplikasi tiket." +
                    "      </div>" +
                    "    </div>" +
                    "    " +
                    "    <!-- Footer -->" +
                    "    <div style=\"background-color: #f8fafc; padding: 25px 40px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #64748b;\">" +
                    "      Pesan ini dikirim secara otomatis oleh Layanan Tiket Elektronik CamTix.<br />" +
                    "      &copy; 2026 PT CAMTIX GLOBAL. Seluruh Hak Cipta Dilindungi." +
                    "    </div>" +
                    "  </div>" +
                    "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Successfully sent e-ticket email to {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send e-ticket email to {}", toEmail, e);
        }
    }
}
