package com.spring.purchaseorderservice.service.specifications;
import com.spring.purchaseorderservice.model.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class LineReturnSpecifications {

    public static Specification<LineReturn> findByCriteria(String query) {
        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // الانضمام (Join) للجداول المرتبطة
            Join<LineReturn, PurchaseOrder> orderJoin = root.join("purchaseOrder", JoinType.LEFT);
            Join<LineReturn, PurchaseInvoice> invoiceJoin = root.join("purchaseInvoice", JoinType.LEFT);

            // 1. البحث النصي (سبب الإرجاع)
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("returnReason")), "%" + query.toLowerCase() + "%"));

            // 2. البحث الرقمي
            try {
                Long longQuery = Long.parseLong(query);
                predicates.add(criteriaBuilder.equal(root.get("id"), longQuery));
                predicates.add(criteriaBuilder.equal(root.get("lineId"), longQuery));
                predicates.add(criteriaBuilder.equal(root.get("productId"), longQuery));
                predicates.add(criteriaBuilder.equal(orderJoin.get("id"), longQuery));
                predicates.add(criteriaBuilder.equal(invoiceJoin.get("id"), longQuery));
            } catch (NumberFormatException e) { /* تجاهل */ }

            try {
                Integer intQuery = Integer.parseInt(query);
                predicates.add(criteriaBuilder.equal(root.get("quantity"), intQuery));
            } catch (NumberFormatException e) { /* تجاهل */ }

            try {
                Double doubleQuery = Double.parseDouble(query);
                predicates.add(criteriaBuilder.equal(root.get("price"), doubleQuery));
            } catch (NumberFormatException e) { /* تجاهل */ }

            // 3. البحث بالتاريخ
            try {
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                Date dateQuery = dateFormat.parse(query);
                predicates.add(criteriaBuilder.equal(root.get("returnDate"), dateQuery));
            } catch (ParseException e) { /* تجاهل */ }

            if (predicates.isEmpty()) {
                return criteriaBuilder.disjunction();
            }

            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }
}