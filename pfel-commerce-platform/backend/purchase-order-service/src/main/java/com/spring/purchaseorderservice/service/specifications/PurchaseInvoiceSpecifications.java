package com.spring.purchaseorderservice.service.specifications;
import com.spring.purchaseorderservice.model.PaymentStatus;
import com.spring.purchaseorderservice.model.PurchaseInvoice;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.List;

public class PurchaseInvoiceSpecifications {

    public static Specification<PurchaseInvoice> findByCriteria(String query) {
        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. (ID, Supplier ID, Order ID)
            try {
                Long longQuery = Long.parseLong(query);
                predicates.add(criteriaBuilder.equal(root.get("id"), longQuery));
                predicates.add(criteriaBuilder.equal(root.get("supplierId"), longQuery));
                predicates.add(criteriaBuilder.equal(root.get("orderId"), longQuery));
            } catch (NumberFormatException e) {
                // تجاهل
            }

            // 2. (Total Amount)
            try {
                Double doubleQuery = Double.parseDouble(query);
                predicates.add(criteriaBuilder.equal(root.get("totalAmount"), doubleQuery));
            } catch (NumberFormatException e) {
                // تجاهل
            }

            // 3. (Payment Status)
            try {
                PaymentStatus paymentStatus = PaymentStatus.valueOf(query.toUpperCase());
                predicates.add(criteriaBuilder.equal(root.get("paymentStatus"), paymentStatus));
            } catch (IllegalArgumentException e) {
                // تجاهل
            }

            if (predicates.isEmpty()) {
                return criteriaBuilder.disjunction();
            }

            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }
}