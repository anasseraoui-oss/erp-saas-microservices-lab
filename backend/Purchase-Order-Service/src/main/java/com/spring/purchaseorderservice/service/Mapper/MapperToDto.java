package com.spring.purchaseorderservice.service.Mapper;

import com.spring.purchaseorderservice.dto.*;
import com.spring.purchaseorderservice.model.*;

import java.util.stream.Collectors;

public class MapperToDto {
    public PurchaseOrderDto convertToDto(PurchaseOrder entity) {
        if (entity == null) return null;

        PurchaseOrderDto dto = new PurchaseOrderDto();
        dto.setId(entity.getId());
        dto.setSupplier(entity.getSupplierId());
        dto.setDate(entity.getDate());
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setSoldAmount(entity.getSoldAmount());
        dto.setOrderStatus(entity.getOrderStatus());
        dto.setPaymentStatus(entity.getPaymentStatus());
        dto.setPaidAmount(entity.getPaidAmount());
        dto.setUserExecutor(dto.getUserExecutor());
        dto.setUserCreator(dto.getUserCreator());
        dto.setDelivery(convertToDeliveryDto(entity.getDelivery()));

        if (entity.getPurchaseLines() != null) {
            dto.setPurchaseLines(entity.getPurchaseLines().stream()
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
    public PurchaseInvoiceDto convertToDto(PurchaseInvoice invoice) {
        // 1. Create the SalesInvoiceDto using the empty constructor
        PurchaseInvoiceDto invoiceDto = new PurchaseInvoiceDto();
        // 2. Set the simple fields
        invoiceDto.setId(invoice.getId());
        invoiceDto.setSupplier(invoice.getSupplierId());
        invoiceDto.setTotalAmount(invoice.getTotalAmount());
        invoiceDto.setDate(invoice.getDate());
        invoiceDto.setPaymentStatus(invoice.getPaymentStatus());
        invoiceDto.setUserExecutor(invoice.getUserExecutor());
        invoiceDto.setUserCreator(invoice.getUserCreator());
        if (invoice.getPurchaseLines() != null) {
            invoiceDto.setPurchaseLines(invoice.getPurchaseLines().stream()
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
    public PurchaseLineDto convertLineToDto(PurchaseLine entity) {
        if (entity == null) return null;
        PurchaseLineDto dto = new PurchaseLineDto();
        dto.setId(entity.getId());
        dto.setProductId(entity.getProductId());
        dto.setQuantity(entity.getQuantity());
        dto.setPrice(entity.getPrice());
        if (entity.getPurchaseOrder() != null) {
            dto.setPurchasesOrderId(entity.getPurchaseOrder().getId());
        }
        if (entity.getPurchaseInvoice() != null) {
            dto.setPurchasesInvoiceId(entity.getPurchaseInvoice().getId());
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
        dto.setReturnReason(entity.getReturnReason());
        dto.setReturnDate(entity.getReturnDate());
        if (entity.getPurchaseOrder() != null) {
            dto.setPurchasesOrderId(entity.getPurchaseOrder().getId());
        }
        if (entity.getPurchaseInvoice() != null) {
            dto.setPurchasesInvoiceId(entity.getPurchaseInvoice().getId());
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
