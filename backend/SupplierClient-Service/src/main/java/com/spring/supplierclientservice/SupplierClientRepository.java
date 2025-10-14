package com.spring.supplierclientservice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierClientRepository extends JpaRepository<SupplierClient, Long> {
    SupplierClient findByName(String name);

    SupplierClient findById(long id);

    SupplierClient findByemail(String email);

    @Query("SELECT s FROM SupplierClient s WHERE s.name LIKE %:query% OR s.email LIKE %:query%")
    List<SupplierClient> searchByNameOrEmail(@Param("query") String query);
}
