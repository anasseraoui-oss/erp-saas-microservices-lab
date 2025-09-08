package com.spring.salesorderservice.service.specifications;
import com.spring.salesorderservice.model.*;
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
            Join<LineReturn, SalesOrder> orderJoin = root.join("salesOrder", JoinType.LEFT);
            Join<LineReturn, SalesInvoice> invoiceJoin = root.join("salesInvoice", JoinType.LEFT);

            // البحث النصي
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("returnReason")), "%" + query.toLowerCase() + "%"));

            // البحث الرقمي
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

            // البحث بالتاريخ
            try {
                Date dateQuery = new SimpleDateFormat("yyyy-MM-dd").parse(query);
                predicates.add(criteriaBuilder.equal(root.get("returnDate"), dateQuery));
            } catch (ParseException e) { /* تجاهل */ }

            if (predicates.isEmpty()) {
                return criteriaBuilder.disjunction();
            }
            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }
}