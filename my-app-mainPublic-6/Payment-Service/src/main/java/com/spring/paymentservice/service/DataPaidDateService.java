package com.spring.paymentservice.service;
// DataPaidDateService.java
import com.spring.paymentservice.DTO.DataPaidDateDto;
import com.spring.paymentservice.model.DataPaidDate;
import com.spring.paymentservice.model.Payment;
import com.spring.paymentservice.model.PaymentScheduleStatus;
import com.spring.paymentservice.repository.DataPaidDateRepository;
import com.spring.paymentservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DataPaidDateService {

    @Autowired
    private DataPaidDateRepository dataPaidDateRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private PaymentService paymentService;
    @Autowired
    private PaymentStatusCheckService paymentStatusCheckService;
    public List<DataPaidDate> getAll() {
        return dataPaidDateRepository.findAll();
    }
    public DataPaidDate getById(Long id) {
        return dataPaidDateRepository.findById(id).get();
    }
    @Transactional
    public void deleteById(Long id) {
        // 1. Find the entity to be deleted
        DataPaidDate dataPaidDateToDelete = dataPaidDateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("DataPaidDate not found with id: " + id));

        // 2. Get the parent payment
        Payment payment = dataPaidDateToDelete.getPayment();

        // 3. If a parent exists, update its state before deleting the child
        if (payment != null) {
            // Remove the child from the parent's collection to keep the object model consistent
            payment.getPaidDates().remove(dataPaidDateToDelete);

            // Manually recalculate the amount from the now-consistent collection
            double newAmountPaid = payment.getPaidDates().stream()
                    .filter(detail -> detail.getPaymentScheduleStatus() == PaymentScheduleStatus.PAID)
                    .mapToDouble(DataPaidDate::getAmountPaid)
                    .sum();
            payment.setAmountPaid(newAmountPaid);

            // Update the order status via Feign
            paymentService.updateOrderStatusViaFeign(payment);

            // The payment entity is managed and will be saved at the end of the transaction.
        }

        // 4. Finally, delete the entity.
        dataPaidDateRepository.delete(dataPaidDateToDelete);

        // 5. Delegate notification sending to the centralized service
        paymentStatusCheckService.sendPartialPaymentDeletedAlert(dataPaidDateToDelete);

    }
    @Transactional
    public DataPaidDate create(DataPaidDateDto dto) {
        // 1. Find the parent Payment entity
        Payment parentPayment = paymentRepository.findById(dto.getPaymentId()) // Assuming DTO has parent ID
                .orElseThrow(() -> new IllegalArgumentException("Payment not found with id: " + dto.getPaymentId()));

        // 2. Create a new DataPaidDate entity
        DataPaidDate newDataPaidDate = new DataPaidDate();

        // 3. Map the DTO to the new entity
        mapDtoToEntity(dto, newDataPaidDate, parentPayment);

        // 4. Save the new entity first to make it visible for recalculation
        DataPaidDate savedDataPaidDate = dataPaidDateRepository.save(newDataPaidDate);

        // 5. Recalculate totals for the parent payment, which now includes the new data
        paymentService.recalculateAndUpdatePaymentTotals(parentPayment.getId());

        // 6. Return the newly created and saved entity
        return savedDataPaidDate;
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

                // Delegate notification sending to the centralized service
                paymentStatusCheckService.sendPaymentStatusRevertedAlert(existingDataPaidDate);
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
