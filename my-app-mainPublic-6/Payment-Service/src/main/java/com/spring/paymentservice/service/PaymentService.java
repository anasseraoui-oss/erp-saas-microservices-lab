package com.spring.paymentservice.service;

import com.spring.paymentservice.config.FeignPurch;
import com.spring.paymentservice.config.FeignSales;
import com.spring.paymentservice.config.FeignSupplierClient;
import com.spring.paymentservice.model.DataPaidDate;
import com.spring.paymentservice.model.Methode;
import com.spring.paymentservice.model.Payment;
import com.spring.paymentservice.model.PaymentScheduleStatus;
import com.spring.paymentservice.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static com.spring.paymentservice.model.Status.*;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;
    // You don't need DataPaidDateRepository here if you use Cascade
    // @Autowired
    // private DataPaidDateRepository dateRepository; 
    @Autowired
    private FeignPurch feignPurch;
    @Autowired
    private FeignSales feignSales;
    @Autowired
    private FeignSupplierClient feignSupplierClient;
    @Autowired
    private PaymentStatusCheckService paymentStatusCheckService;

    private static final double LARGE_TRANSACTION_THRESHOLD = 10000.0;

    // THIS IS NOW THE ONLY METHOD FOR CREATING/UPDATING PAYMENTS
    @Transactional
    public Payment updatePayOrder(String orderType, Long orderId, double amount, String currentStatus, String methodePayment, String paymentScheduleStatus, Long supplierClientId, Long userId, double totalAmount, Date dueDate) {


        // This check is good to prevent unnecessary processing for already paid orders.
        if ("PAID".equals(currentStatus)) {
            return null;
        }

        // Find existing payment or create a new one
        Payment paymentToSave = paymentRepository.findPaymentByOrderTypeAndOrderId(orderType, orderId)
                .orElseGet(() -> {
                    Payment newPayment = new Payment();
                    newPayment.setOrderType(orderType);
                    newPayment.setOrderId(orderId);
                    newPayment.setSupplierClientId(supplierClientId);
                    newPayment.setUserCreator(userId);
                    newPayment.setAmountPaid(amount);
                    newPayment.setPaidDates(new ArrayList<>());
                    return newPayment;
                });

        // Update amounts
        double dff =0;
        if (totalAmount != paymentToSave.getTotalAmount()) {
            dff = paymentToSave.getTotalAmount()-totalAmount;
            paymentToSave.setTotalAmount(totalAmount);
        }
        // We add the new amount paid to the existing amount
        paymentToSave.setAmountPaid(paymentToSave.getAmountPaid() + amount);
        paymentToSave.setUserExecutor(userId);
        // Determine the new payment status
        String newPaymentStatus= updateOrderStatusViaFeign(paymentToSave);


        // Update borrowing amount if a payment was made
        if(amount > 0 || dff != 0) {
            if ("sales".equals(paymentToSave.getOrderType())) {
                feignSupplierClient.updateBorrowing(paymentToSave.getSupplierClientId(), amount, "sales", dff);
            } else if ("purchases".equals(paymentToSave.getOrderType())) {
                feignSupplierClient.updateBorrowing(paymentToSave.getSupplierClientId(), amount, "purchases", dff);
            }
        }
        if(amount > 0) {
            // Create a record for this specific payment transaction
            DataPaidDate dataPaidDate = new DataPaidDate();
            dataPaidDate.setAmountPaid(amount);
            dataPaidDate.setDate(new Date());
            dataPaidDate.setUserCreator(userId);
            dataPaidDate.setStatus("PAID".equals(newPaymentStatus) ? FIN : DANS);

            dataPaidDate.setMethodePayment(Methode.valueOf(methodePayment));
            dataPaidDate.setPaymentScheduleStatus(PaymentScheduleStatus.valueOf(paymentScheduleStatus));
            // Link the child to the parent
            dataPaidDate.setPayment(paymentToSave);
            // Link the parent to the child
            paymentToSave.getPaidDates().add(dataPaidDate);
        }

        // Check for large transactions and send a notification
        if (amount > LARGE_TRANSACTION_THRESHOLD) {
            // Delegate notification sending to the centralized service
            paymentStatusCheckService.sendLargeTransactionAlert(paymentToSave, amount);
        }

        // Save the parent. Thanks to CascadeType.ALL, the child (DataPaidDate) will be saved too.
        return paymentRepository.save(paymentToSave);
    }

    // --- GETTER METHODS REMAIN THE SAME ---

    public Payment getPaymentId(String type, int id) {
        // We use .orElse(null) to avoid errors if no payment is found
        return paymentRepository.findPaymentByOrderTypeAndOrderId(type, (long) id).orElse(null);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentByOrderId(String orderType, long orderId) {
        return paymentRepository.findPaymentByOrderTypeAndOrderId(orderType, orderId).orElse(null);
    }
    protected String updateOrderStatusViaFeign(Payment payment) {
        // 1. Determine the new payment status based on amounts
        String newPaymentStatus;
        if (payment.getAmountPaid() >= payment.getTotalAmount()) {
            newPaymentStatus = "PAID";
        } else if (payment.getAmountPaid() > 0) {
            newPaymentStatus = "PARTPAID";
        } else {
            newPaymentStatus = "UNPAID";
        }

        // 2. Update the status in the relevant external service (Sales or Purchases)
        if ("sales".equalsIgnoreCase(payment.getOrderType())) {
            feignSales.updateStatus(payment.getOrderId(), newPaymentStatus);
        } else if ("purchases".equalsIgnoreCase(payment.getOrderType())) {
            // Note: Be careful with Math.toIntExact if orderId can exceed Integer.MAX_VALUE
            feignPurch.updateStatus(payment.getOrderId(), newPaymentStatus);
        }
        return newPaymentStatus;
    }
    @Transactional
    public void recalculateAndUpdatePaymentTotals(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found with id: " + paymentId));
        double newAmountPaid = payment.getPaidDates().stream()
                .filter(detail -> detail.getPaymentScheduleStatus() == PaymentScheduleStatus.PAID)
                .mapToDouble(DataPaidDate::getAmountPaid)
                .sum();
        payment.setAmountPaid(newAmountPaid);
        updateOrderStatusViaFeign(payment);

        paymentRepository.save(payment);
    }
}