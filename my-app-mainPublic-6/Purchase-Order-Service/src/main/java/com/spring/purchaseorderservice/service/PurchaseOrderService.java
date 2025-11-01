package com.spring.purchaseorderservice.service;

import com.spring.purchaseorderservice.config.FeignClientSupplierService;
import com.spring.purchaseorderservice.config.FeignPaiement;
import com.spring.purchaseorderservice.config.FeignProductService;
import com.spring.purchaseorderservice.dto.*;
import com.spring.purchaseorderservice.model.*;
import com.spring.purchaseorderservice.repository.PurchaseLineRepository;
import com.spring.purchaseorderservice.repository.PurchaseOrderRepository;
import com.spring.purchaseorderservice.service.Mapper.MapperToDto;
import com.spring.purchaseorderservice.service.specifications.PurchaseOrderSpecifications;
import lombok.RequiredArgsConstructor; // Import this
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Use Constructor Injection (Best Practice)
public class PurchaseOrderService {

    // --- Injected Dependencies (final for safety) ---
    private final PurchaseLineRepository purchaseLineRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseInvoiceService purchaseInvoiceService;
    private final FeignProductService feignProductService;
    private final FeignPaiement feignPaiement;
    private final MapperToDto mapperToDto = new MapperToDto();

    // --- Public API Methods (Dealing with DTOs) ---

    @Transactional
    public PurchaseOrderDto createOrder(PurchaseOrderDto orderDto) {
        // 2. Convert DTO to Entity
        PurchaseOrder orderEntity = new PurchaseOrder();
        orderEntity.setSupplierId(orderDto.getSupplier());
        orderEntity.setDate(new Date());
        orderEntity.setUserCreator(orderDto.getUserExecutor());
        orderEntity.setOrderStatus(OrderStatus.PENDING); // Always start as PENDING
        orderEntity.setPaymentStatus(PaymentStatus.UNPAID); // Always start as UNPAID
        orderEntity.setSoldAmount(orderDto.getSoldAmount());
        orderEntity.setPaidAmount(orderDto.getPaidAmount());
        // Note: Delivery is not in the DTO, but you can add it like in SalesOrder
        if (orderDto.getDelivery() != null) {
            Delivery deliveryEntity = convertToDeliveryEntity(orderDto.getDelivery());
            orderEntity.setDelivery(deliveryEntity);
        }
        // 3. Save the main order to get an ID
        PurchaseOrder savedOrder = purchaseOrderRepository.save(orderEntity);

        // 4. Convert line DTOs to entities and associate with the saved order
        List<PurchaseLine> lineEntities = orderDto.getPurchaseLines().stream()
                .map(lineDto -> convertToLineEntity(lineDto, savedOrder))
                .collect(Collectors.toList());

        // 5. Save all lines
        List<PurchaseLine> savedLines = purchaseLineRepository.saveAll(lineEntities);
        savedOrder.setPurchaseLines(savedLines);

        // 6. Recalculate total amount based on saved lines and save again
        double totalAmount = savedLines.stream()
                .mapToDouble(line -> line.getQuantity() * line.getPrice())
                .sum();
        savedOrder.setTotalAmount(totalAmount);

        PurchaseOrder finalOrder = purchaseOrderRepository.save(savedOrder);

        // 7. Convert the final saved entity back to a DTO for the response
        return convertToDto(finalOrder);
    }

    @Transactional
    public PurchaseOrderDto updateOrder(long id, PurchaseOrderDto orderDto) {
        PurchaseOrder orderEntity = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with id: " + id));

        // Update only the fields that are allowed to be updated
        orderEntity.setSupplierId(orderDto.getSupplier());
        // Keep the original creator, update the executor
        orderEntity.setUserCreator(orderEntity.getUserCreator()); // Preserve original creator
        orderEntity.setUserExecutor(orderDto.getUserExecutor()); // Update executor
        orderEntity.setPaidAmount(orderDto.getPaidAmount());
        orderEntity.setSoldAmount(orderDto.getSoldAmount());
        if (orderDto.getOrderStatus() != null) {
            orderEntity.setOrderStatus(orderDto.getOrderStatus());
        }
        if (orderDto.getPaymentStatus() != null) {
            orderEntity.setPaymentStatus(orderDto.getPaymentStatus());
            if (orderEntity.getPaidAmount()==orderEntity.getTotalAmount())orderEntity.setPaymentStatus(PaymentStatus.PAID);
            else if (orderEntity.getPaidAmount()>0)orderEntity.setPaymentStatus(PaymentStatus.PARTPAID);
        }
        // Add more updatable fields as needed...

        PurchaseOrder updatedOrder = purchaseOrderRepository.save(orderEntity);
        return convertToDto(updatedOrder);
    }

    @Transactional
    public PurchaseOrderDto confirmOrder(Long orderId) throws Exception {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Only PENDING orders can be confirmed.");
        }

        order.setOrderStatus(OrderStatus.CONFIRMED);

        // Create an invoice when the order is confirmed
        PurchaseInvoiceDto invoiceDto = createInvoiceDtoFromOrder(order);
        PurchaseInvoice purchaseInvoice = purchaseInvoiceService.createPurchaseInvoice(invoiceDto, orderId);
        if (order.getPaidAmount() > 0) {
            feignPaiement.updatePayment(
                    "purchases",
                    purchaseInvoice.getId(),
                    order.getPaidAmount(),
                    String.valueOf(order.getPaymentStatus()),
                    purchaseInvoice.getTotalAmount(),
                    purchaseInvoice.getSupplierId());
        }

        PurchaseOrder confirmedOrder = purchaseOrderRepository.save(order);
        return convertToDto(confirmedOrder);
    }
    @Transactional
    public PurchaseOrderDto pendingOrder(Long id){
        Optional<PurchaseOrder> purchaseOrder = purchaseOrderRepository.findById(id);
        if (purchaseOrder.isPresent()) {
            purchaseOrder.get().setOrderStatus(OrderStatus.PENDING);
            purchaseOrderRepository.save(purchaseOrder.get());
        }
        return null;
    }

    @Transactional
    public void shipOrder(Long orderId) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        if (order.getOrderStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Order must be confirmed before shipping.");
        }
        order.setOrderStatus(OrderStatus.SHIPPED);
        purchaseOrderRepository.save(order);
    }

    @Transactional
    public void cancelOrder(Long orderId) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        if (order.getOrderStatus() == OrderStatus.SHIPPED || order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot cancel an order that has already been shipped or delivered.");
        }
        order.setOrderStatus(OrderStatus.CANCELED);
        // Logic to return products to stock
        order.getPurchaseLines().forEach(line ->
                feignProductService.reduceStock(line.getProductId(), line.getQuantity()) // Assuming reduceStock means returning purchased items
        );
        purchaseOrderRepository.save(order);
    }

    public void deleteOrder(Long orderId) {
        if (!purchaseOrderRepository.existsById(orderId)) {
            throw new ResourceNotFoundException("Order not found with id: " + orderId);
        }
        purchaseOrderRepository.deleteById(orderId);
    }
    // --- Getter Methods ---
    public PurchaseOrderDto getOrderById(Long id) {
        return purchaseOrderRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with id: " + id));
    }

    public List<PurchaseOrderDto> getAllOrders() {
        List<PurchaseOrder> orders = purchaseOrderRepository.findAll();
        return orders.stream().map(order -> {
            PurchaseOrderDto dto = convertToDto(order);
            // Manually set creator and executor as they might be missed by the mapper
            dto.setUserCreator(order.getUserCreator());
            dto.setUserExecutor(order.getUserExecutor());
            return dto;
        }).collect(Collectors.toList());
    }

    public List<PurchaseLineDto> getLinesByOrderId(Long id) {
        if (!purchaseOrderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Order not found with id: " + id);
        }
        return purchaseLineRepository.findPurchaseLineByPurchaseOrderId(id).stream()
                .map(this::convertLineToDto)
                .collect(Collectors.toList());
    }

    // IMPORTANT: This search method is now cleaner and safer.
    // You MUST update your Controller to provide these parameters separately.
    public List<PurchaseOrder> searchPurchaseOrders(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }

        Specification<PurchaseOrder> spec = PurchaseOrderSpecifications.findByCriteria(query);
        return purchaseOrderRepository.findAll(spec);
    }
    // --- Mappers (The Bridge between Entity and DTO) ---

    private PurchaseOrderDto convertToDto(PurchaseOrder entity) {
        return mapperToDto.convertToDto(entity);
    }

    protected PurchaseLineDto convertLineToDto(PurchaseLine entity) {
        return mapperToDto.convertLineToDto(entity);
    }
    private Delivery convertToDeliveryEntity(DeliveryDto dto) {
        return mapperToDto.convertToDeliveryDto(dto);
    }

    private PurchaseLine convertToLineEntity(PurchaseLineDto dto, PurchaseOrder parentOrder) {
        if (dto == null) return null;
        PurchaseLine entity = new PurchaseLine();
        entity.setProductId(dto.getProductId());
        entity.setQuantity(dto.getQuantity());
        entity.setPrice(dto.getPrice());
        entity.setPurchaseOrder(parentOrder);
        return entity;
    }

    private PurchaseInvoiceDto createInvoiceDtoFromOrder(PurchaseOrder order) {
        PurchaseInvoiceDto invoiceDto = new PurchaseInvoiceDto();
        invoiceDto.setSupplier(order.getSupplierId());
        invoiceDto.setDate(new Date());
        invoiceDto.setPaymentStatus(order.getPaymentStatus());
        invoiceDto.setTotalAmount(order.getTotalAmount() - order.getSoldAmount());

        List<PurchaseLineDto> lineDtos = order.getPurchaseLines().stream()
                .map(this::convertLineToDto)
                .collect(Collectors.toList());
        invoiceDto.setPurchaseLines(lineDtos);

        return invoiceDto;
    }
    public PurchaseOrder getPurchaseOrderByPurchaseLineId(Long id) {
        PurchaseLine purchaseLine = purchaseLineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("purchaseLine not found"));

        return purchaseOrderRepository.findByPurchaseLinesContaining(purchaseLine);
    }
}