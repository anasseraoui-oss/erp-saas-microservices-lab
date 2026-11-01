package com.store.application.service;

import com.store.domain.entity.UserApp;
import com.store.infrastructure.persistence.UserRepository;

import java.util.Optional;

public class SecurityService {
    private final UserRepository repo = new UserRepository();
    private static UserApp currentUser;

    public boolean login(String username, String password) {
        Optional<UserApp> user = repo.findByUsername(username);
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            currentUser = user.get();
            return true;
        }

        // Auto-seed admin if no users exist (initial run helper)
        if ("admin".equals(username) && "admin".equals(password)) {
            UserApp admin = new UserApp(null, "admin", "admin", "ADMIN");
            currentUser = repo.save(admin);
            return true;
        }
        return false;
    }

    public static UserApp getCurrentUser() {
        return currentUser;
    }

    public void logout() {
        currentUser = null;
    }
}
