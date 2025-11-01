package com.spring.securityservice.dto;

import lombok.Data;

import java.util.Date;

@Data
public class ActivityLogDto {
    private Long id;
    private Long userId;
    private String userFullName;
    private String activityType;
    private String description;
    private Date timestamp;
    private String details;
}
