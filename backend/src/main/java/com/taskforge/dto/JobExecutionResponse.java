package com.taskforge.dto;

import com.taskforge.enums.ExecutionStatus;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobExecutionResponse {
    private String id;
    private String jobId;
    private String jobName;
    private Integer attemptNumber;
    private String workerId;
    private ExecutionStatus status;
    private Instant startedAt;
    private Instant completedAt;
    private Long durationMs;
    private String resultSummary;
    private String errorMessage;
    private String stackTrace;
    private String correlationId;
    private List<String> logs;
}
