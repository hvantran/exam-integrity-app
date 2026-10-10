package com.hoatv.exam.integrity.controllers;

import com.hoatv.exam.integrity.dtos.EggShopItemDTO;
import com.hoatv.exam.integrity.dtos.PurchaseEggRequestDTO;
import com.hoatv.exam.integrity.dtos.PurchaseEggResponseDTO;
import com.hoatv.exam.integrity.security.UserContext;
import com.hoatv.exam.integrity.services.PetHatcheryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/shop")
@Tag(name = "EggShop", description = "3D Pet Egg Shop endpoints")
public class EggShopController {

    private final PetHatcheryService petHatcheryService;

    public EggShopController(PetHatcheryService petHatcheryService) {
        this.petHatcheryService = petHatcheryService;
    }

    @Operation(summary = "Get featured 3D egg available in the shop")
    @GetMapping("/eggs")
    public ResponseEntity<List<EggShopItemDTO>> getShopEggs() {
        return ResponseEntity.ok(List.of(petHatcheryService.getFeaturedShopEgg()));
    }

    @Operation(summary = "Purchase mystery egg using stars")
    @PostMapping("/purchase-egg")
    public ResponseEntity<PurchaseEggResponseDTO> purchaseEgg(
        @RequestBody(required = false) PurchaseEggRequestDTO request,
        Authentication auth
    ) {
        String userId = resolveUserId(auth);
        PurchaseEggResponseDTO response = petHatcheryService.purchaseMysteryEgg(userId);
        return ResponseEntity.ok(response);
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

