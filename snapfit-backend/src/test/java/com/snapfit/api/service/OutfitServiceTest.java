package com.snapfit.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.snapfit.api.dto.OutfitDto;
import com.snapfit.api.entity.Outfit;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.OutfitRepository;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OutfitServiceTest {

    @Mock
    OutfitRepository outfitRepository;

    @InjectMocks
    OutfitService outfitService;

    @Test
    void createOutfit_returns_saved_entity() throws Exception {
        // given
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode outfitItem = objectMapper.readTree("{\"items\":[],\"background\":{\"type\":\"color\",\"selectedBackground\":\"white\"}}");
        
        User user = User.builder().userIdx(UUID.randomUUID()).email("test@ex.com").provider("kakao").providerId("1").build();
        OutfitDto dto = new OutfitDto();
        dto.setOutfitName("테스트 코디");
        dto.setOutfitItem(outfitItem);
        dto.setIsPublic(true);
        
        Outfit saved = Outfit.builder()
                .outfitIdx(1L)
                .user(user)
                .outfitName("테스트 코디")
                .outfitItem(outfitItem)
                .isPublic(true)
                .build();
        when(outfitRepository.save(any(Outfit.class))).thenReturn(saved);

        // when
        Outfit result = outfitService.createOutfit(dto, user);

        // then
        assertThat(result).isEqualTo(saved);
    }
} 