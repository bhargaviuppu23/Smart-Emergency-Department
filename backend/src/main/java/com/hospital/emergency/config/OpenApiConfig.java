package com.hospital.emergency.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Value("${app.disclaimer}")
    private String disclaimer;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Smart Emergency Department Queue Optimization API")
                        .version("1.0.0")
                        .description("REST API for Emergency Department queue management utilizing Java Data Structures " +
                                "(PriorityQueue, FIFO Deque, HashMap, ArrayList). \n\n" +
                                "**DISCLAIMER:** " + disclaimer)
                        .contact(new Contact()
                                .name("Emergency Department Queue Optimization Engineering Team")
                                .email("developer@hospital-emergency-sim.edu"))
                        .license(new License().name("Educational Use License")));
    }
}
