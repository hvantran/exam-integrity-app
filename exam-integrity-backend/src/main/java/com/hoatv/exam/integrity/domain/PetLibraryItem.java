package com.hoatv.exam.integrity.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Catalogue / library definition of pets that students can acquire as eggs.
 * Collection: pet_library
 */
@Document(collection = "pet_library")
public class PetLibraryItem {

    @Id
    private String id;

    @Indexed(unique = true)
    private String petKey;

    private String name;
    private String species;
    private String rarity = "Common";
    private String tier = "dragon";
    private String element = "Fire / Flame";
    private String avatarEmoji = "🐣";
    private int totalStages = 3;
    private int maxLevel = 10;
    private int eggShopPrice = 250;
    private int hatchDurationHours = 8;
    private String description;
    private String bannerGradient;
    private List<PetStageDefinition> stages = new ArrayList<>();
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public PetLibraryItem() {}

    public PetLibraryItem(String petKey, String name, String species, String rarity, String tier, String element, String avatarEmoji, int totalStages) {
        this.id = petKey;
        this.petKey = petKey;
        this.name = name;
        this.species = species;
        this.rarity = rarity;
        this.tier = tier;
        this.element = element;
        this.avatarEmoji = avatarEmoji;
        this.totalStages = totalStages;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPetKey() {
        return petKey;
    }

    public void setPetKey(String petKey) {
        this.petKey = petKey;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecies() {
        return species;
    }

    public void setSpecies(String species) {
        this.species = species;
    }

    public String getRarity() {
        return rarity;
    }

    public void setRarity(String rarity) {
        this.rarity = rarity;
    }

    public String getTier() {
        return tier;
    }

    public void setTier(String tier) {
        this.tier = tier;
    }

    public String getElement() {
        return element;
    }

    public void setElement(String element) {
        this.element = element;
    }

    public String getAvatarEmoji() {
        return avatarEmoji;
    }

    public void setAvatarEmoji(String avatarEmoji) {
        this.avatarEmoji = avatarEmoji;
    }

    public int getTotalStages() {
        return totalStages;
    }

    public void setTotalStages(int totalStages) {
        this.totalStages = totalStages;
    }

    public int getMaxLevel() {
        return maxLevel;
    }

    public void setMaxLevel(int maxLevel) {
        this.maxLevel = maxLevel;
    }

    public int getEggShopPrice() {
        return eggShopPrice;
    }

    public void setEggShopPrice(int eggShopPrice) {
        this.eggShopPrice = eggShopPrice;
    }

    public int getHatchDurationHours() {
        return hatchDurationHours;
    }

    public void setHatchDurationHours(int hatchDurationHours) {
        this.hatchDurationHours = hatchDurationHours;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBannerGradient() {
        return bannerGradient;
    }

    public void setBannerGradient(String bannerGradient) {
        this.bannerGradient = bannerGradient;
    }

    public List<PetStageDefinition> getStages() {
        return stages;
    }

    public void setStages(List<PetStageDefinition> stages) {
        this.stages = stages;
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

