package com.spring.salesorderservice.service;

import com.spring.salesorderservice.config.FeignPaiement;
import com.spring.salesorderservice.config.FeignProductService;
import com.spring.salesorderservice.model.LineReturn;
import com.spring.salesorderservice.model.SalesInvoice;
import com.spring.salesorderservice.model.SalesOrder;
import com.spring.salesorderservice.repository.LineReturnRepository;
import com.spring.salesorderservice.repository.SalesInvoiceRepository;
import com.spring.salesorderservice.repository.SalesOrderRepository;
import com.spring.salesorderservice.service.specifications.LineReturnSpecifications;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;

@Service
public class ReturnService {
    @Autowired
    private LineReturnRepository lineReturnRepository;
    @Autowired
    private LineService lineService;
    @Autowired
    private FeignPaiement feignPaiement;
    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;
    @Autowired
    private FeignProductService feignProductService;
    public List<LineReturn> getAllLineReturn() {
        return lineReturnRepository.findAll();
    }
    public LineReturn getLineReturnById(int id) {
        return lineReturnRepository.findById(id).get();
    }
    @Transactional
    public LineReturn addLineReturn(LineReturn lineReturn) {
        lineService.deleteSalesLine(lineReturn.getId());
        return lineReturnRepository.save(lineReturn);
    }
    @Transactional
    public LineReturn updateLineReturn(Long id,LineReturn lineReturn) {
        LineReturn existingLineReturn = lineReturnRepository.findById(Math.toIntExact(id))
                .orElseThrow(() -> new EntityNotFoundException("LineReturn not found with id: " + id));        if(Objects.equals(existingLineReturn.getProductId(), lineReturn.getProductId())){
            double def= existingLineReturn.getQuantity()*existingLineReturn.getPrice()-lineReturn.getQuantity()*lineReturn.getPrice();
            SalesInvoice salesInvoice = existingLineReturn.getSalesInvoice();
            if (salesInvoice != null) {
                salesInvoice.setTotalAmount(salesInvoice.getTotalAmount() + def);
                feignPaiement.updatePayment("sales", salesInvoice.getId(), 0L, String.valueOf(salesInvoice.getPaymentStatus()), salesInvoice.getTotalAmount(), salesInvoice.getCustomerId());
            }
            int quantityDifference = existingLineReturn.getQuantity() - lineReturn.getQuantity();
            if (quantityDifference > 0) {
                feignProductService.addStock(existingLineReturn.getProductId(), quantityDifference);
            } else if (quantityDifference < 0) {
                feignProductService.reduceStock(existingLineReturn.getProductId(), Math.abs(quantityDifference));
            }
            if (quantityDifference != 0) {
                feignProductService.updateDate(existingLineReturn.getProductId(), new Date());
            }
        }
        existingLineReturn.setQuantity(lineReturn.getQuantity());
        existingLineReturn.setReturnDate(lineReturn.getReturnDate());
        existingLineReturn.setReturnReason(lineReturn.getReturnReason());

        return lineReturnRepository.save(existingLineReturn);
    }
    public void deleteLineReturnById(int id) {
        lineReturnRepository.deleteById(id);;
    }
    public List<LineReturn> searchLineReturns(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }

        Specification<LineReturn> spec = LineReturnSpecifications.findByCriteria(query);
        return lineReturnRepository.findAll(spec);
    }
}
