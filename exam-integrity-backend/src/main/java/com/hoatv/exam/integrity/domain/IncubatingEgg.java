package com.hoatv.exam.integrity.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Represents an incubating 3D egg owned by a student.
 * Collection: incubating_eggs
 */
@Document(collection = "incubating_eggs")
public class IncubatingEgg {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String name = "Ancient Mysterious Egg";
    private String tier = "dragon";
    private String rarity;
    private double crackProgress = 0.0;
    private String hatchedPetName = "??? Mystery Pet";
    private String hatchedSpecies = "Veiled Ancient Beast";
    private boolean isEquipped = false;
    private int equipCostInStars = 25;
    private boolean isMystery = true;
    private int hatchDurationHours = 8;
    private long hatchDurationSeconds = 28800L;
    private long remainingSeconds = 28800L;
    private String imageUrl;
    private Instant incubatedAt = Instant.now();
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public IncubatingEgg() {}

    public IncubatingEgg(String userId, String name, String tier) {
        this.userId = userId;
        this.name = name != null ? name : "Ancient Mysterious Egg";
        this.tier = tier != null ? tier : "dragon";
        this.incubatedAt = Instant.now();
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTier() {
        return tier;
    }

    public void setTier(String tier) {
        this.tier = tier;
    }

    public String getRarity() {
        return rarity;
    }

    public void setRarity(String rarity) {
        this.rarity = rarity;
    }

    public double getCrackProgress() {
        return crackProgress;
    }

    public void setCrackProgress(double crackProgress) {
        this.crackProgress = crackProgress;
    }

    public String getHatchedPetName() {
        return hatchedPetName;
    }

    public void setHatchedPetName(String hatchedPetName) {
        this.hatchedPetName = hatchedPetName;
    }

    public String getHatchedSpecies() {
        return hatchedSpecies;
    }

    public void setHatchedSpecies(String hatchedSpecies) {
        this.hatchedSpecies = hatchedSpecies;
    }

    public boolean isEquipped() {
        return isEquipped;
    }

    public void setEquipped(boolean equipped) {
        isEquipped = equipped;
    }

    public int getEquipCostInStars() {
        return equipCostInStars;
    }

    public void setEquipCostInStars(int equipCostInStars) {
        this.equipCostInStars = equipCostInStars;
    }

    public boolean isMystery() {
        return isMystery;
    }

    public void setMystery(boolean mystery) {
        isMystery = mystery;
    }

    public int getHatchDurationHours() {
        return hatchDurationHours;
    }

    public void setHatchDurationHours(int hatchDurationHours) {
        this.hatchDurationHours = hatchDurationHours;
    }

    public long getHatchDurationSeconds() {
        return hatchDurationSeconds;
    }

    public void setHatchDurationSeconds(long hatchDurationSeconds) {
        this.hatchDurationSeconds = hatchDurationSeconds;
    }

    public long getRemainingSeconds() {
        return remainingSeconds;
    }

    public void setRemainingSeconds(long remainingSeconds) {
        this.remainingSeconds = remainingSeconds;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Instant getIncubatedAt() {
        return incubatedAt;
    }

    public void setIncubatedAt(Instant incubatedAt) {
        this.incubatedAt = incubatedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

