package com.hoatv.exam.integrity.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Represents a student's hatched 3D pet companion.
 * Collection: student_pets
 */
@Document(collection = "student_pets")
public class StudentPet extends BasePetEntity {

    @Id
    private String id;

    @Indexed
    private String userId;

    private int level = 1;
    private int maxLevel = 10;
    private int currentExp = 0;
    private int expNeeded = 100;
    private int growthCostInStars = 25;
    private int stageLevel = 1;
    private String stageName = "Hatchling";
    private String imageUrl;
    private String imageName;
    private String petLibraryId;
    private boolean isEquipped = false;
    private Map<String, Integer> stats = new HashMap<>();

    public StudentPet() {
        initDefaultStats();
    }

    public StudentPet(String userId, String name, String species, String rarity, int totalStages) {
        this.userId = userId;
        this.name = name;
        this.species = species;
        this.rarity = rarity;
        this.totalStages = totalStages;
        initDefaultStats();
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    private void initDefaultStats() {
        if (this.stats == null || this.stats.isEmpty()) {
            this.stats = new HashMap<>();
            this.stats.put("vitality", 60);
            this.stats.put("wisdom", 60);
            this.stats.put("integrityBond", 80);
            this.stats.put("solarRadiance", 50);
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public int getMaxLevel() {
        return maxLevel;
    }

    public void setMaxLevel(int maxLevel) {
        this.maxLevel = maxLevel;
    }

    public int getCurrentExp() {
        return currentExp;
    }

    public void setCurrentExp(int currentExp) {
        this.currentExp = currentExp;
    }

    public int getExpNeeded() {
        return expNeeded;
    }

    public void setExpNeeded(int expNeeded) {
        this.expNeeded = expNeeded;
    }

    public int getGrowthCostInStars() {
        return growthCostInStars;
    }

    public void setGrowthCostInStars(int growthCostInStars) {
        this.growthCostInStars = growthCostInStars;
    }

    public int getStageLevel() {
        return stageLevel;
    }

    public void setStageLevel(int stageLevel) {
        this.stageLevel = stageLevel;
    }

    public String getStageName() {
        return stageName;
    }

    public void setStageName(String stageName) {
        this.stageName = stageName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isEquipped() {
        return isEquipped;
    }

    public void setEquipped(boolean equipped) {
        isEquipped = equipped;
    }

    public Map<String, Integer> getStats() {
        return stats;
    }

    public void setStats(Map<String, Integer> stats) {
        this.stats = stats != null ? stats : new HashMap<>();
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public String getPetLibraryId() {
        return petLibraryId;
    }

    public void setPetLibraryId(String petLibraryId) {
        this.petLibraryId = petLibraryId;
    }
}
