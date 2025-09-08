package com.spring.salesorderservice.service.specifications;
import com.spring.salesorderservice.model.PaymentStatus;
import com.spring.salesorderservice.model.SalesInvoice;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class SalesInvoiceSpecifications {

    public static Specification<SalesInvoice> findByCriteria(String query) {
        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. البحث الرقمي
            try {
                Long longQuery = Long.parseLong(query);
                predicates.add(criteriaBuilder.equal(root.get("id"), longQuery));
                predicates.add(criteriaBuilder.equal(root.get("customerId"), longQuery));
                predicates.add(criteriaBuilder.equal(root.get("orderId"), longQuery));
            } catch (NumberFormatException e) { /* تجاهل */ }

            try {
                Double doubleQuery = Double.parseDouble(query);
                predicates.add(criteriaBuilder.equal(root.get("totalAmount"), doubleQuery));
            } catch (NumberFormatException e) { /* تجاهل */ }

            // 2. البحث بالحالة
            try {
                PaymentStatus paymentStatus = PaymentStatus.valueOf(query.toUpperCase());
                predicates.add(criteriaBuilder.equal(root.get("paymentStatus"), paymentStatus));
            } catch (IllegalArgumentException e) { /* تجاهل */ }

            // 3. البحث بالتاريخ
            try {
                Date dateQuery = new SimpleDateFormat("yyyy-MM-dd").parse(query);
                predicates.add(criteriaBuilder.equal(root.get("date"), dateQuery));
            } catch (ParseException e) { /* تجاهل */ }

            if (predicates.isEmpty()) {
                return criteriaBuilder.disjunction();
            }

            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }
}