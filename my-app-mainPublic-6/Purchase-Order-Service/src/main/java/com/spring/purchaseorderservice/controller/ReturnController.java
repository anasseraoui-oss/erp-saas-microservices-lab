package com.spring.purchaseorderservice.controller;

import com.spring.purchaseorderservice.model.LineReturn;
import com.spring.purchaseorderservice.service.ReturnService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@PreAuthorize("hasAuthority('ADMIN') or hasRole('ADMIN')")
//@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/lineReturn/purchases")
public class ReturnController {
    @Autowired
    private ReturnService returnService;
    @GetMapping
    public List<LineReturn> getLineReturn() {
       return returnService.getAllLineReturn();
    }
    @PostMapping("/line/create")
    public LineReturn addLineReturn(@RequestBody LineReturn lineReturn) throws Exception {
        return returnService.addLineReturn(lineReturn);
    }
    @PutMapping("/line/update")
    public LineReturn updateLineReturn(@RequestBody LineReturn lineReturn) throws Exception {
        return returnService.updateLineReturn(lineReturn);
    }
    @DeleteMapping("/line/{id}")
    public ResponseEntity<?> deleteLineReturn(@PathVariable int id) {
         returnService.deleteLineReturnById(id);
         return ResponseEntity.ok().build();
    }
    @GetMapping("/search")
    public List<LineReturn> searchLineReturns(@RequestParam String query) {
        return returnService.searchLineReturns(query);
    }
    @GetMapping("/line/{id}")
    public LineReturn getLineReturnById(@PathVariable int id) {
        return returnService.getLineReturnById(id);
    }
}
