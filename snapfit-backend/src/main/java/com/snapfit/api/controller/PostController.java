package com.snapfit.api.controller;

import com.snapfit.api.dto.post.*;
import com.snapfit.api.dto.tag.TagResponseDto;
import com.snapfit.api.entity.Post;
import com.snapfit.api.entity.Tag;
import com.snapfit.api.entity.User;
import com.snapfit.api.entity.Like;
import com.snapfit.api.repository.PostRepository;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.repository.LikeRepository;
import com.snapfit.api.repository.ScrapRepository;
import com.snapfit.api.security.JwtUtil;
import com.snapfit.api.service.PostService;
import com.snapfit.api.service.TagService;
import com.snapfit.api.service.FollowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.time.LocalDateTime;

/**
 * 게시글 API 컨트롤러
 * 게시글 CRUD 및 관련 기능 제공
 */
@Slf4j
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final TagService tagService;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final ScrapRepository scrapRepository;
    private final JwtUtil jwtUtil;
    private final FollowService followService;

    /**
     * 게시글 생성
     * @param request 게시글 생성 요청 DTO
     * @return 생성된 게시글 정보
     */
    @PostMapping
    public ResponseEntity<PostResponseDto> createPost(@Valid @RequestBody CreatePostRequestDto request) {
        log.info("게시글 생성 요청: {}", request.getTitle());
        
        try {
            // 단계별 DB 저장 테스트 - User 엔티티만 저장
            
            // 1. 기존 사용자 찾기 또는 새로 생성
            User savedUser = userRepository.findByEmail("temp@test.com")
                .orElseGet(() -> {
                    // 사용자가 없으면 새로 생성
                    User tempUser = new User();
                    tempUser.setNickname("임시사용자");
                    tempUser.setEmail("temp@test.com");
                    tempUser.setProvider("test");
                    tempUser.setProviderId("test-id");
                    return userRepository.save(tempUser);
                });
            
            log.info("User 엔티티 저장 성공: userId={}", savedUser.getUserIdx());
            
            // 2. Post 엔티티 생성 및 저장
            Post post = Post.builder()
                .content(request.getContent())
                .mediaUrls(request.getMediaUrls().stream().collect(Collectors.toSet()))
                .build();
            
            // 3. 작성자 설정
            post.setAuthor(savedUser);
            
            // 4. Post 엔티티 저장 (saveAndFlush로 조기 실패 유도)
            Post savedPost = postRepository.saveAndFlush(post);
            
            log.info("Post 엔티티 저장 성공: postId={}", savedPost.getPostId());
            
            // 5. 응답 DTO 생성 (실제 저장된 데이터 사용)
            PostResponseDto response = new PostResponseDto();
            response.setPostId(savedPost.getPostId());
            response.setTitle(""); // Post 엔티티에는 title 필드가 없음
            response.setContent(savedPost.getContent());
            response.setTags(request.getTags());
            response.setMediaUrls(new ArrayList<>(savedPost.getMediaUrls()));
            response.setAuthorId(savedPost.getAuthor().getUserIdx().toString());
            response.setAuthorName(savedPost.getAuthor().getNickname());
            response.setAuthorProfileImage("");
            response.setLikeCount(savedPost.getLikeCount());
            response.setScrapCount(savedPost.getScrapCount());
            response.setCommentCount(savedPost.getCommentCount());
            response.setViewCount(savedPost.getViewCount());
            response.setCreatedAt(savedPost.getCreatedAt());
            response.setUpdatedAt(savedPost.getUpdatedAt());
            response.setIsLiked(false);
            response.setIsScrapped(false);
            
            log.info("게시글 생성 성공 (User + Post 모두 저장): postId={}, userId={}", savedPost.getPostId(), savedUser.getUserIdx());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            log.error("게시글 생성 실패", e);
            throw new RuntimeException("게시글 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 팔로우한 사용자들의 게시글 조회
     * @param token JWT 토큰
     * @param pageable 페이징 정보
     * @return 팔로우한 사용자들의 게시글 목록
     */
    @GetMapping("/following")
    public ResponseEntity<List<PostResponseDto>> getFollowingPosts(
            @RequestHeader("Authorization") String token,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        try {
            // JWT 토큰에서 이메일 추출
            String email = jwtUtil.getSubjectFromToken(token.replace("Bearer ", ""));
            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            // 이메일로 사용자 찾기
            User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
            
            // 팔로우한 사용자들의 게시글 조회
            List<Post> followingPosts = postService.getFollowingPosts(currentUser.getUserIdx(), pageable);
            
            // DTO로 변환
            List<PostResponseDto> response = followingPosts.stream()
                .map(post -> convertToDtoWithUserStatus(post, token))
                .collect(Collectors.toList());
            
            log.info("팔로잉 게시글 조회 완료: 사용자={}, 게시글 수={}", email, response.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("팔로잉 게시글 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 게시글 상세 조회
     * @param postId 게시글 ID
     * @return 게시글 상세 정보
     */
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponseDto> getPost(@PathVariable Long postId) {
        log.info("게시글 조회 요청: {}", postId);
        
        // TODO: 실제 게시글 조회 로직 구현
        PostResponseDto response = new PostResponseDto();
        response.setPostId(postId);
        response.setTitle("샘플 게시글");
        response.setContent("샘플 내용");
        
        return ResponseEntity.ok(response);
    }

    /**
     * 게시글 목록 조회 (페이징, 정렬, 검색 지원)
     * 보안: 삭제된 게시글 제외, 작성자 정보 포함
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Page<PostResponseDto>> getPosts(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tag,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        log.info("게시글 목록 조회 요청: page={}, size={}, search={}, tag={}", 
                pageable.getPageNumber(), pageable.getPageSize(), search, tag);
        
        try {
            // 검색 조건에 따른 게시글 조회
            Page<Post> posts;
            if (search != null && !search.trim().isEmpty()) {
                posts = postService.searchPosts(search, pageable);
            } else if (tag != null && !tag.trim().isEmpty()) {
                posts = postService.getPostsByTag(tag, pageable);
            } else {
                posts = postRepository.findAll(pageable);
            }
            
            // 사용자 인증 정보 추출
            final String token = authHeader != null && authHeader.startsWith("Bearer ") 
                ? authHeader.substring(7) 
                : null;
            
            // 토큰이 있으면 사용자별 좋아요/스크랩 상태 포함하여 변환
            Page<PostResponseDto> response;
            if (token != null) {
                response = posts.map(post -> {
                    try {
                        // 실시간 개수 계산 및 설정
                        setRealTimeCounts(post);
                        return convertToDtoWithUserStatus(post, token);
                    } catch (Exception e) {
                        log.error("Post {} 변환 중 오류 발생: {}", post.getPostId(), e.getMessage());
                        // 오류 발생 시 기본 DTO 반환
                        return convertToDto(post);
                    }
                });
            } else {
                response = posts.map(post -> {
                    try {
                        // 실시간 개수 계산 및 설정
                        setRealTimeCounts(post);
                        return convertToDto(post);
                    } catch (Exception e) {
                        log.error("Post {} 변환 중 오류 발생: {}", post.getPostId(), e.getMessage());
                        // 오류 발생 시 기본 DTO 반환
                        return convertToDto(post);
                    }
                });
            }
            
            log.info("게시글 목록 조회 완료: {}개", response.getTotalElements());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("게시글 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Page.empty(pageable));
        }
    }

    /**
     * 게시글 수정
     * @param postId 게시글 ID
     * @param request 수정 요청 DTO
     * @return 수정된 게시글 정보
     */
    @PutMapping("/{postId}")
    public ResponseEntity<PostResponseDto> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody UpdatePostRequestDto request) {
        log.info("게시글 수정 요청: {}", postId);
        
        // TODO: 실제 게시글 수정 로직 구현
        PostResponseDto response = new PostResponseDto();
        response.setPostId(postId);
        response.setTitle(request.getTitle());
        response.setContent(request.getContent());
        response.setTags(request.getTags());
        response.setMediaUrls(request.getMediaUrls());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 게시글 삭제
     * @param postId 게시글 ID
     * @return 삭제 완료 응답
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        log.info("게시글 삭제 요청: {}", postId);
        
        // TODO: 실제 게시글 삭제 로직 구현
        // postService.deletePost(postId, user);
        
        return ResponseEntity.noContent().build();
    }

    /**
     * 게시글 좋아요 토글
     * @param postId 게시글 ID
     * @return 좋아요 상태
     */
    @PostMapping("/{postId}/like")
    public ResponseEntity<LikeResponseDto> toggleLike(@PathVariable Long postId) {
        log.info("게시글 좋아요 토글 요청: {}", postId);
        
        // TODO: 실제 좋아요 토글 로직 구현
        LikeResponseDto response = new LikeResponseDto();
        response.setPostId(postId);
        response.setIsLiked(true);
        response.setLikeCount(1L);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 게시글 조회수 증가
     * @param postId 게시글 ID
     * @return 조회수 정보
     */
    @PostMapping("/{postId}/view")
    public ResponseEntity<ViewCountResponseDto> incrementViewCount(@PathVariable Long postId) {
        log.info("게시글 조회수 증가 요청: {}", postId);
        
        // TODO: 실제 조회수 증가 로직 구현
        ViewCountResponseDto response = new ViewCountResponseDto();
        response.setPostId(postId);
        response.setViewCount(1L);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 인기 게시글 조회
     * @param pageable 페이지 정보
     * @return 인기 게시글 목록
     */
    @GetMapping("/trending")
    public ResponseEntity<Page<PostResponseDto>> getTrendingPosts(
            @PageableDefault(size = 10, sort = "likeCount") Pageable pageable) {
        log.info("인기 게시글 조회 요청");
        
        // TODO: 실제 인기 게시글 조회 로직 구현
        return ResponseEntity.ok(Page.empty(pageable));
    }

    /**
     * 사용자별 게시글 조회
     * @param userId 사용자 ID
     * @param pageable 페이지 정보
     * @return 사용자 게시글 목록
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<PostResponseDto>> getPostsByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        log.info("사용자 게시글 조회 요청: {}", userId);
        
        // TODO: 실제 사용자별 게시글 조회 로직 구현
        return ResponseEntity.ok(Page.empty(pageable));
    }

    /**
     * 태그별 게시글 조회
     * @param tagName 태그명
     * @param pageable 페이지 정보
     * @return 태그별 게시글 목록
     */
    @GetMapping("/tag/{tagName}")
    public ResponseEntity<Page<PostResponseDto>> getPostsByTag(
            @PathVariable String tagName,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        log.info("태그별 게시글 조회 요청: {}", tagName);
        
        // TODO: 실제 태그별 게시글 조회 로직 구현
        return ResponseEntity.ok(Page.empty(pageable));
    }

    /**
     * 인기 태그 목록 조회
     * @return 인기 태그 목록
     */
    @GetMapping("/tags/trending")
    public ResponseEntity<List<TagResponseDto>> getTrendingTags() {
        log.info("인기 태그 조회 요청");
        
        // TODO: 실제 인기 태그 조회 로직 구현
        List<TagResponseDto> response = List.of();
        return ResponseEntity.ok(response);
    }

    /**
     * Entity를 DTO로 변환하는 헬퍼 메서드
     */
    private PostResponseDto convertToDto(Post post) {
        PostResponseDto dto = new PostResponseDto();
        dto.setPostId(post.getPostId());
        dto.setTitle(""); // Post 엔티티에는 title이 없음
        dto.setContent(post.getContent());
        
        // tags 컬렉션을 안전하게 처리
        try {
            if (post.getTags() != null && !post.getTags().isEmpty()) {
                dto.setTags(post.getTags().stream()
                    .map(Tag::getName)
                    .collect(Collectors.toList()));
            } else {
                dto.setTags(new ArrayList<>());
            }
        } catch (Exception e) {
            log.warn("Post {}의 tags 처리 중 오류 발생: {}", post.getPostId(), e.getMessage());
            dto.setTags(new ArrayList<>());
        }
        
        dto.setMediaUrls(new ArrayList<>(post.getMediaUrls())); // Set을 List로 변환
        dto.setAuthorId(post.getAuthor().getUserIdx().toString()); // UUID를 String으로 변환
        dto.setAuthorName(post.getAuthor().getNickname());
        dto.setAuthorProfileImage(post.getAuthor().getProfileImage() != null ? post.getAuthor().getProfileImage() : "");
        dto.setLikeCount(post.getCalculatedLikeCount() != null ? post.getCalculatedLikeCount().longValue() : 0L);
        dto.setScrapCount(post.getCalculatedScrapCount() != null ? post.getCalculatedScrapCount().longValue() : 0L);
        dto.setCommentCount(post.getCommentCount());
        dto.setViewCount(post.getViewCount());
        
        log.info("Post {} DTO 변환 완료: likeCount={}, scrapCount={}, calculatedLikeCount={}, calculatedScrapCount={}", 
            post.getPostId(), dto.getLikeCount(), dto.getScrapCount(), post.getCalculatedLikeCount(), post.getCalculatedScrapCount());
        dto.setIsLiked(false); // 기본값 설정
        dto.setIsScrapped(false); // 기본값 설정
        return dto;
    }

    /**
     * 사용자별 좋아요/스크랩 상태를 포함하여 DTO로 변환하는 헬퍼 메서드
     */
    private PostResponseDto convertToDtoWithUserStatus(Post post, String token) {
        PostResponseDto dto = convertToDto(post); // 기본 정보는 공통 메서드로 처리

        // 사용자 인증 정보 추출 및 상태 계산
        if (token != null) {
            try {
                // JWT 토큰에서 이메일 추출
                String email = jwtUtil.getSubjectFromToken(token);
                if (email != null) {
                    // 이메일로 사용자 찾기
                    userRepository.findByEmail(email).ifPresent(currentUser -> {
                        // 좋아요 상태 확인
                        boolean userLiked = likeRepository.existsByUserIdAndPostId(currentUser.getUserIdx(), post.getPostId());
                        
                        // 스크랩 상태 확인
                        boolean userScrapped = scrapRepository.existsByUserIdAndPostId(currentUser.getUserIdx(), post.getPostId());
                        
                        // DTO에 상태 설정
                        dto.setIsLiked(userLiked);
                        dto.setIsScrapped(userScrapped);
                    });
                }
            } catch (Exception e) {
                log.warn("JWT 토큰 파싱 중 오류 발생: {}", e.getMessage());
                // 토큰이 유효하지 않거나 오류가 발생하면 비로그인 상태로 간주
                dto.setIsLiked(false);
                dto.setIsScrapped(false);
            }
        } else {
            // 토큰이 없는 경우 비로그인 상태
            dto.setIsLiked(false);
            dto.setIsScrapped(false);
        }

        return dto;
    }

    /**
     * 실시간 좋아요/스크랩 개수 계산 및 설정
     */
    private void setRealTimeCounts(Post post) {
        try {
            log.info("Post {} 실시간 개수 계산 시작", post.getPostId());
            
            // 좋아요 개수 계산 - POST 타입을 OUTFIT_SHARE로 매핑
            Long likeCount = likeRepository.countByTargetIdxAndTargetTypeAndIsLikeTrue(
                post.getPostId(), Like.TargetType.OUTFIT_SHARE);
            post.setCalculatedLikeCount(likeCount.intValue());
            
            // 스크랩 개수 계산
            Long scrapCount = scrapRepository.countByPostId(post.getPostId());
            post.setCalculatedScrapCount(scrapCount.intValue());
            
            log.info("Post {} 실시간 개수 계산 완료: 좋아요={}, 스크랩={}, calculatedLikeCount={}, calculatedScrapCount={}", 
                post.getPostId(), likeCount, scrapCount, post.getCalculatedLikeCount(), post.getCalculatedScrapCount());
                
        } catch (Exception e) {
            log.error("Post {} 실시간 개수 계산 실패: {}", post.getPostId(), e.getMessage(), e);
            // 오류 발생 시 기본값 사용
            post.setCalculatedLikeCount(post.getLikeCount() != null ? post.getLikeCount().intValue() : 0);
            post.setCalculatedScrapCount(post.getScrapCount() != null ? post.getScrapCount().intValue() : 0);
        }
    }
}
