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
public class PetLibraryItem extends BasePetEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    private String petKey;

    private int maxLevel = 10;
    private int eggShopPrice = 250;
    private int hatchDurationHours = 8;
    private String description;
    private String bannerGradient;
    private List<PetStageDefinition> stages = new ArrayList<>();

    public PetLibraryItem() {}

    public PetLibraryItem(String petKey, String name, String species, String rarity, String tier, String element) {
        this.id = petKey;
        this.petKey = petKey;
        this.name = name;
        this.species = species;
        this.rarity = rarity;
        this.tier = tier;
        this.element = element;
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
}
