package com.hoatv.exam.integrity.domain;

import java.util.ArrayList;
import java.util.List;

public class UserProfileGamification {

    private int level = 1;
    private List<String> badges = new ArrayList<>();
    private List<String> unlockedAvatars = new ArrayList<>();

    public UserProfileGamification() {}

    public UserProfileGamification(int level, List<String> badges, List<String> unlockedAvatars) {
        this.level = level;
        this.badges = badges != null ? badges : new ArrayList<>();
        this.unlockedAvatars = unlockedAvatars != null ? unlockedAvatars : new ArrayList<>();
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public List<String> getBadges() {
        return badges;
    }

    public void setBadges(List<String> badges) {
        this.badges = badges != null ? badges : new ArrayList<>();
    }

    public List<String> getUnlockedAvatars() {
        return unlockedAvatars;
    }

    public void setUnlockedAvatars(List<String> unlockedAvatars) {
        this.unlockedAvatars = unlockedAvatars != null ? unlockedAvatars : new ArrayList<>();
    }
}

