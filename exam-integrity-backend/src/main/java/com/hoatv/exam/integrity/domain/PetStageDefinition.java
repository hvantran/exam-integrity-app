package com.hoatv.exam.integrity.domain;

/**
 * Stage definition for a pet in the pet library.
 */
public class PetStageDefinition {

    private int stage;
    private int minLevel;
    private String name;
    private String title;
    private String description;
    private String avatarEmoji;
    private String imageName;
    private String avatarIcon;
    private String backgroundImage;
    private PetAbilityDefinition ability;

    public PetStageDefinition() {}

    public PetStageDefinition(int stage, int minLevel, String name, String title, String description, String avatarEmoji, String imageName) {
        this(stage, minLevel, name, title, description, avatarEmoji, imageName, null, null, null);
    }

    public PetStageDefinition(int stage, int minLevel, String name, String title, String description, String avatarEmoji, String imageName, PetAbilityDefinition ability) {
        this(stage, minLevel, name, title, description, avatarEmoji, imageName, null, null, ability);
    }

    public PetStageDefinition(int stage, int minLevel, String name, String title, String description, String avatarEmoji, String imageName, String avatarIcon, String backgroundImage, PetAbilityDefinition ability) {
        this.stage = stage;
        this.minLevel = minLevel;
        this.name = name;
        this.title = title;
        this.description = description;
        this.avatarEmoji = avatarEmoji;
        this.imageName = imageName;
        this.avatarIcon = avatarIcon;
        this.backgroundImage = backgroundImage;
        this.ability = ability;
    }

    public int getStage() {
        return stage;
    }

    public void setStage(int stage) {
        this.stage = stage;
    }

    public int getMinLevel() {
        return minLevel;
    }

    public void setMinLevel(int minLevel) {
        this.minLevel = minLevel;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAvatarEmoji() {
        return avatarEmoji;
    }

    public void setAvatarEmoji(String avatarEmoji) {
        this.avatarEmoji = avatarEmoji;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public String getAvatarIcon() {
        return avatarIcon;
    }

    public void setAvatarIcon(String avatarIcon) {
        this.avatarIcon = avatarIcon;
    }

    public String getIcon() {
        return avatarIcon;
    }

    public void setIcon(String icon) {
        this.avatarIcon = icon;
    }

    public String getBackgroundImage() {
        return backgroundImage;
    }

    public void setBackgroundImage(String backgroundImage) {
        this.backgroundImage = backgroundImage;
    }

    public PetAbilityDefinition getAbility() {
        return ability;
    }

    public void setAbility(PetAbilityDefinition ability) {
        this.ability = ability;
    }
}

