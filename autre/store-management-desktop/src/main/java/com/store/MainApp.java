package com.store;

import com.store.infrastructure.persistence.DataInitializer;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.IOException;

/**
 * Main entry point for the Store Management Desktop application.
 * Launches the primary window with the main dashboard.
 */
public class MainApp extends Application {

    @Override
    public void start(Stage stage) throws IOException {
        DataInitializer.seedIfEmpty();
        FXMLLoader loader = new FXMLLoader(getClass().getResource("/fxml/login.fxml"));
        Parent root = loader.load();
        Scene scene = new Scene(root, 600, 450);
        stage.setTitle("Store Management - Login");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
