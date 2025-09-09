package com.snapfit.api.controller;

import com.snapfit.api.dto.OutfitDto;
import com.snapfit.api.entity.Outfit;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.security.CustomOAuth2User;
import com.snapfit.api.security.CustomUserDetails;
import com.snapfit.api.service.OutfitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/outfits")
@RequiredArgsConstructor
public class OutfitController {

    private final OutfitService outfitService;
    private final UserRepository userRepository;

    private User toUser(@AuthenticationPrincipal Object principal) {
        if (principal == null) throw new IllegalArgumentException("인증된 사용자가 없습니다");
        
        // CustomOAuth2User인 경우
        if (principal instanceof CustomOAuth2User) {
            CustomOAuth2User oauth2User = (CustomOAuth2User) principal;
            return userRepository.findById(oauth2User.getUser().getUserIdx())
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
        }
        
        // JWT 인증인 경우 (CustomUserDetails)
        if (principal instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) principal;
            return userRepository.findById(userDetails.getUser().getUserIdx())
                    .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
        }
        
        throw new IllegalArgumentException("지원하지 않는 인증 방식입니다");
    }

    @PostMapping
    public ResponseEntity<Outfit> create(@RequestBody OutfitDto dto,
                                         @AuthenticationPrincipal Object principal) {
        Outfit saved = outfitService.createOutfit(dto, toUser(principal));
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Outfit> update(@PathVariable Long id,
                                         @RequestBody OutfitDto dto,
                                         @AuthenticationPrincipal Object principal) {
        Outfit updated = outfitService.updateOutfit(id, dto, toUser(principal));
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id,
                                    @AuthenticationPrincipal Object principal) {
        outfitService.deleteOutfit(id, toUser(principal));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<Outfit>> getMyOutfits(@AuthenticationPrincipal Object principal) {
        List<Outfit> outfits = outfitService.getUserOutfits(toUser(principal));
        return ResponseEntity.ok(outfits);
    }

    @GetMapping("/public")
    public ResponseEntity<List<Outfit>> getPublicOutfits() {
        List<Outfit> outfits = outfitService.listPublicOutfits();
        return ResponseEntity.ok(outfits);
    }
} 