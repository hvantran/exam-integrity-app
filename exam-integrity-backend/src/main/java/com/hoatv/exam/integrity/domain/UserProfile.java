package com.hoatv.exam.integrity.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Generic user profile document storing identity, gamification stats,
 * stars balance, preferences, and extensible metadata.
 *
 * Collection: user_profiles
 */
@Document(collection = "user_profiles")
public class UserProfile {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String role;

    private Integer grade;

    private UserProfileStats stats = new UserProfileStats();

    private UserProfileGamification gamification = new UserProfileGamification();

    /**
     * Map of sessionId -> stars earned for that exam session.
     * Prevents double awarding and ensures deterministic star accumulation.
     */
    private Map<String, Integer> sessionStars = new HashMap<>();

    private Map<String, Object> preferences = new HashMap<>();

    private Map<String, Object> metadata = new HashMap<>();

    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    public UserProfile() {}

    public UserProfile(String userId, String role, Integer grade) {
        this.userId = userId;
        this.role = role;
        this.grade = grade;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getGrade() {
        return grade;
    }

    public void setGrade(Integer grade) {
        this.grade = grade;
    }

    public UserProfileStats getStats() {
        return stats;
    }

    public void setStats(UserProfileStats stats) {
        this.stats = stats != null ? stats : new UserProfileStats();
    }

    public UserProfileGamification getGamification() {
        return gamification;
    }

    public void setGamification(UserProfileGamification gamification) {
        this.gamification = gamification != null ? gamification : new UserProfileGamification();
    }

    public Map<String, Integer> getSessionStars() {
        return sessionStars;
    }

    public void setSessionStars(Map<String, Integer> sessionStars) {
        this.sessionStars = sessionStars != null ? sessionStars : new HashMap<>();
    }

    public Map<String, Object> getPreferences() {
        return preferences;
    }

    public void setPreferences(Map<String, Object> preferences) {
        this.preferences = preferences != null ? preferences : new HashMap<>();
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata != null ? metadata : new HashMap<>();
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

