package com.spring.salesorderservice.service.specifications;
import com.spring.salesorderservice.model.SalesInvoice;
import com.spring.salesorderservice.model.SalesLine;
import com.spring.salesorderservice.model.SalesOrder;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.List;

public class SalesLineSpecifications {
    public static Specification<SalesLine> findByCriteria(String query) {
        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            Join<SalesLine, SalesOrder> orderJoin = root.join("salesOrder", JoinType.LEFT);
            Join<SalesLine, SalesInvoice> invoiceJoin = root.join("salesInvoice", JoinType.LEFT);

            try {
                Long longQuery = Long.parseLong(query);
                predicates.add(criteriaBuilder.equal(root.get("id"), longQuery));
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

            if (predicates.isEmpty()) {
                return criteriaBuilder.disjunction();
            }
            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }
}