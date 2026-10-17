package com.taskforge.worker.handlers;

import com.taskforge.worker.TaskHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class ReportGeneratorTaskHandler implements TaskHandler {

    @Override
    public String getTaskType() {
        return "REPORT_GENERATION";
    }

    @Override
    public String execute(String jobId, String payload, Map<String, Object> context) throws Exception {
        log.info("Generating report for jobId: {} with payload: {}", jobId, payload);
        // Simulate work safely with bounded sleep
        Thread.sleep(800);
        return "{\"status\":\"SUCCESS\",\"reportUrl\":\"https://storage.taskforge.internal/reports/rep-" + jobId + ".pdf\",\"recordsCount\":1420}";
    }
}
