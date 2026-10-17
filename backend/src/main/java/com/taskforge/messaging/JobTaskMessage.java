package com.taskforge.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobTaskMessage implements Serializable {
    private String executionId;
    private String jobId;
    private String jobName;
    private String taskType;
    private String payload;
    private int attemptNumber;
    private int maxRetries;
    private int retryBackoffSeconds;
    private boolean retryExponential;
    private int timeoutSeconds;
    private String correlationId;
    private Instant enqueuedAt;
    private Map<String, Object> extraContext;
}
