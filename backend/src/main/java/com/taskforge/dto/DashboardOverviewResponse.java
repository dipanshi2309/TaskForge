package com.taskforge.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardOverviewResponse {
    private long totalJobs;
    private long currentlyRunning;
    private long failedToday;
    private double successRate;
    private double averageExecutionTimeMs;
    private List<ExecutionTrendDto> executionTrends;
    private List<QueueDepthDto> queueDepths;
    private List<JobExecutionResponse> recentExecutions;
    private List<JobResponse> upcomingJobs;
    private List<JobExecutionResponse> recentFailures;
    private long onlineWorkersCount;
    private long totalWorkersCount;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExecutionTrendDto {
        private String time;
        private long succeeded;
        private long failed;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QueueDepthDto {
        private String queue;
        private long messages;
        private long dlq;
    }
}
