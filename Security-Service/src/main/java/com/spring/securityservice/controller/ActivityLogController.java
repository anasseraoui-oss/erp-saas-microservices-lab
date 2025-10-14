package com.spring.securityservice.controller;

import com.spring.securityservice.dto.ActivityLogDto;
import com.spring.securityservice.model.ActivityLog;
import com.spring.securityservice.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RequestMapping("/api/activities")
@RestController
public class ActivityLogController {

    @Autowired
    private ActivityLogService activityLogService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ActivityLogDto> logActivity(@RequestBody ActivityLogDto activityLogDto) {
        ActivityLog activityLog = new ActivityLog();
        activityLog.setUserId(activityLogDto.getUserId());
        activityLog.setUserFullName(activityLogDto.getUserFullName());
        activityLog.setActivityType(activityLogDto.getActivityType());
        activityLog.setDescription(activityLogDto.getDescription());
        activityLog.setDetails(activityLogDto.getDetails());

        ActivityLog savedActivity = activityLogService.saveActivity(activityLog);

        ActivityLogDto savedActivityDto = new ActivityLogDto();
        savedActivityDto.setId(savedActivity.getId());
        savedActivityDto.setUserId(savedActivity.getUserId());
        savedActivityDto.setUserFullName(savedActivity.getUserFullName());
        savedActivityDto.setActivityType(savedActivity.getActivityType());
        savedActivityDto.setDescription(savedActivity.getDescription());
        savedActivityDto.setTimestamp(savedActivity.getTimestamp());
        savedActivityDto.setDetails(savedActivity.getDetails());

        return ResponseEntity.ok(savedActivityDto);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ActivityLogDto>> getAllActivities() {
        List<ActivityLog> activities = activityLogService.getAllActivities();
        List<ActivityLogDto> activityLogDtos = activities.stream().map(activityLog -> {
            ActivityLogDto dto = new ActivityLogDto();
            dto.setId(activityLog.getId());
            dto.setUserId(activityLog.getUserId());
            dto.setUserFullName(activityLog.getUserFullName());
            dto.setActivityType(activityLog.getActivityType());
            dto.setDescription(activityLog.getDescription());
            dto.setTimestamp(activityLog.getTimestamp());
            dto.setDetails(activityLog.getDetails());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(activityLogDtos);
    }
}
