package com.taskforge.worker.handlers;

import com.taskforge.worker.TaskHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class NotificationSenderTaskHandler implements TaskHandler {

    @Override
    public String getTaskType() {
        return "SEND_NOTIFICATION";
    }

    @Override
    public String execute(String jobId, String payload, Map<String, Object> context) throws Exception {
        log.info("Sending notifications for jobId: {}", jobId);
        Thread.sleep(300);
        return "{\"status\":\"DELIVERED\",\"channel\":\"email_and_slack\",\"recipients\":12}";
    }
}
