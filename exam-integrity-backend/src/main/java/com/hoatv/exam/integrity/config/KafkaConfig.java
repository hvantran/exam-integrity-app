package com.hoatv.exam.integrity.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Declares all Kafka topics used by this service.
 * Topics are created automatically if they do not exist.
 */
@Configuration
public class KafkaConfig {

    @Bean public NewTopic examIngestedTopic()   { return TopicBuilder.name("exam.ingested").partitions(3).replicas(1).build(); }
    @Bean public NewTopic proctorAlertTopic()   { return TopicBuilder.name("proctor.alert").partitions(3).replicas(1).build(); }
}
