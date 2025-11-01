package com.spring.salesorderservice.controller;

import com.spring.salesorderservice.model.LineReturn;
import com.spring.salesorderservice.service.ReturnService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MANAGE_SALES_RETURNS')")
//@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/lineReturn/sales")
public class ReturnController {
    @Autowired
    private ReturnService returnService;
    @GetMapping
    public List<LineReturn> getLineReturn() {
        return returnService.getAllLineReturn();
    }
    @PostMapping("/line/create")
    public LineReturn addLineReturn(@RequestBody LineReturn lineReturn) {
        return returnService.addLineReturn(lineReturn);
    }
    @PutMapping("/line/update/{id}")
    public LineReturn updateLineReturn(@PathVariable Long id,@RequestBody LineReturn lineReturn) {
        return returnService.updateLineReturn(id,lineReturn);
    }
    @DeleteMapping("/line/{id}")
    public ResponseEntity<?> deleteLineReturn(@PathVariable int id) {
        returnService.deleteLineReturnById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public List<LineReturn> searchReturnLines(@RequestParam String query) {
        return returnService.searchLineReturns(query);
    }
    @GetMapping("/line/{id}")
    public LineReturn getLineReturnById(@PathVariable int id) {
        return returnService.getLineReturnById(id);
    }
}
