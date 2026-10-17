package com.taskforge.dto;

import com.taskforge.enums.WorkerStatus;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerInstanceResponse {
    private String workerId;
    private String hostname;
    private WorkerStatus status;
    private Instant lastHeartbeat;
    private String currentTask;
    private Integer activeExecutions;
    private Integer maxConcurrency;
    private Long totalProcessed;
    private Long totalSuccess;
    private Long totalFailed;
    private String version;
    private Instant startedAt;
}
