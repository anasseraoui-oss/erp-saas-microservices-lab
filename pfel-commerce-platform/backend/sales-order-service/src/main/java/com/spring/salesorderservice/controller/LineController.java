package com.spring.salesorderservice.controller;

import com.spring.salesorderservice.dto.SalesLineDto;
import com.spring.salesorderservice.dto.SalesLineResponseDto;
import com.spring.salesorderservice.model.SalesLine;
import com.spring.salesorderservice.service.LineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGE_SALES_LINES')")
@RestController
@RequestMapping("/line/sales")
public class LineController {
    @Autowired
    private LineService lineService;
    @PutMapping("/line/{id}")
    public ResponseEntity<SalesLine> updateSalesLine(@PathVariable Long id, @RequestBody SalesLineDto salesLineDto) {
        SalesLine updatedSalesLine = lineService.updateSalesLine(id, salesLineDto);
        return ResponseEntity.ok(updatedSalesLine);
    }
    @GetMapping
    public List<SalesLineResponseDto> getSalesLines() {
        // The service now returns the DTOs directly, ready to be sent as JSON
        return lineService.getSalesLines();
    }
    @DeleteMapping("/line/{id}")
    public ResponseEntity<SalesLine> deleteSalesLine(@PathVariable Long id) {
        SalesLine deletedSalesLine = lineService.deleteSalesLine(id);
        return ResponseEntity.ok(deletedSalesLine);
    }
    @GetMapping("/search")
    public List<SalesLine> searchLines(@RequestParam String query) {
        return lineService.searchSalesLines(query);
    }
}
