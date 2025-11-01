package com.spring.purchaseorderservice.service.specifications;

import com.spring.purchaseorderservice.model.PurchaseInvoice;
import com.spring.purchaseorderservice.model.PurchaseLine;
import com.spring.purchaseorderservice.model.PurchaseOrder;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class PurchaseLineSpecifications {

    public static Specification<PurchaseLine> findByCriteria(String query) {
        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<PurchaseLine, PurchaseOrder> orderJoin = root.join("purchaseOrder", JoinType.LEFT);
            Join<PurchaseLine, PurchaseInvoice> invoiceJoin = root.join("purchaseInvoice", JoinType.LEFT);

            try {
                Long longQuery = Long.parseLong(query);
                predicates.add(criteriaBuilder.equal(root.get("id"), longQuery));
                predicates.add(criteriaBuilder.equal(root.get("productId"), longQuery));
                predicates.add(criteriaBuilder.equal(orderJoin.get("id"), longQuery));
                predicates.add(criteriaBuilder.equal(invoiceJoin.get("id"), longQuery));
            } catch (NumberFormatException e) {
                // تجاهل إذا لم يكن رقمًا طويلًا (Long)
            }

            try {
                Integer intQuery = Integer.parseInt(query);
                predicates.add(criteriaBuilder.equal(root.get("quantity"), intQuery));
            } catch (NumberFormatException e) {
                // تجاهل إذا لم يكن رقمًا صحيحًا (Integer)
            }

            try {
                Double doubleQuery = Double.parseDouble(query);
                predicates.add(criteriaBuilder.equal(root.get("price"), doubleQuery));
            } catch (NumberFormatException e) {
                // تجاهل إذا لم يكن رقمًا عشريًا (Double)
            }

            if (predicates.isEmpty()) {
                return criteriaBuilder.disjunction();
            }


            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }
}