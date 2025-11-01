package com.spring.salesorderservice.dto;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.spring.salesorderservice.model.SalesInvoice;
import com.spring.salesorderservice.model.SalesOrder;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LineReturnDto {
    private Long id;
    private Long lineId;
    private int quantity;
    private double price;
    private Long productId;
    private Date returnDate;
    private String returnReason;
    /* @JsonBackReference("invoice-return-lines")
    private SalesInvoiceDto salesInvoice;
    @JsonBackReference("order-return-lines")
    private SalesOrderDto salesOrder;*/
    private Long salesInvoiceId;
    private Long salesOrderId;
}
