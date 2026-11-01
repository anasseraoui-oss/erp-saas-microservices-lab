package com.store.presentation.controller;

import com.store.application.service.PurchaseService;
import com.store.application.service.SupplierService;
import com.store.application.service.ProductService;
import com.store.domain.entity.PurchaseInvoice;
import com.store.domain.entity.PurchaseInvoiceLine;
import com.store.domain.entity.Supplier;
import com.store.domain.entity.Product;
import com.store.domain.entity.InvoiceType;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.VBox;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class PurchaseInvoiceListController {

    @FXML
    private TableView<PurchaseInvoice> table;
    @FXML
    private TableColumn<PurchaseInvoice, Long> colId;
    @FXML
    private TableColumn<PurchaseInvoice, LocalDate> colDate;
    @FXML
    private TableColumn<PurchaseInvoice, Long> colSupplier;
    @FXML
    private TableColumn<PurchaseInvoice, BigDecimal> colTotal;

    private final PurchaseService purchaseService = new PurchaseService();
    private final SupplierService supplierService = new SupplierService();
    private final ProductService productService = new ProductService();
    private final ObservableList<PurchaseInvoice> items = FXCollections.observableArrayList();

    private InvoiceType currentType = InvoiceType.PURCHASE_INVOICE;

    public void setType(InvoiceType type) {
        this.currentType = type;
        loadPurchases();
    }

    @FXML
    public void initialize() {
        colId.setCellValueFactory(new PropertyValueFactory<>("id"));
        colDate.setCellValueFactory(new PropertyValueFactory<>("date"));
        colSupplier.setCellValueFactory(new PropertyValueFactory<>("supplierId"));
        colTotal.setCellValueFactory(new PropertyValueFactory<>("totalAmount"));
        table.setItems(items);
        try {
            loadPurchases();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void loadPurchases() {
        items.clear();
        items.addAll(purchaseService.getPurchasesByType(currentType));
    }

    @FXML
    public void showCreatePurchase() {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle(
                currentType == InvoiceType.PURCHASE_INVOICE ? "Record New Purchase" : "Place New Purchase Order");
        dialog.setHeaderText(
                currentType == InvoiceType.PURCHASE_INVOICE ? "Select supplier and add product arrival details"
                        : "Select supplier and add order details");

        VBox root = new VBox(10);
        root.setPadding(new Insets(20));

        ComboBox<Supplier> supplierCombo = new ComboBox<>();
        supplierCombo.setItems(FXCollections.observableArrayList(supplierService.getAllSuppliers()));
        supplierCombo.setPromptText("Select Supplier");

        ComboBox<Product> productCombo = new ComboBox<>();
        productCombo.setItems(FXCollections.observableArrayList(productService.getAllProducts()));
        productCombo.setPromptText("Select Product");

        TextField qtyField = new TextField();
        qtyField.setPromptText("Quantity Re-stocked");

        TextField priceField = new TextField();
        priceField.setPromptText("Unit Cost Price");

        root.getChildren().addAll(
                new Label("Supplier:"), supplierCombo,
                new Label("Product:"), productCombo,
                new Label("Quantity:"), qtyField,
                new Label("Cost Price:"), priceField);

        dialog.getDialogPane().setContent(root);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        Optional<ButtonType> result = dialog.showAndWait();
        if (result.isPresent() && result.get() == ButtonType.OK) {
            try {
                Supplier s = supplierCombo.getValue();
                Product p = productCombo.getValue();
                int qty = Integer.parseInt(qtyField.getText());
                BigDecimal price = new BigDecimal(priceField.getText());

                if (s == null || p == null) {
                    showError("Please select both supplier and product.");
                    return;
                }

                PurchaseInvoiceLine line = new PurchaseInvoiceLine();
                line.setProductId(p.getId());
                line.setQuantity(qty);
                line.setPrice(price);

                List<PurchaseInvoiceLine> lines = new ArrayList<>();
                lines.add(line);

                purchaseService.createPurchase(s.getId(), lines, currentType);
                loadPurchases();
                showInfo(currentType == InvoiceType.PURCHASE_INVOICE ? "Purchase recorded and stock updated."
                        : "Purchase order placed.");
            } catch (Exception e) {
                showError("Invalid input: " + e.getMessage());
            }
        }
    }

    @FXML
    public void showDetails() {
        PurchaseInvoice selected = table.getSelectionModel().getSelectedItem();
        if (selected == null)
            return;

        StringBuilder sb = new StringBuilder("Lines for Purchase #" + selected.getId() + ":\n");
        for (PurchaseInvoiceLine line : selected.getLines()) {
            sb.append("- Product ID: ").append(line.getProductId())
                    .append(", Qty: ").append(line.getQuantity())
                    .append(", Price: ").append(line.getPrice()).append("\n");
        }
        showInfo(sb.toString());
    }

    @FXML
    public void deleteSelected() {
        PurchaseInvoice selected = table.getSelectionModel().getSelectedItem();
        if (selected == null)
            return;
        purchaseService.deletePurchase(selected.getId());
        loadPurchases();
    }

    private void showError(String msg) {
        new Alert(Alert.AlertType.ERROR, msg).showAndWait();
    }

    private void showInfo(String msg) {
        new Alert(Alert.AlertType.INFORMATION, msg).showAndWait();
    }
}
