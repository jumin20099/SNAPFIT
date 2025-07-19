package com.snapfit.api.controller;

import com.snapfit.api.dto.StoreDto;
import com.snapfit.api.entity.Store;
import com.snapfit.api.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stores")
@RequiredArgsConstructor
public class StoreController {
    private final StoreRepository storeRepository;

    @GetMapping("/list")
    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    @PostMapping("/add")
    public ResponseEntity<Store> addStore(@RequestBody StoreDto dto) {
        Store store = Store.builder()
            .storeName(dto.getStoreName())
            .storeLogo(dto.getStoreLogo())
            .storeLink(dto.getStoreLink())
            .royaltyRate(dto.getRoyaltyRate())
            .contact(dto.getContact())
            .isActive(true)
            .build();
        return ResponseEntity.ok(storeRepository.save(store));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStore(@PathVariable Long id) {
        storeRepository.deleteById(id);
        return ResponseEntity.ok().body("제휴몰 삭제 완료");
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStoreStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Object isActiveObj = body.get("isActive");
        if (isActiveObj == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "isActive 값이 필요합니다."));
        }
        boolean isActive;
        try {
            isActive = Boolean.parseBoolean(isActiveObj.toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "isActive 값 파싱 오류: " + e.getMessage()));
        }
        Store store = storeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("제휴몰을 찾을 수 없습니다."));
        store.setIsActive(isActive);
        storeRepository.save(store);
        return ResponseEntity.ok().body(Map.of("success", true, "message", "상태 변경 완료"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStore(@PathVariable Long id, @RequestBody StoreDto dto) {
        Store store = storeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("제휴몰을 찾을 수 없습니다."));
        store.setStoreName(dto.getStoreName());
        store.setStoreLogo(dto.getStoreLogo());
        store.setStoreLink(dto.getStoreLink());
        store.setRoyaltyRate(dto.getRoyaltyRate());
        store.setContact(dto.getContact());
        storeRepository.save(store);
        return ResponseEntity.ok().body(Map.of("success", true, "message", "수정 완료"));
    }
}
