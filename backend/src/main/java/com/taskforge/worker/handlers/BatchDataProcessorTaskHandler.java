package com.taskforge.worker.handlers;

import com.taskforge.worker.TaskHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class BatchDataProcessorTaskHandler implements TaskHandler {

    @Override
    public String getTaskType() {
        return "BATCH_DATA_PROCESS";
    }

    @Override
    public String execute(String jobId, String payload, Map<String, Object> context) throws Exception {
        log.info("Processing batch data for jobId: {}", jobId);
        Thread.sleep(600);
        return "{\"status\":\"SUCCESS\",\"batchesProcessed\":10,\"itemsTransformed\":5000}";
    }
}
