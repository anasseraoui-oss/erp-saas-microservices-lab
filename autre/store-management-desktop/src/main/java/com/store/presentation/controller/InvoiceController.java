package com.store.presentation.controller;

import com.store.application.service.InvoiceService;
import com.store.application.service.PaymentService;
import com.store.application.service.ProductService;
import com.store.domain.entity.*;
import javafx.beans.property.SimpleObjectProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.VBox;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Invoice list, create, and payment controller.
 */
public class InvoiceController {

    @FXML
    private TableView<Invoice> table;
    @FXML
    private TableColumn<Invoice, Long> colId;
    @FXML
    private TableColumn<Invoice, String> colDate;
    @FXML
    private TableColumn<Invoice, Long> colCustomer;
    @FXML
    private TableColumn<Invoice, BigDecimal> colTotal;
    @FXML
    private TableColumn<Invoice, PaymentStatus> colStatus;

    private final InvoiceService invoiceService = new InvoiceService();
    private final PaymentService paymentService = new PaymentService();
    private final ProductService productService = new ProductService();
    private final ObservableList<Invoice> items = FXCollections.observableArrayList();

    private InvoiceType currentType = InvoiceType.SALES_INVOICE;

    public void setType(InvoiceType type) {
        this.currentType = type;
        loadInvoices();
    }

    @FXML
    public void initialize() {
        colId.setCellValueFactory(new PropertyValueFactory<>("id"));
        colDate.setCellValueFactory(c -> new SimpleObjectProperty<>(
                c.getValue().getDate().format(DateTimeFormatter.ISO_LOCAL_DATE)));
        colCustomer.setCellValueFactory(new PropertyValueFactory<>("customerId"));
        colTotal.setCellValueFactory(new PropertyValueFactory<>("totalAmount"));
        colStatus.setCellValueFactory(new PropertyValueFactory<>("paymentStatus"));
        table.setItems(items);
        try {
            loadInvoices();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void loadInvoices() {
        items.clear();
        items.addAll(invoiceService.getInvoicesByType(currentType));
    }

    @FXML
    public void showCreateInvoice() {
        Dialog<Boolean> d = new Dialog<>();
        d.setTitle(currentType == InvoiceType.SALES_INVOICE ? "Create Sales Invoice" : "Create Sales Order");
        d.setHeaderText(
                currentType == InvoiceType.SALES_INVOICE ? "Add products to the invoice" : "Add products to the order");

        VBox v = new VBox(10);
        v.setPadding(new Insets(20));
        TextField customerField = new TextField();
        customerField.setPromptText("Customer ID (optional, 0 for none)");
        ComboBox<String> productCombo = new ComboBox<>();
        productCombo.setPromptText("Select product");
        productCombo.getItems().addAll(productService.getAllProducts().stream()
                .map(p -> p.getId() + " - " + p.getName() + " (qty: " + p.getQuantity() + ")")
                .toList());
        TextField qtyField = new TextField("1");
        qtyField.setPromptText("Quantity");
        ListView<String> lineList = new ListView<>();
        lineList.setPrefHeight(150);
        Button addLine = new Button("Add Line");
        List<InvoiceService.InvoiceLineDto> lines = new ArrayList<>();

        addLine.setOnAction(e -> {
            String sel = productCombo.getSelectionModel().getSelectedItem();
            if (sel == null) {
                showInfo("Select a product.");
                return;
            }
            int qty;
            try {
                qty = Integer.parseInt(qtyField.getText().trim());
            } catch (NumberFormatException ex) {
                showError("Invalid quantity.");
                return;
            }
            long pid = Long.parseLong(sel.split(" - ")[0]);
            Product p = productService.getById(pid).orElse(null);
            if (p == null)
                return;
            BigDecimal price = p.getPrice();
            lines.add(new InvoiceService.InvoiceLineDto(pid, qty, price));
            lineList.getItems()
                    .add(p.getName() + " x " + qty + " @ " + price + " = " + price.multiply(BigDecimal.valueOf(qty)));
        });

        v.getChildren().addAll(
                new Label("Customer ID:"), customerField,
                new Label("Product:"), productCombo,
                new Label("Quantity:"), qtyField,
                addLine,
                new Label("Lines:"), lineList);
        d.getDialogPane().setContent(v);
        d.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        d.setResultConverter(btn -> btn == ButtonType.OK);
        if (d.showAndWait().orElse(false)) {
            if (lines.isEmpty()) {
                showError("Add at least one line.");
                return;
            }
            try {
                long cid = 0;
                if (!customerField.getText().trim().isEmpty()) {
                    cid = Long.parseLong(customerField.getText().trim());
                }
                invoiceService.createInvoice(cid, lines, PaymentStatus.UNPAID, currentType);
                loadInvoices();
            } catch (Exception ex) {
                showError(ex.getMessage());
            }
        }
    }

    @FXML
    public void showPaymentOrDetails() {
        Invoice inv = table.getSelectionModel().getSelectedItem();
        if (inv == null) {
            showInfo("Select an invoice.");
            return;
        }
        if (inv.getPaymentStatus() == PaymentStatus.PAID) {
            showInfo("Invoice #" + inv.getId() + " is already fully paid.");
            return;
        }

        TextInputDialog d = new TextInputDialog("0");
        d.setTitle("Add Payment");
        d.setHeaderText("Invoice #" + inv.getId() + " - Total: " + inv.getTotalAmount());
        d.setContentText("Amount to pay:");
        Optional<String> r = d.showAndWait();
        r.ifPresent(amtStr -> {
            try {
                BigDecimal amt = new BigDecimal(amtStr.trim());
                if (amt.compareTo(BigDecimal.ZERO) <= 0) {
                    showError("Amount must be positive.");
                    return;
                }
                paymentService.registerPayment(inv.getId(), amt, "CASH");
                loadInvoices();
            } catch (NumberFormatException e) {
                showError("Invalid amount.");
            } catch (Exception e) {
                showError(e.getMessage());
            }
        });
    }

    @FXML
    public void deleteSelected() {
        Invoice inv = table.getSelectionModel().getSelectedItem();
        if (inv == null) {
            showInfo("Select an invoice.");
            return;
        }
        Alert a = new Alert(Alert.AlertType.CONFIRMATION, "Delete invoice #" + inv.getId() + "?");
        if (a.showAndWait().filter(b -> b == ButtonType.OK).isPresent()) {
            try {
                invoiceService.deleteInvoice(inv.getId());
                loadInvoices();
            } catch (Exception e) {
                showError(e.getMessage());
            }
        }
    }

    private void showError(String msg) {
        new Alert(Alert.AlertType.ERROR, msg).showAndWait();
    }

    private void showInfo(String msg) {
        new Alert(Alert.AlertType.INFORMATION, msg).showAndWait();
    }
}
