package com.snapfit.api.controller;

import com.snapfit.api.dto.OutfitDto;
import com.snapfit.api.entity.Outfit;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.security.CustomOAuth2User;
import com.snapfit.api.service.OutfitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/outfits")
@RequiredArgsConstructor
public class OutfitController {

    private final OutfitService outfitService;
    private final UserRepository userRepository;

    private User toUser(@AuthenticationPrincipal CustomOAuth2User principal) {
        if (principal == null) throw new IllegalArgumentException("인증된 사용자가 없습니다");
        return userRepository.findById(principal.getUser().getUserIdx())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다"));
    }

    @PostMapping
    public ResponseEntity<Outfit> create(@RequestBody OutfitDto dto,
                                         @AuthenticationPrincipal CustomOAuth2User principal) {
        Outfit saved = outfitService.createOutfit(dto, toUser(principal));
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Outfit> update(@PathVariable Long id,
                                         @RequestBody OutfitDto dto,
                                         @AuthenticationPrincipal CustomOAuth2User principal) {
        Outfit updated = outfitService.updateOutfit(id, dto, toUser(principal));
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id,
                                    @AuthenticationPrincipal CustomOAuth2User principal) {
        outfitService.deleteOutfit(id, toUser(principal));
        return ResponseEntity.ok().build();
    }
} 