package com.spring.salesorderservice.service.Mapper;

import com.spring.salesorderservice.dto.*;
import com.spring.salesorderservice.model.*;

import java.util.stream.Collectors;

public class MapperToDto {
    public SalesInvoiceDto convertToDto(SalesInvoice invoice) {
        // 1. Create the SalesInvoiceDto using the empty constructor
        SalesInvoiceDto invoiceDto = new SalesInvoiceDto();
        // 2. Set the simple fields
        invoiceDto.setId(invoice.getId());
        invoiceDto.setCustomer(invoice.getCustomerId());
        invoiceDto.setTotalAmount(invoice.getTotalAmount());
        invoiceDto.setDate(invoice.getDate());
        invoiceDto.setPaymentStatus(invoice.getPaymentStatus());
        invoiceDto.setUserCreator(invoice.getUserCreator());
        invoiceDto.setUserExecutor(invoice.getUserExecutor());
        if (invoice.getSalesLines() != null) {
            invoiceDto.setSalesLines(invoice.getSalesLines().stream()
                    .map(this::convertLineToDto)
                    .collect(Collectors.toList()));
        }
        if (invoice.getLineReturns() != null) {
            invoiceDto.setLineReturns(invoice.getLineReturns().stream()
                    .map(this::convertLineReturnToDto)
                    .collect(Collectors.toList()));
        }
        return invoiceDto;
    }
    public SalesOrderDto convertToDto(SalesOrder entity) {
        if (entity == null) return null;
        SalesOrderDto dto = new SalesOrderDto();
        dto.setId(entity.getId());
        dto.setCustomer(entity.getCustomer());
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setDate(entity.getDate());
        dto.setSoldAmount(entity.getSoldAmount());
        dto.setOrderStatus(entity.getOrderStatus());
        dto.setPaymentStatus(entity.getPaymentStatus());
        dto.setDelivery(convertToDeliveryDto(entity.getDelivery()));
        dto.setPaidAmount(entity.getPaidAmount());
        dto.setUserExecutor(entity.getUserExecutor());
        dto.setUserCreator(entity.getUserCreator());

        if (entity.getSalesLines() != null) {
            dto.setSalesLines(entity.getSalesLines().stream()
                    .map(this::convertLineToDto)
                    .collect(Collectors.toList()));
        }
        if (entity.getLineReturns() != null) {
            dto.setLineReturns(entity.getLineReturns().stream()
                    .map(this::convertLineReturnToDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }
    public SalesLineDto convertLineToDto(SalesLine entity) {
        if (entity == null) return null;
        SalesLineDto dto = new SalesLineDto();
        dto.setId(entity.getId());
        dto.setProductId(entity.getProductId());
        dto.setQuantity(entity.getQuantity());
        dto.setPrice(entity.getPrice());
        if (entity.getSalesOrder() != null) {
            dto.setSalesOrderId(entity.getSalesOrder().getId());
        }
        if (entity.getSalesInvoice() != null) {
            dto.setSalesInvoiceId(entity.getSalesInvoice().getId());
        }
        return dto;
    }
    public LineReturnDto convertLineReturnToDto(LineReturn entity) {
        if (entity == null) return null;
        LineReturnDto dto = new LineReturnDto();
        dto.setId(entity.getId());
        dto.setLineId(entity.getLineId());
        dto.setProductId(entity.getProductId());
        dto.setQuantity(entity.getQuantity());
        dto.setPrice(entity.getPrice());
        dto.setReturnDate(entity.getReturnDate());
        dto.setReturnReason(entity.getReturnReason());
        if (entity.getSalesOrder() != null) {
            dto.setSalesOrderId(entity.getSalesOrder().getId());
        }
        if (entity.getSalesInvoice() != null) {
            dto.setSalesInvoiceId(entity.getSalesInvoice().getId());
        }
        return dto;
    }

    public DeliveryDto convertToDeliveryDto(Delivery entity) {
        if (entity == null) return null;
        DeliveryDto dto = new DeliveryDto();
        dto.setId(entity.getId());
        dto.setDeliveryDate(entity.getDeliveryDate());
        dto.setDescription(entity.getDescription());
        dto.setDeliveryPrice(entity.getDeliveryPrice());
        dto.setLocation(entity.getLocation());
        dto.setPsbllocation(entity.getPsbllocation());
        return dto;
    }
    public Delivery convertToDeliveryDto(DeliveryDto entity) {
        if (entity == null) return null;
        Delivery delivery = new Delivery();
        delivery.setId(entity.getId());
        delivery.setDeliveryDate(entity.getDeliveryDate());
        delivery.setDescription(entity.getDescription());
        delivery.setDeliveryPrice(entity.getDeliveryPrice());
        delivery.setLocation(entity.getLocation());
        delivery.setPsbllocation(entity.getPsbllocation());
        return delivery;
    }

}
