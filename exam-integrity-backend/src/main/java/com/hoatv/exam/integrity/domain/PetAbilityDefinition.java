package com.hoatv.exam.integrity.domain;

/**
 * Stage ability / skill metadata for a pet.
 */
public class PetAbilityDefinition {

    private String name;
    private String description;
    private String videoFile;
    private String videoUrl;

    public PetAbilityDefinition() {}

    public PetAbilityDefinition(String name, String description, String videoFile, String videoUrl) {
        this.name = name;
        this.description = description;
        this.videoFile = videoFile;
        this.videoUrl = videoUrl;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getVideoFile() {
        return videoFile;
    }

    public void setVideoFile(String videoFile) {
        this.videoFile = videoFile;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }
}
