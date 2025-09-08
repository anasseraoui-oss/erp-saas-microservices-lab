package com.spring.salesorderservice.service;

import com.spring.salesorderservice.config.FeignPaiement;
import com.spring.salesorderservice.config.FeignProductService;
import com.spring.salesorderservice.dto.*;
import com.spring.salesorderservice.model.*;
import com.spring.salesorderservice.repository.SalesLineRepository;
import com.spring.salesorderservice.repository.SalesOrderRepository;
import com.spring.salesorderservice.service.Mapper.MapperToDto;
import com.spring.salesorderservice.service.specifications.SalesOrderSpecifications;
import feign.Param;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SalesOrderService {

    // --- Injected Dependencies ---
    @Autowired private SalesOrderRepository salesOrderRepository;
    @Autowired private SalesLineRepository salesLineRepository;
    @Autowired private SalesInvoiceService salesInvoiceService;
    @Autowired private FeignProductService feignProductService;
    @Autowired private FeignPaiement feignPaiement;
    private final MapperToDto mapperToDto = new MapperToDto();
    // --- Public API Methods (Dealing with DTOs) ---

    @Transactional
    public SalesOrderDto createOrder(SalesOrderDto orderDto) {
        SalesOrder orderEntity = new SalesOrder();
        orderEntity.setCustomer(orderDto.getCustomer());
        orderEntity.setUserCreator(orderDto.getUserExecutor());
        orderEntity.setDate(new Date());
        orderEntity.setOrderStatus(OrderStatus.PENDING);
        orderEntity.setPaymentStatus(PaymentStatus.UNPAID);
        orderEntity.setSoldAmount(orderDto.getSoldAmount());
        orderEntity.setPaidAmount(orderDto.getPaidAmount());

        // Handle Delivery Entity
        if (orderDto.getDelivery() != null) {
            Delivery deliveryEntity = convertToDeliveryEntity(orderDto.getDelivery());
            orderEntity.setDelivery(deliveryEntity);
        }

        SalesOrder savedOrder = salesOrderRepository.save(orderEntity); // Save to get ID

        List<SalesLine> lineEntities = orderDto.getSalesLines().stream()
                .map(lineDto -> convertToLineEntity(lineDto, savedOrder))
                .collect(Collectors.toList());

        List<SalesLine> savedLines = salesLineRepository.saveAll(lineEntities);
        savedOrder.setSalesLines(savedLines);

        // Recalculate total amount based on lines
        double totalAmount = savedLines.stream()
                .mapToDouble(line -> line.getQuantity() * line.getPrice())
                .sum();
        savedOrder.setTotalAmount(totalAmount);

        return convertToDto(salesOrderRepository.save(savedOrder));
    }

    @Transactional
    public SalesOrderDto updateOrder(SalesOrderDto orderDto, Long orderId) {
        SalesOrder orderEntity = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        orderEntity.setCustomer(orderDto.getCustomer());
        orderEntity.setUserExecutor(orderDto.getUserExecutor());
        orderEntity.setOrderStatus(orderDto.getOrderStatus());
        orderEntity.setPaidAmount(orderDto.getPaidAmount());
        orderEntity.setSoldAmount(orderDto.getSoldAmount());

        if (orderDto.getPaymentStatus() != null) {
            orderEntity.setPaymentStatus(orderDto.getPaymentStatus());
            if (orderEntity.getPaidAmount()==orderEntity.getTotalAmount())orderEntity.setPaymentStatus(PaymentStatus.PAID);
            else if (orderEntity.getPaidAmount()>0)orderEntity.setPaymentStatus(PaymentStatus.PARTPAID);
        }

        SalesOrder updatedOrder = salesOrderRepository.save(orderEntity);
        return convertToDto(updatedOrder);
    }
    @Transactional
    public SalesOrderDto confirmOrder(Long orderId) {
        SalesOrder order = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getOrderStatus().equals(OrderStatus.PENDING)) {
            throw new IllegalStateException("Only PENDING orders can be confirmed.");
        }

        order.setOrderStatus(OrderStatus.CONFIRMED);

        SalesInvoiceDto salesInvoiceDto = new SalesInvoiceDto();
        salesInvoiceDto.setCustomer(order.getCustomer());
        salesInvoiceDto.setDate(new Date());
        salesInvoiceDto.setPaymentStatus(order.getPaymentStatus());
        salesInvoiceDto.setTotalAmount(order.getTotalAmount() - order.getSoldAmount());

        List<SalesLineDto> salesLineDtos = order.getSalesLines().stream()
                .map(this::convertLineToDto)
                .collect(Collectors.toList());
        salesInvoiceDto.setSalesLines(salesLineDtos);

        SalesInvoice salesInvoice = salesInvoiceService.createSalesInvoice(salesInvoiceDto, orderId);
        if (order.getPaidAmount()!=0) feignPaiement.updatePayment("salea",salesInvoice.getId(),order.getPaidAmount(), String.valueOf(order.getPaymentStatus()),salesInvoice.getTotalAmount(),salesInvoice.getCustomerId());
        return convertToDto(salesOrderRepository.save(order));
    }

    @Transactional
    public SalesOrderDto pendingOrder(Long id){
        Optional<SalesOrder> salesOrder = salesOrderRepository.findById(id);
        if (salesOrder.isPresent()) {
            salesOrder.get().setOrderStatus(OrderStatus.PENDING);
            salesOrderRepository.save(salesOrder.get());
        }
        return null;
    }

    @Transactional
    public void shipOrder(Long orderId) {
        SalesOrder order = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        if (!order.getOrderStatus().equals(OrderStatus.CONFIRMED)) {
            throw new IllegalStateException("Order must be confirmed before shipping.");
        }
        order.setOrderStatus(OrderStatus.SHIPPED);
        salesOrderRepository.save(order);
    }

    @Transactional
    public void cancelOrder(Long orderId) {
        SalesOrder order = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        if (order.getOrderStatus() == OrderStatus.SHIPPED || order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot cancel an order that has already been shipped.");
        }
        order.setOrderStatus(OrderStatus.CANCELED);
        order.getSalesLines().forEach(line -> feignProductService.addStock(line.getProductId(), line.getQuantity()));
        salesOrderRepository.save(order);
    }

    public void deleteOrder(Long orderId) {
        if (!salesOrderRepository.existsById(orderId)) {
            throw new ResourceNotFoundException("Order not found with id: " + orderId);
        }
        salesOrderRepository.deleteById(orderId);
    }

    // --- Getter Methods ---

    public SalesOrderDto getOrderById(Long orderId) {
        SalesOrder orderEntity = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return convertToDto(orderEntity);
    }

    public List<SalesOrderDto> getAllOrders() {
        return salesOrderRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<SalesLineDto> getSalesLinesBySalesOrderId(Long orderId) {
        if (!salesOrderRepository.existsById(orderId)) {
            throw new ResourceNotFoundException("Order not found with id: " + orderId);
        }
        return salesLineRepository.findSalesLinesBySalesOrderId(orderId).stream()
                .map(this::convertLineToDto)
                .collect(Collectors.toList());
    }

    // --- Mappers (The Bridge between Entity and DTO) ---

    private SalesOrderDto convertToDto(SalesOrder entity) {
        return mapperToDto.convertToDto(entity);
    }

    protected SalesLineDto convertLineToDto(SalesLine entity) {
        return mapperToDto.convertLineToDto(entity);
    }

    private Delivery convertToDeliveryEntity(DeliveryDto dto) {
        return mapperToDto.convertToDeliveryDto(dto);
    }

    private SalesLine convertToLineEntity(SalesLineDto dto, SalesOrder parentOrder) {
        if (dto == null) return null;
        SalesLine entity = new SalesLine();
        entity.setId(dto.getId());
        entity.setProductId(dto.getProductId());
        entity.setQuantity(dto.getQuantity());
        entity.setPrice(dto.getPrice());
        entity.setSalesOrder(parentOrder);
        return entity;
    }
    public List<SalesOrder> searchSalesOrders(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }
        Specification<SalesOrder> spec = SalesOrderSpecifications.findByCriteria(query);
        return salesOrderRepository.findAll(spec);
    }

    public SalesOrderDto getSalesOrderBySalesLineId(Long lineId) {
        SalesLine salesLine = salesLineRepository.findById(lineId)
                .orElseThrow(() -> new ResourceNotFoundException("SalesLine not found with id: " + lineId));

        if (salesLine.getSalesOrder() == null) {
            throw new ResourceNotFoundException("No SalesOrder associated with SalesLine id: " + lineId);
        }

        return convertToDto(salesLine.getSalesOrder());

    }
}