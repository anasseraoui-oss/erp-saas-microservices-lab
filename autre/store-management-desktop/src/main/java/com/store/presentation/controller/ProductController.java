package com.store.presentation.controller;

import com.store.application.service.ProductService;
import com.store.domain.entity.Product;
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
import java.util.Optional;

/**
 * Product list and CRUD controller.
 */
public class ProductController {

    @FXML
    private TextField searchField;
    @FXML
    private TableView<Product> table;
    @FXML
    private TableColumn<Product, Long> colId;
    @FXML
    private TableColumn<Product, String> colName;
    @FXML
    private TableColumn<Product, String> colBarcode;
    @FXML
    private TableColumn<Product, Integer> colQuantity;
    @FXML
    private TableColumn<Product, BigDecimal> colPrice;
    @FXML
    private TableColumn<Product, String> colCategory;

    private final ProductService productService = new ProductService();
    private final ObservableList<Product> items = FXCollections.observableArrayList();

    @FXML
    public void initialize() {
        colId.setCellValueFactory(new PropertyValueFactory<>("id"));
        colName.setCellValueFactory(new PropertyValueFactory<>("name"));
        colBarcode.setCellValueFactory(new PropertyValueFactory<>("barcode"));
        colQuantity.setCellValueFactory(new PropertyValueFactory<>("quantity"));
        colPrice.setCellValueFactory(c -> new SimpleObjectProperty<>(c.getValue().getPrice()));
        colCategory.setCellValueFactory(new PropertyValueFactory<>("category"));

        // Add alert highlighting
        table.setRowFactory(tv -> new TableRow<Product>() {
            @Override
            protected void updateItem(Product item, boolean empty) {
                super.updateItem(item, empty);
                if (item == null || empty) {
                    setStyle("");
                } else if (item.isExpired()) {
                    setStyle("-fx-background-color: #ffcccc;"); // Light red for expired
                } else if (item.isLowStock()) {
                    setStyle("-fx-background-color: #fff9c4;"); // Light yellow for low stock
                } else {
                    setStyle("");
                }
            }
        });

        table.setItems(items);
        loadProducts();
    }

    private void loadProducts() {
        items.clear();
        items.addAll(productService.getAllProducts());
    }

    @FXML
    public void search() {
        String t = searchField.getText();
        items.clear();
        if (t == null || t.isBlank()) {
            items.addAll(productService.getAllProducts());
        } else {
            items.addAll(productService.searchByName(t));
        }
    }

    @FXML
    public void showAddDialog() {
        showProductDialog(null);
    }

    @FXML
    public void editSelected() {
        Product p = table.getSelectionModel().getSelectedItem();
        if (p == null) {
            showInfo("Please select a product to edit.");
            return;
        }
        showProductDialog(p);
    }

    @FXML
    public void deleteSelected() {
        Product p = table.getSelectionModel().getSelectedItem();
        if (p == null) {
            showInfo("Please select a product to delete.");
            return;
        }
        if (!confirm("Delete product '" + p.getName() + "'?"))
            return;
        try {
            productService.deleteProduct(p.getId());
            loadProducts();
        } catch (Exception e) {
            showError(e.getMessage());
        }
    }

    private void showProductDialog(Product existing) {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle(existing == null ? "Add Product" : "Edit Product");
        dialog.setHeaderText(existing == null ? "Enter product details" : "Edit product details");

        VBox v = new VBox(10);
        v.setPadding(new Insets(20));
        TextField nameField = new TextField(existing != null ? existing.getName() : "");
        nameField.setPromptText("Name");
        TextField barcodeField = new TextField(existing != null ? existing.getBarcode() : "");
        barcodeField.setPromptText("Barcode");
        TextField qtyField = new TextField(existing != null ? String.valueOf(existing.getQuantity()) : "0");
        qtyField.setPromptText("Quantity");
        TextField priceField = new TextField(existing != null ? existing.getPrice().toString() : "0");
        priceField.setPromptText("Price");
        TextField catField = new TextField(existing != null ? existing.getCategory() : "");
        catField.setPromptText("Category");
        TextField minStockField = new TextField(
                existing != null && existing.getMinStockLevel() != null ? String.valueOf(existing.getMinStockLevel())
                        : "5");
        minStockField.setPromptText("Min Stock Level");
        DatePicker expiryPicker = new DatePicker(existing != null ? existing.getExpiryDate() : null);
        expiryPicker.setPromptText("Expiry Date");

        v.getChildren().addAll(
                new Label("Name:"), nameField,
                new Label("Barcode:"), barcodeField,
                new Label("Quantity:"), qtyField,
                new Label("Price:"), priceField,
                new Label("Category:"), catField,
                new Label("Min Stock Level:"), minStockField,
                new Label("Expiry Date:"), expiryPicker);
        dialog.getDialogPane().setContent(v);
        ButtonType ok = ButtonType.OK;
        ButtonType cancel = ButtonType.CANCEL;
        dialog.getDialogPane().getButtonTypes().addAll(ok, cancel);

        Optional<ButtonType> r = dialog.showAndWait();
        if (r.isPresent() && r.get() == ok) {
            try {
                String name = nameField.getText().trim();
                int qty = Integer.parseInt(qtyField.getText().trim());
                BigDecimal price = new BigDecimal(priceField.getText().trim());
                Integer minStock = minStockField.getText().trim().isEmpty() ? null
                        : Integer.parseInt(minStockField.getText().trim());
                LocalDate expiry = expiryPicker.getValue();

                if (name.isEmpty()) {
                    showError("Name is required.");
                    return;
                }
                if (existing == null) {
                    productService.createProduct(name, barcodeField.getText().trim(), qty, price,
                            catField.getText().trim(), minStock, expiry);
                } else {
                    productService.updateProduct(existing.getId(), name, barcodeField.getText().trim(), qty, price,
                            catField.getText().trim(), minStock, expiry);
                }
                loadProducts();
            } catch (NumberFormatException e) {
                showError("Invalid number for quantity or price.");
            } catch (Exception e) {
                showError(e.getMessage());
            }
        }
    }

    private void showError(String msg) {
        Alert a = new Alert(Alert.AlertType.ERROR);
        a.setContentText(msg);
        a.showAndWait();
    }

    private void showInfo(String msg) {
        Alert a = new Alert(Alert.AlertType.INFORMATION);
        a.setContentText(msg);
        a.showAndWait();
    }

    private boolean confirm(String msg) {
        Alert a = new Alert(Alert.AlertType.CONFIRMATION);
        a.setContentText(msg);
        return a.showAndWait().filter(b -> b == ButtonType.OK).isPresent();
    }
}
