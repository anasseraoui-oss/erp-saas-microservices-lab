package com.spring.salesorderservice.repository;

import com.spring.salesorderservice.model.LineReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface LineReturnRepository extends JpaRepository<LineReturn, Integer>, JpaSpecificationExecutor<LineReturn> {
    List<LineReturn> findByReturnDateOrReturnReasonContaining(Date returnDate, String returnReason);
}
