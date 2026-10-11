package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.Setting;
import com.hoatv.exam.integrity.repositories.SettingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SettingServiceTest {

    @Mock
    private SettingRepository settingRepository;

    @InjectMocks
    private SettingService settingService;

    @Test
    void getAllSettingsReturnsDefaultsWhenNoDatabaseRecords() {
        when(settingRepository.findAll()).thenReturn(List.of());

        Map<String, Object> settings = settingService.getAllSettings();

        assertThat(settings)
            .containsEntry(SettingService.KEY_EGG_SHOP_PRICE_STARS, 250)
            .containsEntry(SettingService.KEY_EGG_HATCH_DURATION_HOURS, 8)
            .containsEntry(SettingService.KEY_PET_GROW_STAR_COST, 25);
    }

    @Test
    void getAllSettingsOverridesDefaultsWithDatabaseRecords() {
        Setting customPrice = Setting.builder()
            .key(SettingService.KEY_EGG_SHOP_PRICE_STARS)
            .value(300)
            .build();
        when(settingRepository.findAll()).thenReturn(List.of(customPrice));

        Map<String, Object> settings = settingService.getAllSettings();

        assertThat(settings)
            .containsEntry(SettingService.KEY_EGG_SHOP_PRICE_STARS, 300)
            .containsEntry(SettingService.KEY_PET_GROW_STAR_COST, 25);
    }

    @Test
    void updateSettingsSavesNewValues() {
        when(settingRepository.findByKey(SettingService.KEY_PET_GROW_STAR_COST)).thenReturn(Optional.empty());
        when(settingRepository.save(any(Setting.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> result = settingService.updateSettings(Map.of(SettingService.KEY_PET_GROW_STAR_COST, 50));

        verify(settingRepository).save(any(Setting.class));
        assertThat(result).isNotNull();
    }
}

