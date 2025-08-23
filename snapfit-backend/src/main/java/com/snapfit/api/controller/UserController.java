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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PartnerApplicationRepository partnerApplicationRepository;

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !"anonymousUser".equals(authentication.getName())) {
            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("userIdx", user.getUserIdx().toString()); // userIdx 필드 추가
                userInfo.put("email", user.getEmail());
                userInfo.put("role", user.getRole().name());
                userInfo.put("nickname", user.getNickname());
                var apps = partnerApplicationRepository.findByUserIdx(user.getUserIdx());
                if (!apps.isEmpty()) {
                    userInfo.put("partner_application_id", apps.get(0).getId());
                }
                return ResponseEntity.ok(userInfo);
            }
        }
        Map<String, Object> defaultInfo = new HashMap<>();
        defaultInfo.put("role", "USER");
        return ResponseEntity.ok(defaultInfo);
    }
} 