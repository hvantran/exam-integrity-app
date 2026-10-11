package com.hoatv.exam.integrity.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * MongoDB document representing a system/gameplay setting.
 * Collection: settings
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "settings")
public class Setting {

    @Id
    private String id;

    @Indexed(unique = true)
    private String key;

    private Object value;

    private String category;

    private String description;

    @Builder.Default
    private Instant updatedAt = Instant.now();
}

