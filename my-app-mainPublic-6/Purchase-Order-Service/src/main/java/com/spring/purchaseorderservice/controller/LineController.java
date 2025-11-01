package com.spring.purchaseorderservice.controller;

import com.spring.purchaseorderservice.dto.PurchaseLineDto;
import com.spring.purchaseorderservice.model.PurchaseLine;
import com.spring.purchaseorderservice.service.LineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGE_PURCHASE_LINES')")
@RestController
@RequestMapping("/line/purchases")
public class LineController {

    @Autowired
    private LineService lineService;

    @PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN') or hasAuthority('VIEW_PURCHASE_ORDERS')")
    @GetMapping("/filter")
    public List<PurchaseLine> filterLines(@RequestParam(required = false) Long supplierId,
                                          @RequestParam(required = false) Long dateMillis,
                                          @RequestParam(required = false) String type) {
        Date date = dateMillis == null ? null : new Date(dateMillis);
        return lineService.getFilteredPurchaseLines(supplierId, date, type);
    }
    @DeleteMapping("/line/{id}")
    public ResponseEntity<PurchaseLine> deletePurchaseLine(@PathVariable Long id) throws Exception {
        PurchaseLine deletedPurchaseLine = lineService.deletePurchaseLine(id);
        return ResponseEntity.ok(deletedPurchaseLine);
    }
    @PutMapping("/line/{id}")
    public ResponseEntity<PurchaseLine> updatePurchaseLine(@PathVariable Long id, @RequestBody PurchaseLineDto lineDto) throws Exception {
        PurchaseLine updatedLine = lineService.updatePurchaseLine(id, lineDto);
        return ResponseEntity.ok(updatedLine);
    }
    @GetMapping("/search")
    public List<PurchaseLine> searchLines(@RequestParam String query) {
        return lineService.searchPurchaseLines(query);
    }
    @GetMapping
    public List<PurchaseLine> getSalesLines() {
        return  lineService.getPurchaseLines();
    }
}
