package com.spring.paymentservice.controller;
// DataPaidDateController.java
import com.spring.paymentservice.DTO.DataPaidDateDto;
import com.spring.paymentservice.model.DataPaidDate;
import com.spring.paymentservice.service.DataPaidDateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
@PreAuthorize("isAuthenticated()")
@RestController
@RequestMapping("/api/dataPaidDates")
public class DataPaidDateController {

    @Autowired
    private DataPaidDateService dataPaidDateService;

    @GetMapping
    public List<DataPaidDate> getAll() {
        return dataPaidDateService.getAll();
    }

    @PostMapping
    public ResponseEntity<DataPaidDate> create(@RequestBody DataPaidDateDto dto) {
        // Explicitly for creating a new entity. You'll need a 'create' method in your service.
        DataPaidDate created = dataPaidDateService.create(dto); // Assumes you have a create method
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DataPaidDate> update(@PathVariable Long id, @RequestBody DataPaidDateDto dto) {
        // Explicitly for updating an existing entity
        DataPaidDate updated = dataPaidDateService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        dataPaidDateService.deleteById(id);
    }
    @PreAuthorize("hasAuthority('VIEW_PAYMENT_HISTORY') or hasRole('ADMIN')")
    @GetMapping("/by-status/{status}")
    public List<DataPaidDate> getByStatus(@PathVariable String status) {
        return dataPaidDateService.getByStatus(status.toUpperCase());
    }
    @PreAuthorize("hasAuthority('VIEW_PAYMENT_HISTORY') or hasRole('ADMIN')")
    @GetMapping("/by-schedule-status/{scheduleStatus}")
    public List<DataPaidDate> getByPaymentScheduleStatus(@PathVariable String scheduleStatus) {
        return dataPaidDateService.getByPaymentScheduleStatus(scheduleStatus.toUpperCase());
    }
    @PreAuthorize("hasAuthority('VIEW_PAYMENT_HISTORY') or hasRole('ADMIN')")
    @GetMapping("/by-user-executor/{userId}")
    public List<DataPaidDate> getByUserExecutor(@PathVariable Long userId) {
        return dataPaidDateService.getByUserExecutor(userId);
    }
    @PreAuthorize("hasAuthority('VIEW_PAYMENT_HISTORY') or hasRole('ADMIN')")
    @GetMapping("/by-date")
    public List<DataPaidDate> getByDate(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date date) {
        return dataPaidDateService.getByDate(date);
    }
}
