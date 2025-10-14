package com.spring.purchaseorderservice.service;

import com.spring.purchaseorderservice.config.FeignPaiement;
import com.spring.purchaseorderservice.config.FeignProductService;
import com.spring.purchaseorderservice.model.LineReturn;
import com.spring.purchaseorderservice.model.PurchaseOrder;
import com.spring.purchaseorderservice.repository.LineReturnRepository;
import com.spring.purchaseorderservice.repository.PurchaseOrderRepository;
import com.spring.purchaseorderservice.service.specifications.LineReturnSpecifications;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;

@Service
public class ReturnService {
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;
    @Autowired
    private LineReturnRepository lineReturnRepository;
    @Autowired
    private LineService lineService;
    @Autowired
    private FeignPaiement feignPaiement;
    @Autowired
    private FeignProductService feignProductService;
    public List<LineReturn> getAllLineReturn() {
        return lineReturnRepository.findAll();
    }
    public LineReturn getLineReturnById(int id) {
        return lineReturnRepository.findById(id).get();
    }
    public LineReturn addLineReturn(LineReturn lineReturn) throws Exception {
        lineService.deletePurchaseLine(lineReturn.getLineId());
        return lineReturnRepository.save(lineReturn);
    }
    public LineReturn updateLineReturn(LineReturn lineReturn) throws Exception {
        LineReturn lineReturn1=lineReturnRepository.getReferenceById(Math.toIntExact(lineReturn.getId()));
        if(Objects.equals(lineReturn1.getProductId(), lineReturn.getProductId())){
            double deff= lineReturn1.getQuantity()*lineReturn1.getPrice()-lineReturn.getQuantity()*lineReturn.getPrice();
            PurchaseOrder purchaseOrder=lineReturn1.getPurchaseOrder();
            if (deff<0) {
                purchaseOrder.setTotalAmount(purchaseOrder.getTotalAmount()-Math.abs(deff));
            }
            if (deff>0) {
                purchaseOrder.setTotalAmount(purchaseOrder.getTotalAmount()+deff);
            }
            purchaseOrderRepository.save(purchaseOrder);
            feignPaiement.updatePayment("purchases",purchaseOrder.getId(),0L, String.valueOf(purchaseOrder.getPaymentStatus()),purchaseOrder.getTotalAmount(),purchaseOrder.getSupplierId());
            int deffQuantity= lineReturn1.getQuantity()-lineReturn.getQuantity();
            if (deffQuantity>0) {
                feignProductService.addStock(lineReturn1.getProductId(),deffQuantity);
                feignProductService.updateDate(lineReturn1.getProductId(),new Date());
            }else {
                feignProductService.reduceStock(lineReturn1.getProductId(),Math.abs(deffQuantity));
                feignProductService.updateDate(lineReturn1.getProductId(),new Date());
            }
        }
        return lineReturnRepository.save(lineReturn);
    }
    public void deleteLineReturnById(int id) {
         lineReturnRepository.deleteById(id);;
    }

        public List<LineReturn> searchLineReturns(String query) {
            if (query == null || query.trim().isEmpty()) {
                return new ArrayList<>();
            }
            return lineReturnRepository.findAll(LineReturnSpecifications.findByCriteria(query));
        }
}