package com.spring.salesorderservice.repository;

import com.spring.salesorderservice.model.SalesLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesLineRepository extends JpaRepository<SalesLine, Long>, JpaSpecificationExecutor<SalesLine> {
    List<SalesLine> findSalesLinesBySalesOrderId(Long id);
    List<SalesLine> findSalesLinesBySalesInvoiceId(Long id);
    /*List<SalesLine> findSalesLinesByProductId(Long id);*/
}
