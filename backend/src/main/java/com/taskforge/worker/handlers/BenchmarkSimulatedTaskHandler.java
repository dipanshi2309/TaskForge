package com.taskforge.worker.handlers;

import com.taskforge.worker.TaskHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Random;

@Slf4j
@Component
public class BenchmarkSimulatedTaskHandler implements TaskHandler {

    private final Random random = new Random();

    @Override
    public String getTaskType() {
        return "SIMULATED_BENCHMARK_TASK";
    }

    @Override
    public String execute(String jobId, String payload, Map<String, Object> context) throws Exception {
        int durationMs = 100;
        int failRate = 0;

        if (context != null) {
            if (context.containsKey("simulatedDurationMs")) {
                durationMs = ((Number) context.get("simulatedDurationMs")).intValue();
            }
            if (context.containsKey("failureRatePercent")) {
                failRate = ((Number) context.get("failureRatePercent")).intValue();
            }
        }

        if (failRate > 0 && random.nextInt(100) < failRate) {
            Thread.sleep(Math.max(10, durationMs / 2));
            throw new RuntimeException("Simulated transient failure in benchmark execution for jobId: " + jobId);
        }

        Thread.sleep(Math.max(10, durationMs));
        return "{\"status\":\"SUCCESS\",\"simulatedDurationMs\":" + durationMs + "}";
    }
}
