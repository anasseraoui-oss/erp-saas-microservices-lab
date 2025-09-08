package com.eraoui.notificationservice.model;
import org.springframework.stereotype.Component;

@Component
public class SandMapper {

    public SandDTO toDTO(Sand sand) {
        if (sand == null) {
            return null;
        }

        SandDTO dto = new SandDTO();
        dto.setId(sand.getId());
        dto.setName(sand.getName());
        dto.setDescription(sand.getDescription());
        dto.setEmail(sand.getEmail());
        dto.setPhoneNumber(sand.getPhoneNumber());
        dto.setEnableStatus(sand.getEnableStatus());
        dto.setSandType(sand.getSandType());
        dto.setNotificationType(sand.getNotificationType());
        dto.setNotificationCount(sand.getNotifications() != null ? sand.getNotifications().size() : 0);

        return dto;
    }

    public Sand toEntity(SandDTO dto) {
        if (dto == null) {
            return null;
        }

        Sand sand = new Sand();
        sand.setId(dto.getId());
        sand.setName(dto.getName());
        sand.setDescription(dto.getDescription());
        sand.setEmail(dto.getEmail());
        sand.setPhoneNumber(dto.getPhoneNumber());
        sand.setEnableStatus(dto.getEnableStatus());
        sand.setSandType(dto.getSandType());
        sand.setNotificationType(dto.getNotificationType());

        return sand;
    }

    public void updateEntityFromDTO(SandDTO dto, Sand sand) {
        if (dto == null || sand == null) {
            return;
        }

        sand.setName(dto.getName());
        sand.setDescription(dto.getDescription());
        sand.setEmail(dto.getEmail());
        sand.setPhoneNumber(dto.getPhoneNumber());
        sand.setEnableStatus(dto.getEnableStatus());
        sand.setSandType(dto.getSandType());
        sand.setNotificationType(dto.getNotificationType());
    }
}