package com.snapfit.api.controller;

import com.snapfit.api.dto.StoreDto;
import com.snapfit.api.entity.Store;
import com.snapfit.api.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            .isDeleted(false)
            .build();
        return ResponseEntity.ok(storeRepository.save(store));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStore(@PathVariable Long id) {
        Store store = storeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("제휴몰을 찾을 수 없습니다."));
        store.setIsDeleted(true);
        storeRepository.save(store);
        return ResponseEntity.ok().body("제휴몰 삭제 완료");
    }
}
