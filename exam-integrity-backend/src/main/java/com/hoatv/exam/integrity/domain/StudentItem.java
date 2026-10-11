package com.hoatv.exam.integrity.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * MongoDB document representing a student's companion item (egg or hatched pet).
 * Collection: student_items
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "student_items")
@CompoundIndexes({
    @CompoundIndex(name = "user_category_idx", def = "{'userId': 1, 'category': 1}")
})
public class StudentItem {

    public static final String CATEGORY_EGG_SHOP = "EGG_SHOP";
    public static final String CATEGORY_PET = "PET";

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String category;

    // Common attributes
    private String name;
    private String species;
    @Builder.Default
    private String rarity = "Common";
    @Builder.Default
    private String tier = "dragon";
    @Builder.Default
    private String element = "Fire / Flame";
    @Builder.Default
    private String avatarEmoji = "🐣";
    @Builder.Default
    private int totalStages = 3;
    private String imageUrl;
    private String imageName;
    private String petLibraryId;
    private boolean isEquipped;

    // Egg-specific attributes (category = EGG_SHOP)
    private double crackProgress;
    private String hatchedPetName;
    private String hatchedSpecies;
    @Builder.Default
    private int equipCostInStars = 25;
    @Builder.Default
    private boolean isMystery = true;
    @Builder.Default
    private int hatchDurationHours = 8;
    @Builder.Default
    private long hatchDurationSeconds = 28800L;
    @Builder.Default
    private long remainingSeconds = 28800L;
    @Builder.Default
    private Instant incubatedAt = Instant.now();

    // Pet-specific attributes (category = PET)
    @Builder.Default
    private int level = 1;
    @Builder.Default
    private int maxLevel = 10;
    private int currentExp;
    @Builder.Default
    private int expNeeded = 100;
    @Builder.Default
    private int growthCostInStars = 25;
    @Builder.Default
    private int stageLevel = 1;
    @Builder.Default
    private String stageName = "Hatchling";
    @Builder.Default
    private Map<String, Integer> stats = new HashMap<>();

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();

    public void initDefaultStats() {
        if (this.stats == null || this.stats.isEmpty()) {
            this.stats = new HashMap<>();
            this.stats.put("vitality", 60);
            this.stats.put("wisdom", 60);
            this.stats.put("integrityBond", 80);
            this.stats.put("solarRadiance", 50);
        }
    }
}

