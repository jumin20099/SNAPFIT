package com.snapfit.api.controller;

import com.snapfit.api.dto.OutfitDto;
import com.snapfit.api.entity.Outfit;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.security.CustomOAuth2User;
import com.snapfit.api.security.CustomUserDetails;
import com.snapfit.api.service.OutfitService;
import com.fasterxml.jackson.annotation.JsonProperty;
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

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Outfit>> getOutfitsByProduct(@PathVariable Long productId,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "10") int size) {
        List<Outfit> outfits = outfitService.getOutfitsByProduct(productId, page, size);
        return ResponseEntity.ok(outfits);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Outfit>> getUserOutfits(@PathVariable String userId,
                                                      @RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "10") int size) {
        List<Outfit> outfits = outfitService.getUserPublicOutfits(userId, page, size);
        return ResponseEntity.ok(outfits);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Outfit>> getAllOutfits(@RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "10") int size) {
        List<Outfit> outfits = outfitService.getAllOutfits(page, size);
        return ResponseEntity.ok(outfits);
    }

    @PostMapping("/update-thumbnails")
    public ResponseEntity<String> updateThumbnails() {
        try {
            outfitService.updateAllThumbnails();
            return ResponseEntity.ok("썸네일 업데이트 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("썸네일 업데이트 실패: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/visibility")
    public ResponseEntity<Outfit> toggleVisibility(@PathVariable Long id,
                                                   @RequestBody VisibilityRequest request,
                                                   @AuthenticationPrincipal Object principal) {
        System.out.println("=== toggleVisibility 호출 ===");
        System.out.println("outfitIdx: " + id);
        System.out.println("요청된 isPublic: " + request.isPublic());
        System.out.println("principal: " + (principal != null ? "존재함" : "없음"));
        
        User user = toUser(principal);
        System.out.println("user: " + user.getUserIdx());
        
        Outfit updated = outfitService.toggleVisibility(id, request.isPublic(), user);
        System.out.println("업데이트된 코디 isPublic: " + updated.getIsPublic());
        
        return ResponseEntity.ok(updated);
    }

    // Visibility 요청 DTO
    public static class VisibilityRequest {
        @JsonProperty("isPublic")
        private boolean isPublic;

        public boolean isPublic() {
            return isPublic;
        }

        public void setPublic(boolean isPublic) {
            this.isPublic = isPublic;
        }
    }
} 