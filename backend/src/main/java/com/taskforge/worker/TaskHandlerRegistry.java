package com.taskforge.worker;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TaskHandlerRegistry {

    private final Map<String, TaskHandler> handlers = new ConcurrentHashMap<>();

    public TaskHandlerRegistry(List<TaskHandler> taskHandlers) {
        for (TaskHandler handler : taskHandlers) {
            handlers.put(handler.getTaskType().toUpperCase(), handler);
        }
    }

    public TaskHandler getHandler(String taskType) {
        if (taskType == null) return null;
        return handlers.get(taskType.toUpperCase());
    }

    public boolean hasHandler(String taskType) {
        if (taskType == null) return false;
        return handlers.containsKey(taskType.toUpperCase());
    }

    public List<String> getAvailableTaskTypes() {
        return List.copyOf(handlers.keySet());
    }
}
