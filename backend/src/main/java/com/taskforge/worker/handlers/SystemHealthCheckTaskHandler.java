package com.taskforge.worker.handlers;

import com.taskforge.worker.TaskHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.lang.management.ManagementFactory;
import java.util.Map;

@Slf4j
@Component
public class SystemHealthCheckTaskHandler implements TaskHandler {

    @Override
    public String getTaskType() {
        return "SYSTEM_HEALTH_CHECK";
    }

    @Override
    public String execute(String jobId, String payload, Map<String, Object> context) throws Exception {
        long freeMemory = Runtime.getRuntime().freeMemory() / (1024 * 1024);
        long totalMemory = Runtime.getRuntime().totalMemory() / (1024 * 1024);
        int availableProcessors = Runtime.getRuntime().availableProcessors();
        double systemLoad = ManagementFactory.getOperatingSystemMXBean().getSystemLoadAverage();

        log.info("System health check - CPUs: {}, Mem: {}/{}MB, Load: {}",
                availableProcessors, freeMemory, totalMemory, systemLoad);

        return String.format("{\"status\":\"HEALTHY\",\"cpuCores\":%d,\"freeMemoryMb\":%d,\"totalMemoryMb\":%d,\"systemLoad\":%.2f}",
                availableProcessors, freeMemory, totalMemory, systemLoad);
    }
}
