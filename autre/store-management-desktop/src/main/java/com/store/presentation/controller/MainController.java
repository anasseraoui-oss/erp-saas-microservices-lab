package com.store.presentation.controller;

import com.store.domain.entity.InvoiceType;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.control.Alert;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

import java.io.IOException;

/**
 * Main window controller - loads sub-views for Products, Invoices, Customers.
 */
public class MainController {

    @FXML
    private StackPane contentPane;

    @FXML
    public void initialize() {
        showDashboard();
    }

    @FXML
    private void showDashboard() {
        loadView("/fxml/dashboard.fxml");
    }

    @FXML
    private void showProducts() {
        loadView("/fxml/products.fxml");
    }

    @FXML
    private void showInvoices() {
        loadView("/fxml/invoices.fxml", InvoiceType.SALES_INVOICE);
    }

    @FXML
    private void showSalesOrders() {
        loadView("/fxml/invoices.fxml", InvoiceType.SALES_ORDER);
    }

    @FXML
    private void showCustomers() {
        loadView("/fxml/customers.fxml");
    }

    @FXML
    private void showSuppliers() {
        loadView("/fxml/suppliers.fxml");
    }

    @FXML
    private void showPurchases() {
        loadView("/fxml/purchase_invoices.fxml", InvoiceType.PURCHASE_INVOICE);
    }

    @FXML
    private void showPurchaseOrders() {
        loadView("/fxml/purchase_invoices.fxml", InvoiceType.PURCHASE_ORDER);
    }

    @FXML
    private void exit() {
        System.exit(0);
    }

    private void loadView(String path) {
        loadView(path, null);
    }

    private void loadView(String path, InvoiceType type) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource(path));
            Parent root = loader.load();

            // Set type if applicable
            Object controller = loader.getController();
            if (controller instanceof InvoiceController && type != null) {
                ((InvoiceController) controller).setType(type);
            } else if (controller instanceof PurchaseInvoiceListController && type != null) {
                ((PurchaseInvoiceListController) controller).setType(type);
            }

            contentPane.getChildren().clear();
            contentPane.getChildren().add(root);
        } catch (IOException e) {
            Throwable root = e;
            while (root.getCause() != null) root = root.getCause();
            String detail = root.getClass().getSimpleName() + ": " + root.getMessage();
            e.printStackTrace();
            showError("Could not load view: " + path + "\n\nCause: " + detail);
        }
    }

    private void showError(String msg) {
        Alert a = new Alert(Alert.AlertType.ERROR);
        a.setContentText(msg);
        a.showAndWait();
    }
}
