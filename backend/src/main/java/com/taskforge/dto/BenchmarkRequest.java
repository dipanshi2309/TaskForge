package com.taskforge.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BenchmarkRequest {
    @Builder.Default
    private int jobCount = 50;

    @Builder.Default
    private int workerCount = 4;

    @Builder.Default
    private int concurrencyPerWorker = 5;

    @Builder.Default
    private int simulatedDurationMs = 150;

    @Builder.Default
    private int failureRatePercent = 10;

    @Builder.Default
    private int maxRetries = 2;
}
