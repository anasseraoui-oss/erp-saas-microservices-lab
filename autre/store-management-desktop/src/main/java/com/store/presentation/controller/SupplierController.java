package com.store.presentation.controller;

import com.store.application.service.SupplierService;
import com.store.domain.entity.Supplier;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.VBox;

import java.util.Optional;

public class SupplierController {

    @FXML
    private TextField searchField;
    @FXML
    private TableView<Supplier> table;
    @FXML
    private TableColumn<Supplier, Long> colId;
    @FXML
    private TableColumn<Supplier, String> colName;
    @FXML
    private TableColumn<Supplier, String> colEmail;
    @FXML
    private TableColumn<Supplier, String> colPhone;
    @FXML
    private TableColumn<Supplier, java.math.BigDecimal> colPurchases;

    private final SupplierService supplierService = new SupplierService();
    private final ObservableList<Supplier> items = FXCollections.observableArrayList();

    @FXML
    public void initialize() {
        colId.setCellValueFactory(new PropertyValueFactory<>("id"));
        colName.setCellValueFactory(new PropertyValueFactory<>("name"));
        colEmail.setCellValueFactory(new PropertyValueFactory<>("email"));
        colPhone.setCellValueFactory(new PropertyValueFactory<>("phone"));
        colPurchases.setCellValueFactory(new PropertyValueFactory<>("totalPurchasesAmount"));
        table.setItems(items);
        loadSuppliers();
    }

    private void loadSuppliers() {
        items.clear();
        items.addAll(supplierService.getAllSuppliers());
    }

    @FXML
    public void search() {
        String t = searchField.getText();
        items.clear();
        if (t == null || t.isBlank()) {
            items.addAll(supplierService.getAllSuppliers());
        } else {
            items.addAll(supplierService.searchByName(t));
        }
    }

    @FXML
    public void showAddDialog() {
        showSupplierDialog(null);
    }

    @FXML
    public void editSelected() {
        Supplier s = table.getSelectionModel().getSelectedItem();
        if (s == null) {
            showInfo("Please select a supplier to edit.");
            return;
        }
        showSupplierDialog(s);
    }

    @FXML
    public void deleteSelected() {
        Supplier s = table.getSelectionModel().getSelectedItem();
        if (s == null) {
            showInfo("Please select a supplier to delete.");
            return;
        }
        Alert a = new Alert(Alert.AlertType.CONFIRMATION, "Delete supplier '" + s.getName() + "'?");
        if (a.showAndWait().filter(b -> b == ButtonType.OK).isPresent()) {
            try {
                supplierService.deleteSupplier(s.getId());
                loadSuppliers();
            } catch (Exception e) {
                showError(e.getMessage());
            }
        }
    }

    private void showSupplierDialog(Supplier existing) {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle(existing == null ? "Add Supplier" : "Edit Supplier");
        dialog.setHeaderText(existing == null ? "Enter supplier details" : "Edit supplier details");

        VBox v = new VBox(10);
        v.setPadding(new Insets(20));
        TextField nameField = new TextField(existing != null ? existing.getName() : "");
        nameField.setPromptText("Name");
        TextField emailField = new TextField(existing != null ? existing.getEmail() : "");
        emailField.setPromptText("Email");
        TextField phoneField = new TextField(existing != null ? existing.getPhone() : "");
        phoneField.setPromptText("Phone");
        TextField addressField = new TextField(existing != null ? existing.getAddress() : "");
        addressField.setPromptText("Address");

        v.getChildren().addAll(
                new Label("Name:"), nameField,
                new Label("Email:"), emailField,
                new Label("Phone:"), phoneField,
                new Label("Address:"), addressField);
        dialog.getDialogPane().setContent(v);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        Optional<ButtonType> r = dialog.showAndWait();
        if (r.isPresent() && r.get() == ButtonType.OK) {
            try {
                String name = nameField.getText().trim();
                String email = emailField.getText().trim();
                String phone = phoneField.getText().trim();
                String address = addressField.getText().trim();
                if (name.isEmpty()) {
                    showError("Name is required.");
                    return;
                }
                if (existing == null) {
                    supplierService.createSupplier(name, email, phone, address);
                } else {
                    supplierService.updateSupplier(existing.getId(), name, email, phone, address);
                }
                loadSuppliers();
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
