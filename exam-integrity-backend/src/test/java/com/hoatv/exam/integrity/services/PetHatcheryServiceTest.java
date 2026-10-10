package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.domain.IncubatingEgg;
import com.hoatv.exam.integrity.domain.StudentPet;
import com.hoatv.exam.integrity.domain.UserProfile;
import com.hoatv.exam.integrity.domain.UserProfileStats;
import com.hoatv.exam.integrity.dtos.EggShopItemDTO;
import com.hoatv.exam.integrity.dtos.GrowPetResponseDTO;
import com.hoatv.exam.integrity.dtos.IncubatingEggDTO;
import com.hoatv.exam.integrity.dtos.PurchaseEggResponseDTO;
import com.hoatv.exam.integrity.dtos.StudentPetDTO;
import com.hoatv.exam.integrity.repositories.IncubatingEggRepository;
import com.hoatv.exam.integrity.repositories.StudentPetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PetHatcheryServiceTest {

    @Mock
    private IncubatingEggRepository incubatingEggRepository;

    @Mock
    private StudentPetRepository studentPetRepository;

    @Mock
    private UserProfileService userProfileService;

    @InjectMocks
    private PetHatcheryService petHatcheryService;

    private UserProfile testProfile;

    @BeforeEach
    void setUp() {
        testProfile = new UserProfile("student1", "STUDENT", 5);
        testProfile.setStats(new UserProfileStats(500, 5, 9.5));
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
        when(incubatingEggRepository.save(any(IncubatingEgg.class))).thenAnswer(invocation -> {
            IncubatingEgg saved = invocation.getArgument(0);
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
        verify(incubatingEggRepository).save(any(IncubatingEgg.class));
    }

    @Test
    void strikeEggAdvancesCrackProgressAndReducesRemainingTime() {
        IncubatingEgg egg = new IncubatingEgg("student1", "Ancient Mysterious Egg", "dragon");
        egg.setId("egg-1");
        egg.setCrackProgress(0.1);
        egg.setRemainingSeconds(25920L);

        when(incubatingEggRepository.findByIdAndUserId("egg-1", "student1")).thenReturn(Optional.of(egg));
        when(incubatingEggRepository.save(any(IncubatingEgg.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IncubatingEggDTO result = petHatcheryService.strikeEgg("student1", "egg-1");

        assertThat(result.crackProgress()).isEqualTo(0.35);
        assertThat(result.remainingSeconds()).isEqualTo(18720L);
    }

    @Test
    void hatchEggFailsWhenEggNotReady() {
        IncubatingEgg egg = new IncubatingEgg("student1", "Ancient Mysterious Egg", "dragon");
        egg.setId("egg-1");
        egg.setCrackProgress(0.5);
        egg.setRemainingSeconds(10000L);

        when(incubatingEggRepository.findByIdAndUserId("egg-1", "student1")).thenReturn(Optional.of(egg));

        assertThatThrownBy(() -> petHatcheryService.hatchEgg("student1", "egg-1", 50.0))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("not ready to hatch");
    }

    @Test
    void hatchEggSucceedsWhenProgressIs100PercentAndRollsMysteryPet() {
        IncubatingEgg egg = new IncubatingEgg("student1", "Ancient Mysterious Egg", "dragon");
        egg.setId("egg-1");
        egg.setCrackProgress(1.0);
        egg.setRemainingSeconds(0L);

        when(incubatingEggRepository.findByIdAndUserId("egg-1", "student1")).thenReturn(Optional.of(egg));
        when(studentPetRepository.save(any(StudentPet.class))).thenAnswer(invocation -> {
            StudentPet p = invocation.getArgument(0);
            p.setId("pet-99");
            return p;
        });

        // Test roll 85.0 -> Epic (5 stages, Fire Phoenix / Chronopip / Umbralpaw)
        StudentPetDTO hatched = petHatcheryService.hatchEgg("student1", "egg-1", 85.0);

        assertThat(hatched).isNotNull();
        assertThat(hatched.rarity()).isEqualTo("Epic");
        assertThat(hatched.totalStages()).isEqualTo(5);
        assertThat(hatched.level()).isEqualTo(1);

        verify(incubatingEggRepository).deleteByIdAndUserId("egg-1", "student1");
        verify(studentPetRepository).save(any(StudentPet.class));
    }

    @Test
    void rollMysteryPetConformsToExactDropPercentages() {
        // Roll 10.0 -> Common (3 stages)
        StudentPet common = petHatcheryService.rollMysteryPet("student1", 10.0);
        assertThat(common.getRarity()).isEqualTo("Common");
        assertThat(common.getTotalStages()).isEqualTo(3);

        // Roll 60.0 -> Rare (4 stages)
        StudentPet rare = petHatcheryService.rollMysteryPet("student1", 60.0);
        assertThat(rare.getRarity()).isEqualTo("Rare");
        assertThat(rare.getTotalStages()).isEqualTo(4);

        // Roll 80.0 -> Epic (5 stages)
        StudentPet epic = petHatcheryService.rollMysteryPet("student1", 80.0);
        assertThat(epic.getRarity()).isEqualTo("Epic");
        assertThat(epic.getTotalStages()).isEqualTo(5);

        // Roll 95.0 -> Legendary (6 stages)
        StudentPet leg = petHatcheryService.rollMysteryPet("student1", 95.0);
        assertThat(leg.getRarity()).isEqualTo("Legendary");
        assertThat(leg.getTotalStages()).isEqualTo(6);

        // Roll 99.5 -> Mythic (8 stages)
        StudentPet mythic = petHatcheryService.rollMysteryPet("student1", 99.5);
        assertThat(mythic.getRarity()).isEqualTo("Mythic");
        assertThat(mythic.getTotalStages()).isEqualTo(8);
    }

    @Test
    void growPetSpendsStarsAndLevelsUpPetWithEvolution() {
        StudentPet pet = new StudentPet("student1", "Sun Ember Fledgling", "Primordial Solar Phoenix", "Epic", 5);
        pet.setId("pet-1");
        pet.setLevel(2);
        pet.setExpNeeded(100);
        pet.setCurrentExp(80);
        pet.setStageLevel(1);
        pet.setGrowthCostInStars(25);

        when(studentPetRepository.findByIdAndUserId("pet-1", "student1")).thenReturn(Optional.of(pet));
        when(userProfileService.spendStars("student1", 25)).thenReturn(testProfile);
        when(studentPetRepository.save(any(StudentPet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GrowPetResponseDTO response = petHatcheryService.growPet("student1", "pet-1");

        assertThat(response.levelGained()).isTrue();
        assertThat(response.pet().level()).isEqualTo(3);
        assertThat(response.didEvolve()).isTrue();
        assertThat(response.pet().stageLevel()).isEqualTo(2);

        verify(userProfileService).spendStars("student1", 25);
        verify(studentPetRepository).save(any(StudentPet.class));
    }
}

