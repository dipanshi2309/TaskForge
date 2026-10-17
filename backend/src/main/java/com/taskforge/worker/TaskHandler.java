package com.taskforge.worker;

import java.util.Map;

public interface TaskHandler {
    String getTaskType();
    String execute(String jobId, String payload, Map<String, Object> context) throws Exception;
}
