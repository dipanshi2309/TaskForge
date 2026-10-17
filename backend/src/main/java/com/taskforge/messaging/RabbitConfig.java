package com.taskforge.messaging;

import org.springframework.amqp.core.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String DEFAULT_QUEUE = "taskforge.jobs.default";
    public static final String HIGH_PRIORITY_QUEUE = "taskforge.jobs.high";
    public static final String DLQ = "taskforge.jobs.dlq";

    public static final String EXCHANGE = "taskforge.exchange";
    public static final String DLX_EXCHANGE = "taskforge.dlx";

    public static final String DEFAULT_ROUTING_KEY = "taskforge.job.default";
    public static final String HIGH_ROUTING_KEY = "taskforge.job.high";
    public static final String DLQ_ROUTING_KEY = "taskforge.job.dlq";

    @Bean
    public DirectExchange jobExchange() {
        return new DirectExchange(EXCHANGE, true, false);
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX_EXCHANGE, true, false);
    }

    @Bean
    public Queue defaultQueue() {
        return QueueBuilder.durable(DEFAULT_QUEUE)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLQ_ROUTING_KEY)
                .build();
    }

    @Bean
    public Queue highPriorityQueue() {
        return QueueBuilder.durable(HIGH_PRIORITY_QUEUE)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLQ_ROUTING_KEY)
                .build();
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ).build();
    }

    @Bean
    public Binding defaultBinding(Queue defaultQueue, DirectExchange jobExchange) {
        return BindingBuilder.bind(defaultQueue).to(jobExchange).with(DEFAULT_ROUTING_KEY);
    }

    @Bean
    public Binding highPriorityBinding(Queue highPriorityQueue, DirectExchange jobExchange) {
        return BindingBuilder.bind(highPriorityQueue).to(jobExchange).with(HIGH_ROUTING_KEY);
    }

    @Bean
    public Binding dlqBinding(Queue deadLetterQueue, DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue).to(deadLetterExchange).with(DLQ_ROUTING_KEY);
    }
}
