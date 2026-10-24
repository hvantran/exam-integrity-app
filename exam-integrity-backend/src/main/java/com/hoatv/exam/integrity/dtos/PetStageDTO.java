package com.hoatv.exam.integrity.dtos;

public record PetStageDTO(
    int stage,
    int minLevel,
    String name,
    String title,
    String description,
    String avatarEmoji,
    String imageName,
    String avatarIcon,
    String backgroundImage,
    PetAbilityDTO ability
) {
    public PetStageDTO(
        int stage,
        int minLevel,
        String name,
        String title,
        String description,
        String avatarEmoji,
        String imageName
    ) {
        this(stage, minLevel, name, title, description, avatarEmoji, imageName, null, null, null);
    }

    public PetStageDTO(
        int stage,
        int minLevel,
        String name,
        String title,
        String description,
        String avatarEmoji,
        String imageName,
        PetAbilityDTO ability
    ) {
        this(stage, minLevel, name, title, description, avatarEmoji, imageName, null, null, ability);
    }
}
