package com.snapfit.api.service;

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
    void createOutfit_returns_saved_entity() {
        // given
        User user = User.builder().userIdx(UUID.randomUUID()).email("test@ex.com").provider("kakao").providerId("1").build();
        OutfitDto dto = new OutfitDto();
        dto.setOutfitItem("{}");
        Outfit saved = Outfit.builder().outfitIdx(1L).user(user).outfitItem("{}").build();
        when(outfitRepository.save(any(Outfit.class))).thenReturn(saved);

        // when
        Outfit result = outfitService.createOutfit(dto, user);

        // then
        assertThat(result).isEqualTo(saved);
    }
} 