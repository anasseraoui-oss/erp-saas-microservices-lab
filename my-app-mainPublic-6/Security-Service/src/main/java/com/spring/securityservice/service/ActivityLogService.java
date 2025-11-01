package com.spring.securityservice.service;

import com.spring.securityservice.model.ActivityLog;
import com.spring.securityservice.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public ActivityLog saveActivity(ActivityLog activityLog) {
        return activityLogRepository.save(activityLog);
    }

    public List<ActivityLog> getAllActivities() {
        return activityLogRepository.findAll();
    }
}
