package com.snapfit.api.repository;

import com.snapfit.api.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<Store, Long> {
    
}
