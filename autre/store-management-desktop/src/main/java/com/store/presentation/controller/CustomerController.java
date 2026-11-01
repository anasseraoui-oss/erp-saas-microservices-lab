package com.store.presentation.controller;

import com.store.application.service.CustomerService;
import com.store.domain.entity.Customer;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.VBox;

import java.util.Optional;

/**
 * Customer list and CRUD controller.
 */
public class CustomerController {

    @FXML
    private TextField searchField;
    @FXML
    private TableView<Customer> table;
    @FXML
    private TableColumn<Customer, Long> colId;
    @FXML
    private TableColumn<Customer, String> colName;
    @FXML
    private TableColumn<Customer, String> colEmail;
    @FXML
    private TableColumn<Customer, String> colPhone;
    @FXML
    private TableColumn<Customer, java.math.BigDecimal> colTotal;

    private final CustomerService customerService = new CustomerService();
    private final ObservableList<Customer> items = FXCollections.observableArrayList();

    @FXML
    public void initialize() {
        colId.setCellValueFactory(new PropertyValueFactory<>("id"));
        colName.setCellValueFactory(new PropertyValueFactory<>("name"));
        colEmail.setCellValueFactory(new PropertyValueFactory<>("email"));
        colPhone.setCellValueFactory(new PropertyValueFactory<>("phone"));
        colTotal.setCellValueFactory(new PropertyValueFactory<>("totalOrdersAmount"));
        table.setItems(items);
        loadCustomers();
    }

    private void loadCustomers() {
        items.clear();
        items.addAll(customerService.getAllCustomers());
    }

    @FXML
    public void search() {
        String t = searchField.getText();
        items.clear();
        if (t == null || t.isBlank()) {
            items.addAll(customerService.getAllCustomers());
        } else {
            items.addAll(customerService.searchByName(t));
        }
    }

    @FXML
    public void showAddDialog() {
        showCustomerDialog(null);
    }

    @FXML
    public void editSelected() {
        Customer c = table.getSelectionModel().getSelectedItem();
        if (c == null) {
            showInfo("Please select a customer to edit.");
            return;
        }
        showCustomerDialog(c);
    }

    @FXML
    public void deleteSelected() {
        Customer c = table.getSelectionModel().getSelectedItem();
        if (c == null) {
            showInfo("Please select a customer to delete.");
            return;
        }
        if (!confirm("Delete customer '" + c.getName() + "'?"))
            return;
        try {
            customerService.deleteCustomer(c.getId());
            loadCustomers();
        } catch (Exception e) {
            showError(e.getMessage());
        }
    }

    private void showCustomerDialog(Customer existing) {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle(existing == null ? "Add Customer" : "Edit Customer");
        dialog.setHeaderText(existing == null ? "Enter customer details" : "Edit customer details");

        VBox v = new VBox(10);
        v.setPadding(new Insets(20));
        TextField nameField = new TextField(existing != null ? existing.getName() : "");
        nameField.setPromptText("Name");
        TextField emailField = new TextField(existing != null ? existing.getEmail() : "");
        emailField.setPromptText("Email");
        TextField phoneField = new TextField(existing != null ? existing.getPhone() : "");
        phoneField.setPromptText("Phone");

        v.getChildren().addAll(
                new Label("Name:"), nameField,
                new Label("Email:"), emailField,
                new Label("Phone:"), phoneField);
        dialog.getDialogPane().setContent(v);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        Optional<ButtonType> r = dialog.showAndWait();
        if (r.isPresent() && r.get() == ButtonType.OK) {
            try {
                String name = nameField.getText().trim();
                String email = emailField.getText().trim();
                String phone = phoneField.getText().trim();
                if (name.isEmpty()) {
                    showError("Name is required.");
                    return;
                }
                if (existing == null) {
                    customerService.createCustomer(name, email, phone);
                } else {
                    customerService.updateCustomer(existing.getId(), name, email, phone);
                }
                loadCustomers();
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
