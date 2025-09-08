package com.spring.securityservice.service;

import com.spring.securityservice.dto.RegisterUserDto;
import com.spring.securityservice.model.Role;
import com.spring.securityservice.model.User;
import com.spring.securityservice.repository.RoleRepository;
import com.spring.securityservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder ;
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> allUsers() {
        return userRepository.findAll();
    }

    @Transactional // Very important: ensures the whole operation succeeds or fails together
    public User createUserWithRoles(User user, Set<Role> rolesFromDto) {
        // 1. Set username to be the same as email
        user.setEmail(user.getEmail());

        // 2. Encode the password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 3. Fetch the full Role objects from the database using their IDs
        Set<Long> roleIds = rolesFromDto.stream()
                .map(Role::getId)
                .collect(Collectors.toSet());

        // This finds all roles that actually exist in the DB
        Set<Role> persistentRoles = new HashSet<>(roleRepository.findAllById(roleIds));

        // 4. Assign the roles to the user
        user.setRoles(persistentRoles);

        // 5. Save the user. Because of @Transactional, the user_roles table will be updated.
        return userRepository.save(user);
    }



    private void addRoleToUser(String username, String roleName) {
        Optional<User> userOptional = userRepository.findByEmail(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Optional<Role> role= roleRepository.findByName(roleName);
            user.getRoles().add(role.get());
            userRepository.save(user);
        } else {
            throw new RuntimeException("User not found: " + username);
        }
    }

    @Transactional
    public User updateUser(Long id, User userDetails) {
        // Find the existing user in the database or throw an exception
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Update the fields from the request data
        // Add more fields as needed (e.g., fullName, enabled status)
        if (userDetails.getEmail() != null) {
            existingUser.setEmail(userDetails.getEmail());
        }
        if (userDetails.getPassword() != null) {
            existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        if (userDetails.getFullName() != null) {
            existingUser.setFullName(userDetails.getFullName());
        }
        if (userDetails.getUpdatedAt() != null) {
            existingUser.setUpdatedAt(new Date());
        }
        if (userDetails.getRoles()!=null) existingUser.setRoles(userDetails.getRoles());
         //updateRoles(existingUser.getId(),userDetails.getRoles());
        // You might want to handle password changes separately and securely
        // if (userDetails.getPassword() != null) {
        //     existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        // }

        // Note: Role updates are handled separately in your `UserDetailsModal` via add/remove endpoints.
        // We do not update roles here to avoid conflicts.

        return userRepository.save(existingUser);
    }

    public void deleteUser(Integer userId) {
        userRepository.deleteById(Long.valueOf(userId));
    }


    public Optional<User> getUserById(Integer userId) {
        return userRepository.findById(Long.valueOf(userId));
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByEmail(username);
    }

    public User updateRoles(Long userId, Set<Role> roles) {
        User user = userRepository.findById(userId).orElse(null);
        for (Role role : roles) {
            assert user != null;
            user.getRoles().remove(role);
        }
        assert user != null;
        user.getRoles().addAll(roles);
        return userRepository.save(user);
    }

    public List<RegisterUserDto> searchAccounts(String query) {
        List<User> users = userRepository.searchUsers(query);

        return users.stream()
                .map(user -> new RegisterUserDto(user.getUsername(), user.getRoles()))
                .collect(Collectors.toList());
    }
}