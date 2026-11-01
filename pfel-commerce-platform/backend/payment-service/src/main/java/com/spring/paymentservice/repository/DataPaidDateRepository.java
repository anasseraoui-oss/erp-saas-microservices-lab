package com.spring.paymentservice.repository;

import com.spring.paymentservice.model.DataPaidDate;
import com.spring.paymentservice.model.PaymentScheduleStatus;
import com.spring.paymentservice.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface DataPaidDateRepository extends JpaRepository<DataPaidDate, Long> {
    List<DataPaidDate> findByStatus(Status status);

    List<DataPaidDate> findByPaymentScheduleStatus(PaymentScheduleStatus paymentScheduleStatus);

    List<DataPaidDate> findByUserExecutor(Long userExecutor);

    List<DataPaidDate> findByDateBetween(Date startOfDay, Date endOfDay);

    List<DataPaidDate> findByDate(Date date);
}
