package com.eraoui.notificationservice.service;

import com.eraoui.notificationservice.model.Notification;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import com.eraoui.notificationservice.repository.SandRepository;
import com.eraoui.notificationservice.model.Sand;
import java.util.List;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private SandRepository sandRepository;
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message); // This is correct for SimpleMailMessage
            logger.info("Email sent successfully to: {}", to);

        } catch (Exception e) {
            logger.error("Failed to send email to: {}", to, e);
            throw new RuntimeException("Email sending failed", e);
        }
    }
    @Transactional
    public boolean sendEmail(Notification notification) {
        try {
            List<Sand> recipients = sandRepository.findBySandType(notification.getType());
            if (recipients.isEmpty()) {
                logger.warn("No recipients found for notification type: {}", notification.getNotificationType());
                return false;
            }
            boolean allSent = true;
            for (Sand recipient : recipients) {
                try {
                    if (notification.isAppointment() || notification.getNotificationType() == recipient.getNotificationType()) {
                        sendEmail(recipient.getEmail(), notification.getSubject(), notification.getMessage());
                    }
                    // notification.getSubscribers().add(recipient);
                } catch (Exception e) {
                    logger.error("Failed to send email to individual recipient: {}", recipient.getEmail(), e);
                    allSent = false;
                }
            }
            return allSent;
        } catch (Exception e) {
            logger.error("An unexpected error occurred during the email sending process: {}", e.getMessage());
            return false;
        }
    }
}