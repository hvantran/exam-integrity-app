package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.Setting;
import com.hoatv.exam.integrity.repositories.SettingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SettingService {

    private static final Logger logger = LoggerFactory.getLogger(SettingService.class);

    public static final String KEY_EGG_SHOP_PRICE_STARS = "egg_shop_price_stars";
    public static final String KEY_EGG_HATCH_DURATION_HOURS = "egg_hatch_duration_hours";
    public static final String KEY_STRIKE_CRACK_STAR_COST = "strike_crack_star_cost";
    public static final String KEY_STRIKE_CRACK_PROGRESS_BOOST = "strike_crack_progress_boost";
    public static final String KEY_STRIKE_CRACK_TIME_REDUCED_SECONDS = "strike_crack_time_reduced_seconds";
    public static final String KEY_EQUIP_EGG_STAR_COST = "equip_egg_star_cost";
    public static final String KEY_PET_GROW_STAR_COST = "pet_grow_star_cost";
    public static final String KEY_PET_GROW_EXP_GAIN = "pet_grow_exp_gain";
    public static final String KEY_PET_BASE_EXP_NEEDED = "pet_base_exp_needed";
    public static final String KEY_PET_EXP_GROWTH_MULTIPLIER = "pet_exp_growth_multiplier";
    public static final String KEY_PET_MAX_LEVEL = "pet_max_level";
    public static final String KEY_STARS_PER_SCORE_POINT = "stars_per_score_point";
    public static final String KEY_STARS_PER_USER_LEVEL = "stars_per_user_level";

    private static final Map<String, Object> DEFAULTS = new LinkedHashMap<>();

    static {
        DEFAULTS.put(KEY_EGG_SHOP_PRICE_STARS, 250);
        DEFAULTS.put(KEY_EGG_HATCH_DURATION_HOURS, 8);
        DEFAULTS.put(KEY_STRIKE_CRACK_STAR_COST, 25);
        DEFAULTS.put(KEY_STRIKE_CRACK_PROGRESS_BOOST, 0.25);
        DEFAULTS.put(KEY_STRIKE_CRACK_TIME_REDUCED_SECONDS, 7200L);
        DEFAULTS.put(KEY_EQUIP_EGG_STAR_COST, 25);
        DEFAULTS.put(KEY_PET_GROW_STAR_COST, 25);
        DEFAULTS.put(KEY_PET_GROW_EXP_GAIN, 60);
        DEFAULTS.put(KEY_PET_BASE_EXP_NEEDED, 100);
        DEFAULTS.put(KEY_PET_EXP_GROWTH_MULTIPLIER, 1.35);
        DEFAULTS.put(KEY_PET_MAX_LEVEL, 10);
        DEFAULTS.put(KEY_STARS_PER_SCORE_POINT, 1.0);
        DEFAULTS.put(KEY_STARS_PER_USER_LEVEL, 20);
    }

    private final SettingRepository settingRepository;

    public SettingService(SettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    public Map<String, Object> getAllSettings() {
        Map<String, Object> resolved = new LinkedHashMap<>(DEFAULTS);
        List<Setting> stored = settingRepository.findAll();
        for (Setting s : stored) {
            if (s.getKey() != null && s.getValue() != null) {
                resolved.put(s.getKey(), s.getValue());
            }
        }
        return resolved;
    }

    public Map<String, Object> updateSettings(Map<String, Object> updates) {
        if (updates == null || updates.isEmpty()) {
            return getAllSettings();
        }

        for (Map.Entry<String, Object> entry : updates.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            if (key == null || key.isBlank() || value == null) {
                continue;
            }

            Setting setting = settingRepository.findByKey(key)
                .orElseGet(() -> Setting.builder().key(key).build());
            setting.setValue(value);
            setting.setUpdatedAt(Instant.now());
            settingRepository.save(setting);
            logger.info("Updated setting '{}' to '{}'", key, value);
        }

        return getAllSettings();
    }

    public int getInt(String key, int defaultValue) {
        Object val = getAllSettings().getOrDefault(key, defaultValue);
        if (val instanceof Number n) {
            return n.intValue();
        }
        try {
            return Integer.parseInt(val.toString());
        } catch (Exception e) {
            return defaultValue;
        }
    }

    public long getLong(String key, long defaultValue) {
        Object val = getAllSettings().getOrDefault(key, defaultValue);
        if (val instanceof Number n) {
            return n.longValue();
        }
        try {
            return Long.parseLong(val.toString());
        } catch (Exception e) {
            return defaultValue;
        }
    }

    public double getDouble(String key, double defaultValue) {
        Object val = getAllSettings().getOrDefault(key, defaultValue);
        if (val instanceof Number n) {
            return n.doubleValue();
        }
        try {
            return Double.parseDouble(val.toString());
        } catch (Exception e) {
            return defaultValue;
        }
    }

    public String getString(String key, String defaultValue) {
        Object val = getAllSettings().getOrDefault(key, defaultValue);
        return val != null ? val.toString() : defaultValue;
    }

    public boolean getBoolean(String key, boolean defaultValue) {
        Object val = getAllSettings().getOrDefault(key, defaultValue);
        if (val instanceof Boolean b) {
            return b;
        }
        return val != null ? Boolean.parseBoolean(val.toString()) : defaultValue;
    }
}

