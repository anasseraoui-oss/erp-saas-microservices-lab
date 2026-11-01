package com.spring.purchaseorderservice.repository;

import com.spring.purchaseorderservice.model.LineReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface LineReturnRepository extends JpaRepository<LineReturn, Integer>, JpaSpecificationExecutor<LineReturn> {
}
