package com.spring.paymentservice.service;
// DataPaidDateService.java
import com.spring.paymentservice.DTO.DataPaidDateDto;
import com.spring.paymentservice.model.DataPaidDate;
import com.spring.paymentservice.model.Payment;
import com.spring.paymentservice.model.PaymentScheduleStatus;
import com.spring.paymentservice.repository.DataPaidDateRepository;
import com.spring.paymentservice.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class DataPaidDateService {

    @Autowired
    private DataPaidDateRepository dataPaidDateRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private PaymentService paymentService;
    public List<DataPaidDate> getAll() {
        return dataPaidDateRepository.findAll();
    }
    public DataPaidDate getById(Long id) {
        return dataPaidDateRepository.findById(id).get();
    }
    public void deleteById(Long id) {
        DataPaidDate dataPaidDate = dataPaidDateRepository.findById(id).get();
        Payment payment = dataPaidDate.getPayment();
        if (payment != null) {
            payment.setAmountPaid(payment.getAmountPaid() - dataPaidDate.getAmountPaid());
            paymentService.updateOrderStatusViaFeign(payment);
            paymentRepository.save(payment);

        }
        dataPaidDateRepository.deleteById(id);
    }
    public DataPaidDate create(DataPaidDateDto dto) {
        // 1. Find the parent Payment entity
        Payment parentPayment = paymentRepository.findById(dto.getPaymentId()) // Assuming DTO has parent ID
                .orElseThrow(() -> new IllegalArgumentException("Payment not found with id: " + dto.getPaymentId()));

        // 2. Create a new DataPaidDate entity
        DataPaidDate newDataPaidDate = new DataPaidDate();

        // 3. Map the DTO to the new entity
        mapDtoToEntity(dto, newDataPaidDate, parentPayment);

        // 4. Recalculate totals for the parent payment
        if(dto.getPaymentScheduleStatus() == PaymentScheduleStatus.PAID) {
            paymentService.recalculateAndUpdatePaymentTotals(parentPayment.getId());
        }
        // 5. Save and return the new entity
        return dataPaidDateRepository.save(newDataPaidDate);
    }
        // THIS IS THE NEW UPDATE METHOD
        public DataPaidDate update(Long id, DataPaidDateDto dto) {
            // 1. Find the existing entity in the database
            DataPaidDate existingDataPaidDate = dataPaidDateRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("DataPaidDate not found with id: " + id));
            Payment parentPayment = existingDataPaidDate.getPayment();
            if (parentPayment == null) {
                throw new IllegalStateException("DataPaidDate with id " + id + " is not linked to any parent Payment.");
            }

            // 2. Map the updated DTO fields onto the existing entity
            // We pass 'null' for payment because the parent payment link should not change during an update.
            mapDtoToEntity(dto, existingDataPaidDate, null);
            if(dto.getPaymentScheduleStatus() == PaymentScheduleStatus.PAID && existingDataPaidDate.getPaymentScheduleStatus() != PaymentScheduleStatus.PAID) {
                paymentService.recalculateAndUpdatePaymentTotals(parentPayment.getId());
            }
            if(dto.getPaymentScheduleStatus() == PaymentScheduleStatus.FAILED && existingDataPaidDate.getPaymentScheduleStatus() == PaymentScheduleStatus.PAID) {
                parentPayment.setAmountPaid(parentPayment.getAmountPaid() - existingDataPaidDate.getAmountPaid());
                paymentService.updateOrderStatusViaFeign(parentPayment);
                paymentRepository.save(parentPayment);
            }
                // 3. Save the updated entity
            return dataPaidDateRepository.save(existingDataPaidDate);

        }

        // Helper method to avoid duplicate code
        private void mapDtoToEntity(DataPaidDateDto dto, DataPaidDate entity, Payment payment) {
            entity.setDate(dto.getDate());
            entity.setAmountPaid(dto.getAmountPaid());
            entity.setStatus(dto.getStatus());
            entity.setMethodePayment(dto.getMethodePayment());
            entity.setPaymentScheduleStatus(dto.getPaymentScheduleStatus());
            entity.setUserExecutor(dto.getUserExecutor());

            // Only set creator and parent payment on creation
            if (payment != null) {
                entity.setPayment(payment);
                entity.setUserCreator(dto.getUserCreator());
            }
        }


        public List<DataPaidDate> getByStatus(String status) {
        return dataPaidDateRepository.findByStatus(Enum.valueOf(com.spring.paymentservice.model.Status.class, status));
    }

    public List<DataPaidDate> getByPaymentScheduleStatus(String scheduleStatus) {
        return dataPaidDateRepository.findByPaymentScheduleStatus(
                Enum.valueOf(com.spring.paymentservice.model.PaymentScheduleStatus.class, scheduleStatus));
    }

    public List<DataPaidDate> getByUserExecutor(Long userId) {
        return dataPaidDateRepository.findByUserExecutor(userId);
    }

    public List<DataPaidDate> getByDate(Date date) {
        return dataPaidDateRepository.findByDate(date);
    }

    // Add more filters if needed
}
