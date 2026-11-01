package com.store.presentation.controller;

import com.store.application.service.SecurityService;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

import java.io.IOException;

public class LoginController {

    @FXML
    private TextField usernameField;
    @FXML
    private PasswordField passwordField;
    @FXML
    private Label errorLabel;

    private final SecurityService securityService = new SecurityService();

    @FXML
    public void handleLogin() {
        String u = usernameField.getText().trim();
        String p = passwordField.getText();

        if (securityService.login(u, p)) {
            navigateToMain();
        } else {
            errorLabel.setText("Invalid username or password.");
        }
    }

    private void navigateToMain() {
        try {
            Stage stage = (Stage) usernameField.getScene().getWindow();
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/fxml/main.fxml"));
            Parent root = loader.load();
            Scene scene = new Scene(root, 1000, 650);
            stage.setScene(scene);
            stage.setTitle("Store Management - Dashboard");
            stage.centerOnScreen();
        } catch (IOException e) {
            errorLabel.setText("Error loading main view: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
