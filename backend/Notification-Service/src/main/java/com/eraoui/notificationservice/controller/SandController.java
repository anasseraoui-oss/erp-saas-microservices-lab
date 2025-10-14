package com.eraoui.notificationservice.controller;
import com.eraoui.notificationservice.model.SandDTO;
import com.eraoui.notificationservice.model.SandMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.eraoui.notification.NotificationType;
import com.eraoui.notificationservice.repository.SandRepository;
import com.eraoui.notificationservice.model.Sand;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

@PreAuthorize("isAuthenticated()")
@RestController
@RequestMapping("/api/sand")
public class SandController {
    @Autowired
    private SandRepository sandRepository;

    @Autowired
    private SandMapper sandMapper;
    /**
     * Get all Sand entities as DTOs
     */
    @GetMapping("/")
    public ResponseEntity<List<SandDTO>> getAll() {
        try {
            List<Sand> sands = sandRepository.findAll();
            List<SandDTO> sandDTOs = sands.stream()
                    .map(sandMapper::toDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(sandDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get Sand by ID as DTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<SandDTO> getById(@PathVariable Long id) {
        try {
            Optional<Sand> sandOptional = sandRepository.findById(id);
            if (sandOptional.isPresent()) {
                SandDTO dto = sandMapper.toDTO(sandOptional.get());
                return ResponseEntity.ok(dto);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Create new Sand entity from DTO
     */
    @PostMapping("/")
    public ResponseEntity<SandDTO> save(@RequestBody SandDTO sandDTO) {
        try {
            // Convert DTO to entity
            Sand sand = sandMapper.toEntity(sandDTO);

            // Save the entity
            Sand savedSand = sandRepository.save(sand);

            // Convert back to DTO for response
            SandDTO responseDTO = sandMapper.toDTO(savedSand);

            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * Update existing Sand entity
     */
    @PutMapping("/{id}")
    public ResponseEntity<SandDTO> update(@PathVariable Long id, @RequestBody SandDTO sandDTO) {
        try {
            Optional<Sand> existingSandOptional = sandRepository.findById(id);
            if (existingSandOptional.isPresent()) {
                Sand existingSand = existingSandOptional.get();

                // Update entity from DTO
                sandMapper.updateEntityFromDTO(sandDTO, existingSand);

                // Save updated entity
                Sand updatedSand = sandRepository.save(existingSand);

                // Convert to DTO for response
                SandDTO responseDTO = sandMapper.toDTO(updatedSand);

                return ResponseEntity.ok(responseDTO);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * Delete Sand entity by ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteById(@PathVariable Long id) {
        try {
            if (sandRepository.existsById(id)) {
                sandRepository.deleteById(id);
                return ResponseEntity.ok("Sand with ID " + id + " deleted successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting Sand with ID " + id + ": " + e.getMessage());
        }
    }

    /**
     * Get emails by notification type
     */
    @GetMapping("/Emails")
    public ResponseEntity<List<String>> getEmailsByType(@RequestParam String notificationType) {
        try {
            // Assuming you have a method in repository to find by notification type
            List<Sand> sands = sandRepository.findByNotificationType(NotificationType.valueOf(notificationType));
            List<String> emails = sands.stream()
                    .map(Sand::getEmail)
                    .filter(email -> email != null && !email.trim().isEmpty())
                    .collect(Collectors.toList());
            return ResponseEntity.ok(emails);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}