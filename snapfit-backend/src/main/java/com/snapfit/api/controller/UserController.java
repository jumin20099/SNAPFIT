package com.snapfit.api.controller;

import com.snapfit.api.entity.User;
import com.snapfit.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import com.snapfit.api.repository.PartnerApplicationRepository;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PartnerApplicationRepository partnerApplicationRepository;

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getUserInfo() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getName())) {
                
                String email = authentication.getName();
                Optional<User> userOpt = userRepository.findByEmail(email);
                
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("email", user.getEmail());
                    userInfo.put("role", user.getRole().name());
                    userInfo.put("nickname", user.getNickname());
                    // partner_application_id 추가
                    partnerApplicationRepository.findByUserIdx(user.getUserIdx())
                      .ifPresent(app -> userInfo.put("partner_application_id", app.getId()));
                    
                    return ResponseEntity.ok(userInfo);
                }
            }
            
            // 인증되지 않은 사용자 또는 사용자를 찾을 수 없는 경우
            Map<String, Object> defaultInfo = new HashMap<>();
            defaultInfo.put("role", "USER");
            return ResponseEntity.ok(defaultInfo);
            
        } catch (Exception e) {
            Map<String, Object> errorInfo = new HashMap<>();
            errorInfo.put("role", "USER");
            return ResponseEntity.ok(errorInfo);
        }
    }
} 