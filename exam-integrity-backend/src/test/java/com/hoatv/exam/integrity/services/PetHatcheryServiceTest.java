package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.StudentItem;
import com.hoatv.exam.integrity.domain.UserProfile;
import com.hoatv.exam.integrity.domain.UserProfileStats;
import com.hoatv.exam.integrity.dtos.EggShopItemDTO;
import com.hoatv.exam.integrity.dtos.GrowPetResponseDTO;
import com.hoatv.exam.integrity.dtos.IncubatingEggDTO;
import com.hoatv.exam.integrity.dtos.PurchaseEggResponseDTO;
import com.hoatv.exam.integrity.dtos.StudentPetDTO;
import com.hoatv.exam.integrity.repositories.PetLibraryRepository;
import com.hoatv.exam.integrity.repositories.StudentItemRepository;
import com.hoatv.fwk.common.exceptions.EntityNotFoundException;
import com.hoatv.fwk.common.exceptions.InvalidArgumentException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PetHatcheryServiceTest {

    @Mock
    private StudentItemRepository studentItemRepository;

    @Mock
    private PetLibraryRepository petLibraryRepository;

    @Mock
    private UserProfileService userProfileService;

    @Mock
    private SettingService settingService;

    @InjectMocks
    private PetHatcheryService petHatcheryService;

    private UserProfile testProfile;

    @BeforeEach
    void setUp() {
        testProfile = new UserProfile("student1", "STUDENT", 5);
        testProfile.setStats(new UserProfileStats(500, 5, 9.5));

        org.mockito.Mockito.lenient().when(settingService.getInt(org.mockito.ArgumentMatchers.eq(SettingService.KEY_EGG_SHOP_PRICE_STARS), org.mockito.ArgumentMatchers.anyInt())).thenReturn(250);
        org.mockito.Mockito.lenient().when(settingService.getInt(org.mockito.ArgumentMatchers.eq(SettingService.KEY_EGG_HATCH_DURATION_HOURS), org.mockito.ArgumentMatchers.anyInt())).thenReturn(8);
        org.mockito.Mockito.lenient().when(settingService.getInt(org.mockito.ArgumentMatchers.eq(SettingService.KEY_STRIKE_CRACK_STAR_COST), org.mockito.ArgumentMatchers.anyInt())).thenReturn(25);
        org.mockito.Mockito.lenient().when(settingService.getDouble(org.mockito.ArgumentMatchers.eq(SettingService.KEY_STRIKE_CRACK_PROGRESS_BOOST), org.mockito.ArgumentMatchers.anyDouble())).thenReturn(0.25);
        org.mockito.Mockito.lenient().when(settingService.getLong(org.mockito.ArgumentMatchers.eq(SettingService.KEY_STRIKE_CRACK_TIME_REDUCED_SECONDS), org.mockito.ArgumentMatchers.anyLong())).thenReturn(7200L);
        org.mockito.Mockito.lenient().when(settingService.getInt(org.mockito.ArgumentMatchers.eq(SettingService.KEY_EQUIP_EGG_STAR_COST), org.mockito.ArgumentMatchers.anyInt())).thenReturn(25);
        org.mockito.Mockito.lenient().when(settingService.getInt(org.mockito.ArgumentMatchers.eq(SettingService.KEY_PET_GROW_STAR_COST), org.mockito.ArgumentMatchers.anyInt())).thenReturn(25);
        org.mockito.Mockito.lenient().when(settingService.getInt(org.mockito.ArgumentMatchers.eq(SettingService.KEY_PET_GROW_EXP_GAIN), org.mockito.ArgumentMatchers.anyInt())).thenReturn(60);
        org.mockito.Mockito.lenient().when(settingService.getInt(org.mockito.ArgumentMatchers.eq(SettingService.KEY_PET_MAX_LEVEL), org.mockito.ArgumentMatchers.anyInt())).thenReturn(10);
        org.mockito.Mockito.lenient().when(settingService.getDouble(org.mockito.ArgumentMatchers.eq(SettingService.KEY_PET_EXP_GROWTH_MULTIPLIER), org.mockito.ArgumentMatchers.anyDouble())).thenReturn(1.35);
        org.mockito.Mockito.lenient().when(settingService.getInt(org.mockito.ArgumentMatchers.eq(SettingService.KEY_EGG_DROP_RATE_COMMON), org.mockito.ArgumentMatchers.anyInt())).thenReturn(50);
        org.mockito.Mockito.lenient().when(settingService.getInt(org.mockito.ArgumentMatchers.eq(SettingService.KEY_EGG_DROP_RATE_RARE), org.mockito.ArgumentMatchers.anyInt())).thenReturn(28);
        org.mockito.Mockito.lenient().when(settingService.getInt(org.mockito.ArgumentMatchers.eq(SettingService.KEY_EGG_DROP_RATE_EPIC), org.mockito.ArgumentMatchers.anyInt())).thenReturn(14);
        org.mockito.Mockito.lenient().when(settingService.getInt(org.mockito.ArgumentMatchers.eq(SettingService.KEY_EGG_DROP_RATE_LEGENDARY), org.mockito.ArgumentMatchers.anyInt())).thenReturn(6);
        org.mockito.Mockito.lenient().when(settingService.getInt(org.mockito.ArgumentMatchers.eq(SettingService.KEY_EGG_DROP_RATE_MYTHIC), org.mockito.ArgumentMatchers.anyInt())).thenReturn(2);
    }

    @Test
    void getFeaturedShopEggReturnsMysteryEggWith8HourIncubationAndLuckRates() {
        EggShopItemDTO egg = petHatcheryService.getFeaturedShopEgg();

        assertThat(egg.id()).isEqualTo("mystery-egg-ancient");
        assertThat(egg.name()).isEqualTo("Ancient Mysterious Egg");
        assertThat(egg.price()).isEqualTo(250);
        assertThat(egg.hatchDurationHours()).isEqualTo(8);
        assertThat(egg.hatchDurationSeconds()).isEqualTo(28800L);
        assertThat(egg.rarityDropPercentages()).containsEntry("Common", 50);
        assertThat(egg.rarityDropPercentages()).containsEntry("Rare", 28);
        assertThat(egg.rarityDropPercentages()).containsEntry("Epic", 14);
        assertThat(egg.rarityDropPercentages()).containsEntry("Legendary", 6);
        assertThat(egg.rarityDropPercentages()).containsEntry("Mythic", 2);
    }

    @Test
    void purchaseMysteryEggDeducts250StarsAndCreatesIncubatingEgg() {
        when(userProfileService.spendStars("student1", 250)).thenReturn(testProfile);
        when(studentItemRepository.save(any(StudentItem.class))).thenAnswer(invocation -> {
            StudentItem saved = invocation.getArgument(0);
            saved.setId("egg-123");
            return saved;
        });

        PurchaseEggResponseDTO response = petHatcheryService.purchaseMysteryEgg("student1");

        assertThat(response.success()).isTrue();
        assertThat(response.incubatingEgg()).isNotNull();
        assertThat(response.incubatingEgg().id()).isEqualTo("egg-123");
        assertThat(response.incubatingEgg().hatchDurationHours()).isEqualTo(8);
        assertThat(response.incubatingEgg().remainingSeconds()).isEqualTo(28800L);
        assertThat(response.incubatingEgg().isMystery()).isTrue();

        verify(userProfileService).spendStars("student1", 250);
        verify(studentItemRepository).save(any(StudentItem.class));
    }

    @Test
    void strikeEggAdvancesCrackProgressAndReducesRemainingTime() {
        StudentItem egg = StudentItem.builder()
            .id("egg-1")
            .userId("student1")
            .category(StudentItem.CATEGORY_EGG_SHOP)
            .name("Ancient Mysterious Egg")
            .tier("dragon")
            .crackProgress(0.1)
            .incubatedAt(Instant.now().minusSeconds(2880L))
            .build();

        when(studentItemRepository.findByIdAndUserIdAndCategory("egg-1", "student1", StudentItem.CATEGORY_EGG_SHOP))
            .thenReturn(Optional.of(egg));
        when(userProfileService.spendStars("student1", 25)).thenReturn(testProfile);
        when(studentItemRepository.save(any(StudentItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IncubatingEggDTO result = petHatcheryService.strikeEgg("student1", "egg-1");

        assertThat(result.crackProgress()).isEqualTo(0.35);
        assertThat(result.remainingSeconds()).isBetween(18718L, 18720L);
        verify(userProfileService).spendStars("student1", 25);
    }

    @Test
    void hatchEggFailsWhenEggNotReady() {
        StudentItem egg = StudentItem.builder()
            .id("egg-1")
            .userId("student1")
            .category(StudentItem.CATEGORY_EGG_SHOP)
            .name("Ancient Mysterious Egg")
            .tier("dragon")
            .crackProgress(0.5)
            .incubatedAt(Instant.now())
            .build();

        when(studentItemRepository.findByIdAndUserIdAndCategory("egg-1", "student1", StudentItem.CATEGORY_EGG_SHOP))
            .thenReturn(Optional.of(egg));

        assertThatThrownBy(() -> petHatcheryService.hatchEgg("student1", "egg-1", 50.0))
            .isInstanceOf(InvalidArgumentException.class)
            .hasMessageContaining("not ready to hatch");
    }

    @Test
    void hatchEggSucceedsWhenProgressIs100PercentAndRollsMysteryPet() {
        StudentItem egg = StudentItem.builder()
            .id("egg-1")
            .userId("student1")
            .category(StudentItem.CATEGORY_EGG_SHOP)
            .name("Ancient Mysterious Egg")
            .tier("dragon")
            .crackProgress(1.0)
            .build();

        when(studentItemRepository.findByIdAndUserIdAndCategory("egg-1", "student1", StudentItem.CATEGORY_EGG_SHOP))
            .thenReturn(Optional.of(egg));
        when(studentItemRepository.save(any(StudentItem.class))).thenAnswer(invocation -> {
            StudentItem p = invocation.getArgument(0);
            p.setId("pet-99");
            return p;
        });

        // Test roll 85.0 -> Epic (5 stages, Fire Phoenix / Chronopip / Umbralpaw)
        StudentPetDTO hatched = petHatcheryService.hatchEgg("student1", "egg-1", 85.0);

        assertThat(hatched).isNotNull();
        assertThat(hatched.rarity()).isEqualTo("Epic");
        assertThat(hatched.totalStages()).isEqualTo(5);
        assertThat(hatched.level()).isEqualTo(1);

        verify(studentItemRepository).deleteByIdAndUserIdAndCategory("egg-1", "student1", StudentItem.CATEGORY_EGG_SHOP);
        verify(studentItemRepository).save(any(StudentItem.class));
    }

    @Test
    void rollMysteryPetConformsToExactDropPercentages() {
        // Roll 10.0 -> Common (3 stages)
        StudentItem common = petHatcheryService.rollMysteryPet("student1", 10.0);
        assertThat(common.getRarity()).isEqualTo("Common");
        assertThat(common.getTotalStages()).isEqualTo(3);
        assertThat(common.getCategory()).isEqualTo(StudentItem.CATEGORY_PET);

        // Roll 60.0 -> Rare (4 stages)
        StudentItem rare = petHatcheryService.rollMysteryPet("student1", 60.0);
        assertThat(rare.getRarity()).isEqualTo("Rare");
        assertThat(rare.getTotalStages()).isEqualTo(4);
        assertThat(rare.getCategory()).isEqualTo(StudentItem.CATEGORY_PET);

        // Roll 80.0 -> Epic (5 stages)
        StudentItem epic = petHatcheryService.rollMysteryPet("student1", 80.0);
        assertThat(epic.getRarity()).isEqualTo("Epic");
        assertThat(epic.getTotalStages()).isEqualTo(5);
        assertThat(epic.getCategory()).isEqualTo(StudentItem.CATEGORY_PET);

        // Roll 95.0 -> Legendary (6 stages)
        StudentItem leg = petHatcheryService.rollMysteryPet("student1", 95.0);
        assertThat(leg.getRarity()).isEqualTo("Legendary");
        assertThat(leg.getTotalStages()).isEqualTo(6);
        assertThat(leg.getCategory()).isEqualTo(StudentItem.CATEGORY_PET);

        // Roll 99.5 -> Mythic (8 stages)
        StudentItem mythic = petHatcheryService.rollMysteryPet("student1", 99.5);
        assertThat(mythic.getRarity()).isEqualTo("Mythic");
        assertThat(mythic.getTotalStages()).isEqualTo(8);
        assertThat(mythic.getCategory()).isEqualTo(StudentItem.CATEGORY_PET);
    }

    @Test
    void rollMysteryPetUsesCustomDropRatesFromSettings() {
        // Configure 100% Mythic drop rate
        when(settingService.getInt(SettingService.KEY_EGG_DROP_RATE_COMMON, 50)).thenReturn(0);
        when(settingService.getInt(SettingService.KEY_EGG_DROP_RATE_RARE, 28)).thenReturn(0);
        when(settingService.getInt(SettingService.KEY_EGG_DROP_RATE_EPIC, 14)).thenReturn(0);
        when(settingService.getInt(SettingService.KEY_EGG_DROP_RATE_LEGENDARY, 6)).thenReturn(0);
        when(settingService.getInt(SettingService.KEY_EGG_DROP_RATE_MYTHIC, 2)).thenReturn(100);

        StudentItem rolled = petHatcheryService.rollMysteryPet("student1", 10.0);
        assertThat(rolled.getRarity()).isEqualTo("Mythic");
        assertThat(rolled.getTotalStages()).isEqualTo(8);
    }

    @Test
    void growPetSpendsStarsAndLevelsUpPetWithEvolution() {
        StudentItem pet = StudentItem.builder()
            .id("pet-1")
            .userId("student1")
            .category(StudentItem.CATEGORY_PET)
            .name("Sun Ember Fledgling")
            .species("Primordial Solar Phoenix")
            .rarity("Epic")
            .totalStages(5)
            .level(2)
            .expNeeded(100)
            .currentExp(80)
            .stageLevel(1)
            .build();
        pet.initDefaultStats();

        when(studentItemRepository.findByIdAndUserIdAndCategory("pet-1", "student1", StudentItem.CATEGORY_PET))
            .thenReturn(Optional.of(pet));
        when(userProfileService.spendStars("student1", 25)).thenReturn(testProfile);
        when(studentItemRepository.save(any(StudentItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GrowPetResponseDTO response = petHatcheryService.growPet("student1", "pet-1");

        assertThat(response.levelGained()).isTrue();
        assertThat(response.pet().level()).isEqualTo(3);
        assertThat(response.didEvolve()).isTrue();
        assertThat(response.pet().stageLevel()).isEqualTo(2);

        verify(userProfileService).spendStars("student1", 25);
        verify(studentItemRepository).save(any(StudentItem.class));
    }

    @Test
    void growPetThrowsEntityNotFoundExceptionWhenNotFoundInRepository() {
        when(studentItemRepository.findByIdAndUserIdAndCategory("pet-sproutling-stage-1", "student1", StudentItem.CATEGORY_PET))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> petHatcheryService.growPet("student1", "pet-sproutling-stage-1"))
            .isInstanceOf(EntityNotFoundException.class)
            .hasMessageContaining("Pet not found: pet-sproutling-stage-1");
    }

    @Test
    void growPetThrowsInvalidArgumentExceptionWhenPetAlreadyAtMaxLevel() {
        StudentItem pet = StudentItem.builder()
            .id("pet-max")
            .userId("student1")
            .category(StudentItem.CATEGORY_PET)
            .name("Max Level Phoenix")
            .level(10)
            .build();

        when(studentItemRepository.findByIdAndUserIdAndCategory("pet-max", "student1", StudentItem.CATEGORY_PET))
            .thenReturn(Optional.of(pet));
        when(settingService.getInt(SettingService.KEY_PET_MAX_LEVEL, 10)).thenReturn(10);

        assertThatThrownBy(() -> petHatcheryService.growPet("student1", "pet-max"))
            .isInstanceOf(InvalidArgumentException.class)
            .hasMessageContaining("Pet has already reached maximum level: 10");

        verify(userProfileService, never()).spendStars(anyString(), anyInt());
        verify(studentItemRepository, never()).save(any(StudentItem.class));
    }

    @Test
    void getMyPetsReturnsEmptyListWhenUserIdIsBlank() {
        assertThat(petHatcheryService.getMyPets("")).isEmpty();
        assertThat(petHatcheryService.getMyPets(null)).isEmpty();
        verify(studentItemRepository, never()).findByUserIdAndCategory(anyString(), anyString());
    }

    @Test
    void getMyPetsReturnsEmptyListWhenUserHasNoPets() {
        when(studentItemRepository.findByUserIdAndCategory("new-student", StudentItem.CATEGORY_PET))
            .thenReturn(java.util.List.of());

        java.util.List<StudentPetDTO> pets = petHatcheryService.getMyPets("new-student");

        assertThat(pets).isEmpty();
        verify(studentItemRepository, never()).save(any(StudentItem.class));
    }

    @Test
    void getMyPetsReturnsMappedPetsWhenUserHasPets() {
        StudentItem pet = StudentItem.builder()
            .id("pet-1")
            .userId("student1")
            .category(StudentItem.CATEGORY_PET)
            .name("Sun Ember Fledgling")
            .species("Primordial Solar Phoenix")
            .rarity("Epic")
            .tier("dragon")
            .element("Solar")
            .level(1)
            .currentExp(0)
            .expNeeded(100)
            .stageLevel(1)
            .totalStages(5)
            .stageName("Hatchling")
            .avatarEmoji("🐣")
            .isEquipped(true)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
        pet.initDefaultStats();

        when(studentItemRepository.findByUserIdAndCategory("student1", StudentItem.CATEGORY_PET))
            .thenReturn(java.util.List.of(pet));

        java.util.List<StudentPetDTO> pets = petHatcheryService.getMyPets("student1");

        assertThat(pets).hasSize(1);
        assertThat(pets.get(0).id()).isEqualTo("pet-1");
        assertThat(pets.get(0).name()).isEqualTo("Sun Ember Fledgling");
        assertThat(pets.get(0).isEquipped()).isTrue();
    }
}
