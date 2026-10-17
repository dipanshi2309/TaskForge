package com.taskforge.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI taskForgeOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("TaskForge REST API")
                        .description("Distributed background job scheduling and execution platform API")
                        .version("1.0.0")
                        .contact(new Contact().name("TaskForge Systems").email("ops@taskforge.internal"))
                        .license(new License().name("Apache 2.0")));
    }
}
