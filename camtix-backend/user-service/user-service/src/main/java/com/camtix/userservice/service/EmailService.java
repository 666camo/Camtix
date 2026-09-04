package com.camtix.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${email.queue.name}")
    private String queueName;

    @Async
    public void sendOtpEmail(String toEmail, String otpCode) {
        log.info("========================================");
        log.info("OTP Code for {}: [{}]", toEmail, otpCode);
        log.info("========================================");
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("CamTix Account Verification OTP Code");
            message.setText("Dear User,\n\n" +
                    "Thank you for registering an account on CamTix!\n" +
                    "Your verification OTP code is: " + otpCode + "\n\n" +
                    "This code will expire in 5 minutes.\n" +
                    "Please do not share this OTP with anyone.\n\n" +
                    "Best regards,\n" +
                    "CamTix Ticketing Team");

            mailSender.send(message);
            log.info("Successfully sent OTP email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", toEmail, e);
            throw new RuntimeException("Email delivery failed: " + e.getMessage());
        }
    }

    @Async
    public void sendResetPasswordEmail(String toEmail, String token, String resetLink) {
        log.info("========================================");
        log.info("Reset Password Link for {}: {}", toEmail, resetLink);
        log.info("========================================");
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Permintaan Reset Kata Sandi Akun CamTix / Password Reset Request");
            message.setText("Halo / Hello,\n\n" +
                    "Kami menerima permintaan untuk mereset kata sandi akun CamTix Anda.\n" +
                    "We received a request to reset your CamTix account password.\n\n" +
                    "--------------------------------------------------\n" +
                    "CARA 1: KLIK LINK DI BAWAH (Otomatis):\n" +
                    resetLink + "\n\n" +
                    "CARA 2: MASUKKAN KODE TOKEN SECARA MANUAL:\n" +
                    "Kode Token: " + token + "\n" +
                    "Buka halaman: " + resetLink.split("\\?")[0] + "\n" +
                    "Lalu tempelkan kode token di atas ke form yang tersedia.\n" +
                    "--------------------------------------------------\n\n" +
                    "Catatan: Link dan kode token ini hanya berlaku selama 15 menit.\n" +
                    "Note: This link and token will expire in 15 minutes.\n\n" +
                    "Jika Anda tidak pernah meminta reset kata sandi, abaikan email ini.\n" +
                    "If you did not request this, please ignore this email.\n\n" +
                    "Salam hangat / Best regards,\n" +
                    "CamTix Ticketing Solutions Indonesia");

            mailSender.send(message);
            log.info("Successfully sent reset password email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send reset password email to {}", toEmail, e);
            throw new RuntimeException("Email delivery failed: " + e.getMessage());
        }
    }

    @RabbitListener(queues = "camtix.email.queue")
    @Async
    public void receiveEmailMessage(String jsonMessage) {
        log.info("Receive async email task from RabbitMQ: {}", jsonMessage);
        try {
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.Map<String, String> map = objectMapper.readValue(jsonMessage, java.util.Map.class);
            String to = map.get("to");
            String subject = map.get("subject");
            String messageBody = map.get("message");

            if (to != null && subject != null) {
                sendGenericEmail(to, subject, messageBody);
            }
        } catch (Exception e) {
            log.error("Failed to process RabbitMQ email message: {}", jsonMessage, e);
        }
    }

    @Async
    public void sendGenericEmail(String toEmail, String subject, String messageBody) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(messageBody);

            mailSender.send(message);
            log.info("Successfully sent generic email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send generic email to {}", toEmail, e);
        }
    }
}

