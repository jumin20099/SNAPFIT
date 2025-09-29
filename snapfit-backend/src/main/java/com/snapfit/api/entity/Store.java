package com.snapfit.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stores")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Store {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "store_idx")
    private Long storeIdx;

    @Column(name = "store_name")
    private String storeName;
    
    @Column(name = "store_description")
    private String storeDescription;
    
    @Column(name = "store_image")
    private String storeImage;
    
    @Column(name = "store_logo")
    private String storeLogo;      // S3 URL
    
    @Column(name = "store_link")
    private String storeLink;
    
    @Column(name = "royalty_rate")
    private Float royaltyRate;
    
    @Column(name = "contact")
    private String contact;
    
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
