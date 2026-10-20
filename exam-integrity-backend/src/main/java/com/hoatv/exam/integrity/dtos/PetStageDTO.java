package com.hoatv.exam.integrity.dtos;

public record PetStageDTO(
    int stage,
    int minLevel,
    String name,
    String title,
    String description,
    String avatarEmoji,
    String imageName,
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
        this(stage, minLevel, name, title, description, avatarEmoji, imageName, null);
    }
}
