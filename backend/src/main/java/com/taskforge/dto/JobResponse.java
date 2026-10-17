package com.taskforge.dto;

import com.taskforge.enums.JobPriority;
import com.taskforge.enums.JobStatus;
import com.taskforge.enums.ScheduleType;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobResponse {
    private String id;
    private String name;
    private String description;
    private String taskType;
    private String payload;
    private ScheduleType scheduleType;
    private String cronExpression;
    private Long fixedIntervalSeconds;
    private Instant startTime;
    private Instant endTime;
    private String timeZone;
    private JobPriority priority;
    private JobStatus status;
    private Integer maxRetries;
    private Integer retryBackoffSeconds;
    private Boolean retryExponential;
    private Integer timeoutSeconds;
    private String targetQueue;
    private Instant nextRunAt;
    private Instant lastRunAt;
    private List<String> dependencyJobIds;
    private Instant createdAt;
    private Instant updatedAt;
}
