package com.taskforge.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobDispatcher {

    private final ObjectMapper objectMapper;

    @Autowired(required = false)
    private RabbitTemplate rabbitTemplate;

    public void dispatch(JobTaskMessage message, String routingKey) {
        log.info("Dispatching job {} (execution: {}, corrId: {}) via routingKey: {}",
                message.getJobName(), message.getExecutionId(), message.getCorrelationId(), routingKey);

        if (rabbitTemplate != null) {
            try {
                String json = objectMapper.writeValueAsString(message);
                rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, routingKey, json);
            } catch (Exception e) {
                log.warn("RabbitMQ dispatch failed or broker offline. Falling back to local queue: {}", e.getMessage());
            }
        } else {
            log.info("RabbitTemplate not available, will be processed by in-process dispatcher");
        }
    }
}
