package com.hoatv.exam.integrity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableAutoConfiguration
@EnableScheduling
@ComponentScan({"com.hoatv.exam.integrity", "com.hoatv.springboot.common"})
public class ExamIntegrityApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExamIntegrityApplication.class, args);
    }
}
