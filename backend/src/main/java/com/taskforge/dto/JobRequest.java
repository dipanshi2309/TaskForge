package com.taskforge.dto;

import com.taskforge.enums.JobPriority;
import com.taskforge.enums.JobStatus;
import com.taskforge.enums.ScheduleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobRequest {

    @NotBlank(message = "Job name is required")
    private String name;

    private String description;

    @NotBlank(message = "Task type is required")
    private String taskType;

    private String payload;

    @NotNull(message = "Schedule type is required")
    private ScheduleType scheduleType;

    private String cronExpression;

    private Long fixedIntervalSeconds;

    private Instant startTime;

    private Instant endTime;

    @NotBlank(message = "Time zone is required")
    @Builder.Default
    private String timeZone = "UTC";

    @NotNull(message = "Priority is required")
    @Builder.Default
    private JobPriority priority = JobPriority.NORMAL;

    @Builder.Default
    private Integer maxRetries = 3;

    @Builder.Default
    private Integer retryBackoffSeconds = 5;

    @Builder.Default
    private Boolean retryExponential = true;

    @Builder.Default
    private Integer timeoutSeconds = 60;

    @Builder.Default
    private String targetQueue = "taskforge.jobs.default";

    private List<String> dependencyJobIds;
}
