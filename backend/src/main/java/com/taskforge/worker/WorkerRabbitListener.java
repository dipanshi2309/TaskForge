package com.taskforge.worker;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskforge.messaging.JobTaskMessage;
import com.taskforge.messaging.RabbitConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkerRabbitListener {

    private final WorkerEngineService workerEngineService;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = {RabbitConfig.DEFAULT_QUEUE, RabbitConfig.HIGH_PRIORITY_QUEUE}, autoStartup = "${taskforge.rabbitmq.listener.enabled:false}")
    public void onMessage(String messageBody) {
        try {
            JobTaskMessage taskMessage = objectMapper.readValue(messageBody, JobTaskMessage.class);
            log.info("Received task message from RabbitMQ queue: {}", taskMessage.getJobName());
            workerEngineService.submitTask(taskMessage);
        } catch (Exception e) {
            log.error("Failed to parse and submit RabbitMQ task message: {}", e.getMessage(), e);
        }
    }
}
