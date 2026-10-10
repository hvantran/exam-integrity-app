package com.hoatv.exam.integrity.controllers;

import com.hoatv.exam.integrity.dtos.GrowPetResponseDTO;
import com.hoatv.exam.integrity.dtos.IncubatingEggDTO;
import com.hoatv.exam.integrity.dtos.StudentPetDTO;
import com.hoatv.exam.integrity.security.UserContext;
import com.hoatv.exam.integrity.services.PetHatcheryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hatchery")
@Tag(name = "PetHatchery", description = "Pet incubator, hatching, and companion sanctuary endpoints")
public class PetHatcheryController {

    private final PetHatcheryService petHatcheryService;

    public PetHatcheryController(PetHatcheryService petHatcheryService) {
        this.petHatcheryService = petHatcheryService;
    }

    @Operation(summary = "Get user's incubating eggs")
    @GetMapping("/incubator")
    public ResponseEntity<List<IncubatingEggDTO>> getIncubatorEggs(Authentication auth) {
        String userId = resolveUserId(auth);
        return ResponseEntity.ok(petHatcheryService.getIncubatorEggs(userId));
    }

    @Operation(summary = "Strike / crack an incubating egg to speed up hatching")
    @PostMapping("/incubator/{eggId}/strike")
    public ResponseEntity<IncubatingEggDTO> strikeEgg(
        @PathVariable("eggId") String eggId,
        Authentication auth
    ) {
        String userId = resolveUserId(auth);
        return ResponseEntity.ok(petHatcheryService.strikeEgg(userId, eggId));
    }

    @Operation(summary = "Hatch an egg that has finished incubation or reached 100% progress")
    @PostMapping("/incubator/{eggId}/hatch")
    public ResponseEntity<StudentPetDTO> hatchEgg(
        @PathVariable("eggId") String eggId,
        @RequestParam(name = "fixedRoll", required = false) Double fixedRoll,
        Authentication auth
    ) {
        String userId = resolveUserId(auth);
        return ResponseEntity.ok(petHatcheryService.hatchEgg(userId, eggId, fixedRoll));
    }

    @Operation(summary = "Equip an incubating egg as active companion")
    @PostMapping("/incubator/{eggId}/equip")
    public ResponseEntity<IncubatingEggDTO> equipEgg(
        @PathVariable("eggId") String eggId,
        Authentication auth
    ) {
        String userId = resolveUserId(auth);
        return ResponseEntity.ok(petHatcheryService.equipEgg(userId, eggId));
    }

    @Operation(summary = "Get all student's hatched pets in sanctuary")
    @GetMapping("/pets")
    public ResponseEntity<List<StudentPetDTO>> getMyPets(Authentication auth) {
        String userId = resolveUserId(auth);
        return ResponseEntity.ok(petHatcheryService.getMyPets(userId));
    }

    @Operation(summary = "Spend stars to grow / level up a companion pet")
    @PostMapping("/pets/{petId}/grow")
    public ResponseEntity<GrowPetResponseDTO> growPet(
        @PathVariable("petId") String petId,
        Authentication auth
    ) {
        String userId = resolveUserId(auth);
        return ResponseEntity.ok(petHatcheryService.growPet(userId, petId));
    }

    @Operation(summary = "Equip a pet as active companion")
    @PostMapping("/pets/{petId}/equip")
    public ResponseEntity<StudentPetDTO> equipPet(
        @PathVariable("petId") String petId,
        Authentication auth
    ) {
        String userId = resolveUserId(auth);
        return ResponseEntity.ok(petHatcheryService.equipPet(userId, petId));
    }

    private String resolveUserId(Authentication auth) {
        if (auth != null) {
            if (auth.getPrincipal() instanceof Jwt jwt && jwt.getSubject() != null && !jwt.getSubject().isBlank()) {
                return jwt.getSubject();
            }
            if (auth.getName() != null && !auth.getName().isBlank()) {
                return auth.getName();
            }
        }
        String ctxUser = UserContext.getUsername();
        return (ctxUser != null && !ctxUser.isBlank()) ? ctxUser : "guest";
    }
}

