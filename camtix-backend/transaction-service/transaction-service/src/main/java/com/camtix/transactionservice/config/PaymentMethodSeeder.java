package com.camtix.transactionservice.config;

import com.camtix.transactionservice.entity.PaymentMethod;
import com.camtix.transactionservice.repository.PaymentMethodRepository;
import com.camtix.transactionservice.repository.BookingRepository;
import com.camtix.transactionservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentMethodSeeder implements CommandLineRunner {

    private final PaymentMethodRepository paymentMethodRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public void run(String... args) throws Exception {
        if (paymentMethodRepository.count() > 0) {
            log.info("Payment methods database already has data. Skipping seeder to preserve existing records.");
            return;
        }

        log.info("Resetting transaction database: clearing existing payments, bookings, and payment methods...");
        paymentRepository.deleteAll();
        bookingRepository.deleteAll();
        paymentMethodRepository.deleteAll();

        log.info("Seeding Payment Methods data for presentation...");

        PaymentMethod bca = PaymentMethod.builder()
                .methodName("Transfer Bank - BCA")
                .provider("BCA")
                .accountNumber("8001234567")
                .accountName("PT CamTix Global Transaksi")
                .qrImage("")
                .isActive(true)
                .build();

        PaymentMethod mandiri = PaymentMethod.builder()
                .methodName("Transfer Bank - Mandiri")
                .provider("Mandiri")
                .accountNumber("1234567890123")
                .accountName("PT CamTix Global Transaksi")
                .qrImage("")
                .isActive(true)
                .build();

        PaymentMethod dana = PaymentMethod.builder()
                .methodName("E-Wallet - DANA")
                .provider("DANA")
                .accountNumber("081234567890")
                .accountName("DANA CAMTIX OFFICIAL")
                .qrImage("")
                .isActive(true)
                .build();

        PaymentMethod gopay = PaymentMethod.builder()
                .methodName("E-Wallet - GoPay")
                .provider("GoPay")
                .accountNumber("081234567890")
                .accountName("GOPAY CAMTIX OFFICIAL")
                .qrImage("")
                .isActive(true)
                .build();

        PaymentMethod qris = PaymentMethod.builder()
                .methodName("QRIS")
                .provider("QRIS")
                .accountNumber("000102030405")
                .accountName("CAMTIX MERCHANDISE")
                .qrImage("https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg")
                .isActive(true)
                .build();

        paymentMethodRepository.saveAll(Arrays.asList(bca, mandiri, dana, gopay, qris));
        log.info("Payment Methods successfully seeded for presentation!");
    }
}
