package com.spring.purchaseorderservice.repository;

import com.spring.purchaseorderservice.model.PurchaseLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseLineRepository extends JpaRepository<PurchaseLine, Long>, JpaSpecificationExecutor<PurchaseLine> {
    /*PurchaseLine findByPurchaseOrderId(Long id);
    PurchaseLine findByPurchaseOrderPrice(Double Price);
    PurchaseLine findByPurchaseOrderQuantity(Integer Quantity);
    PurchaseLine findByPurchaseLineId(Long id);*/
    List<PurchaseLine> findPurchaseLineByPurchaseOrderId(Long purchaseOrder_id);
}
