package com.store.presentation.controller;

import com.store.application.service.StatsService;
import javafx.fxml.FXML;
import javafx.scene.control.Label;

import java.math.BigDecimal;
import java.util.Map;

public class DashboardController {

    @FXML
    private Label salesLabel;
    @FXML
    private Label purchasesLabel;
    @FXML
    private Label profitLabel;
    @FXML
    private Label lowStockLabel;
    @FXML
    private Label expiredLabel;

    private final StatsService statsService = new StatsService();

    @FXML
    public void initialize() {
        refresh();
    }

    public void refresh() {
        Map<String, Object> stats = statsService.getDashboardStats();

        salesLabel.setText(String.format("%.2f DH", ((BigDecimal) stats.get("totalSales")).doubleValue()));
        purchasesLabel.setText(String.format("%.2f DH", ((BigDecimal) stats.get("totalPurchases")).doubleValue()));
        profitLabel.setText(String.format("%.2f DH", ((BigDecimal) stats.get("profit")).doubleValue()));

        int low = (int) stats.get("lowStockCount");
        lowStockLabel.setText(low + (low == 1 ? " product needs" : " products need") + " restock");

        int exp = (int) stats.get("expiredCount");
        expiredLabel.setText(exp + (exp == 1 ? " product is" : " products are") + " expired");
    }
}
