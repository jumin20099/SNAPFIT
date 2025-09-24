package com.snapfit.api.controller;

import com.snapfit.api.dto.post.*;
import com.snapfit.api.dto.tag.TagResponseDto;
import com.snapfit.api.entity.Post;
import com.snapfit.api.entity.Tag;
import com.snapfit.api.entity.User;
import com.snapfit.api.entity.Like;
import com.snapfit.api.entity.Outfit;
import com.snapfit.api.repository.PostRepository;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.repository.LikeRepository;
import com.snapfit.api.repository.ScrapRepository;
import com.snapfit.api.repository.OutfitRepository;
import com.snapfit.api.security.JwtUtil;
import com.snapfit.api.service.PostService;
import com.snapfit.api.service.TagService;
import com.snapfit.api.service.AnonymousUserService;
import org.springframework.security.crypto.password.PasswordEncoder;
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
import java.util.Map;
import java.util.HashSet;
import java.util.Optional;
import java.time.LocalDateTime;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.util.StringUtils;

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
    private final AnonymousUserService anonymousUserService;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final ScrapRepository scrapRepository;
    private final OutfitRepository outfitRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    /**
     * 게시글 생성
     * @param request 게시글 생성 요청 DTO
     * @return 생성된 게시글 정보
     */
    @PostMapping
    public ResponseEntity<?> createPost(
            @Valid @RequestBody CreatePostRequestDto request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Forwarded-For", required = false) String clientIp,
            @RequestHeader(value = "X-Real-IP", required = false) String realIp) {
        log.info("게시글 생성 요청: {}", request.getTitle());
        
        try {
            User savedUser = null;
            String authorName = "익명";
            String authorProfileImage = "/placeholder.svg";
            
            // 익명 인덱스 변수 선언
            Integer anonymousIndex = null;
            String anonymousPassword = request.getAnonymousPassword();
            
            // 1. 인증된 사용자인지 확인
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7);
                    String email = jwtUtil.getSubjectFromToken(token);
                    if (email != null) {
                        savedUser = userRepository.findByEmail(email).orElse(null);
                        if (savedUser != null) {
                            authorName = savedUser.getNickname();
                            authorProfileImage = savedUser.getProfileImage() != null ? savedUser.getProfileImage() : "/placeholder.svg";
                        }
                    }
                } catch (Exception e) {
                    log.warn("JWT 토큰 파싱 실패: {}", e.getMessage());
                }
            }
            
            // 2. 익명 사용자인 경우 익명 인덱스 할당
            if (savedUser == null) {
                String trimmedPassword = anonymousPassword != null ? anonymousPassword.trim() : null;
                if (!StringUtils.hasText(trimmedPassword) || trimmedPassword.length() < 4) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "익명 게시글 비밀번호는 4자 이상이어야 합니다."));
                }
                String userIdentifier = getClientIp(clientIp, realIp);
                anonymousIndex = anonymousUserService.getOrAssignAnonymousIndex(0L, userIdentifier); // 임시로 postId 0 사용
                authorName = anonymousUserService.generateAnonymousName(anonymousIndex);
                log.info("익명 사용자 게시글 작성: userIdentifier={}, anonymousIndex={}", userIdentifier, anonymousIndex);
                anonymousPassword = trimmedPassword;
            }
            
            // 3. 코디 데이터 처리 (있는 경우)
            Long outfitId = null;
            if (request.getCodyData() != null && savedUser != null) {
                outfitId = createOutfitFromCodyData(request.getCodyData(), savedUser);
                log.info("코디 데이터 저장 성공: outfitId={}", outfitId);
            }
            
            // 4. Post 엔티티 생성 및 저장
            Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .mediaUrls(request.getMediaUrls() != null ? request.getMediaUrls().stream().collect(Collectors.toSet()) : new java.util.HashSet<>())
                .anonymousIndex(anonymousIndex)
                .build();
            
            // 5. 작성자 설정 (익명 사용자는 null)
            post.setAuthor(savedUser);
            if (savedUser == null && anonymousPassword != null) {
                post.setAnonymousPasswordHash(passwordEncoder.encode(anonymousPassword));
            }
            
            // 5. 코디 연결 (있는 경우)
            if (outfitId != null) {
                // Outfit 엔티티를 찾아서 연결
                final Long finalOutfitId = outfitId;
                Outfit outfit = outfitRepository.findById(finalOutfitId)
                    .orElseThrow(() -> new RuntimeException("코디를 찾을 수 없습니다: " + finalOutfitId));
                post.setOutfit(outfit);
            }
            
            // 6. Post 엔티티 저장
            Post savedPost = postRepository.saveAndFlush(post);
            
            log.info("Post 엔티티 저장 성공: postId={}, outfitId={}", savedPost.getPostId(), outfitId);
            
            // 7. 응답 DTO 생성
            PostResponseDto response = new PostResponseDto();
            response.setPostId(savedPost.getPostId());
            response.setTitle(savedPost.getTitle() != null ? savedPost.getTitle() : ""); // Post 엔티티의 title 필드 사용
            response.setContent(savedPost.getContent());
            response.setTags(request.getTags());
            response.setMediaUrls(new ArrayList<>(savedPost.getMediaUrls()));
            // 익명 게시글 처리
            if (savedPost.getAuthor() != null) {
                // 로그인 사용자 게시글
                response.setAuthorId(savedPost.getAuthor().getUserIdx().toString());
                response.setAuthorName(savedPost.getAuthor().getNickname());
                response.setAuthorProfileImage(savedPost.getAuthor().getProfileImage() != null ? savedPost.getAuthor().getProfileImage() : "");
            } else {
                // 익명 게시글
                response.setAuthorId("anonymous");
                response.setAuthorName("익명" + savedPost.getAnonymousIndex());
                response.setAuthorProfileImage("");
            }
            response.setLikeCount(savedPost.getLikeCount());
            response.setScrapCount(savedPost.getScrapCount());
            response.setCommentCount(savedPost.getCommentCount());
            response.setViewCount(savedPost.getViewCount());
            response.setCreatedAt(savedPost.getCreatedAt());
            response.setUpdatedAt(savedPost.getUpdatedAt());
            response.setIsLiked(false);
            response.setIsScrapped(false);
            
            // 8. 코디 정보 추가 (있는 경우)
            if (savedPost.getOutfit() != null) {
                response.setOutfitId(savedPost.getOutfit().getOutfitIdx());
                response.setCodyData(convertOutfitToCodyData(savedPost.getOutfit()));
            }
            
            log.info("게시글 생성 성공: postId={}, userId={}, outfitId={}", 
                savedPost.getPostId(), savedUser != null ? savedUser.getUserIdx() : "anonymous", outfitId);
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
    @Transactional(readOnly = true)
    public ResponseEntity<PostResponseDto> getPost(@PathVariable Long postId) {
        log.info("게시글 조회 요청: {}", postId);
        
        try {
            // 실제 게시글 조회
            Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + postId));
            
            // 삭제된 게시글 체크
            if (post.getIsDeleted() != null && post.getIsDeleted()) {
                throw new IllegalArgumentException("삭제된 게시글입니다: " + postId);
            }
            
            // Hibernate 프록시 초기화 문제 방지를 위해 User 정보를 명시적으로 접근
            if (post.getAuthor() != null) {
                post.getAuthor().getUserIdx();
                post.getAuthor().getNickname();
                post.getAuthor().getEmail();
                post.getAuthor().getProfileImage();
            }
            
            // 실시간 개수 계산
            setRealTimeCounts(post);
            
            // DTO로 변환
            PostResponseDto response = convertToDto(post);
            
            log.info("게시글 조회 완료: postId={}, content={}, author={}", 
                postId, post.getContent(), post.getAuthor() != null ? post.getAuthor().getNickname() : "null");
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("게시글 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new PostResponseDto()); // 빈 DTO 반환
        } catch (Exception e) {
            log.error("게시글 조회 중 오류 발생: postId={}, 오류={}", postId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new PostResponseDto()); // 빈 DTO 반환
        }
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
    public ResponseEntity<?> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody UpdatePostRequestDto request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("게시글 수정 요청: {}", postId);

        String token = extractToken(authHeader);
        User currentUser = resolveUserFromAuthHeader(authHeader).orElse(null);

        Post existingPost = postRepository.findByIdWithAuthorAndTags(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다"));

        boolean isAnonymousPost = existingPost.getAuthor() == null;
        boolean isAnonymousRequest = currentUser == null;

        String providedPassword = request.getAnonymousPassword() != null ? request.getAnonymousPassword().trim() : null;

        if (isAnonymousRequest) {
            if (!isAnonymousPost) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "인증이 필요합니다."));
            }
            if (!StringUtils.hasText(providedPassword)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "비밀번호를 입력해주세요."));
            }
            if (existingPost.getAnonymousPasswordHash() == null ||
                !passwordEncoder.matches(providedPassword, existingPost.getAnonymousPasswordHash())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "비밀번호가 올바르지 않습니다."));
            }
        }

        Post updateData = Post.builder().build();
        updateData.setTitle(request.getTitle().trim());
        updateData.setContent(request.getContent().trim());
        if (request.getMediaUrls() != null) {
            updateData.setMediaUrls(new HashSet<>(request.getMediaUrls()));
        }
        String tagString = request.getTags() != null
                ? request.getTags().stream()
                    .map(String::trim)
                    .filter(tag -> !tag.isBlank())
                    .collect(Collectors.joining(","))
                : "";

        try {
            Post updatedPost = postService.updatePost(postId, updateData, currentUser, tagString, isAnonymousRequest);

            Post postForDto = postRepository.findByIdWithAuthorAndTags(postId)
                    .orElse(updatedPost);
            if (postForDto.getAuthor() != null) {
                postForDto.getAuthor().getUserIdx();
                postForDto.getAuthor().getNickname();
                postForDto.getAuthor().getProfileImage();
            }

            return ResponseEntity.ok(convertToDtoWithUserStatus(postForDto, token));
        } catch (RuntimeException e) {
            log.error("게시글 수정 실패: {}", e.getMessage());
            HttpStatus status = HttpStatus.BAD_REQUEST;
            if (e.getMessage() != null) {
                if (e.getMessage().contains("권한")) {
                    status = HttpStatus.FORBIDDEN;
                } else if (e.getMessage().contains("찾을 수 없습니다")) {
                    status = HttpStatus.NOT_FOUND;
                }
            }
            return ResponseEntity.status(status)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 게시글 삭제
     * @param postId 게시글 ID
     * @return 삭제 완료 응답
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId,
                                        @RequestHeader(value = "Authorization", required = false) String authHeader,
                                        @RequestBody(required = false) DeletePostRequestDto request) {
        log.info("게시글 삭제 요청: {}", postId);

        String token = extractToken(authHeader);
        User currentUser = resolveUserFromAuthHeader(authHeader).orElse(null);

        Post existingPost = postRepository.findByIdWithAuthorAndTags(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다"));

        boolean isAnonymousPost = existingPost.getAuthor() == null;
        boolean isAnonymousRequest = currentUser == null;
        String providedPassword = request != null && request.getAnonymousPassword() != null
                ? request.getAnonymousPassword().trim() : null;

        if (isAnonymousRequest) {
            if (!isAnonymousPost) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "인증이 필요합니다."));
            }
            if (!StringUtils.hasText(providedPassword)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "비밀번호를 입력해주세요."));
            }
            if (existingPost.getAnonymousPasswordHash() == null ||
                !passwordEncoder.matches(providedPassword, existingPost.getAnonymousPasswordHash())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "비밀번호가 올바르지 않습니다."));
            }
        }

        try {
            postService.deletePost(postId, currentUser, isAnonymousRequest);
            log.info("게시글 삭제 성공: 게시글ID={}, 사용자={}", postId,
                    currentUser != null ? currentUser.getUserIdx() : "anonymous");
            return ResponseEntity.ok(Map.of("message", "게시글이 삭제되었습니다"));
        } catch (RuntimeException e) {
            log.error("게시글 삭제 실패: {}", e.getMessage());
            HttpStatus status = HttpStatus.BAD_REQUEST;
            if (e.getMessage() != null) {
                if (e.getMessage().contains("권한")) {
                    status = HttpStatus.FORBIDDEN;
                } else if (e.getMessage().contains("찾을 수 없습니다")) {
                    status = HttpStatus.NOT_FOUND;
                }
            }
            return ResponseEntity.status(status)
                    .body(Map.of("error", e.getMessage()));
        }
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

    // 조회수 증가는 PostViewController에서 처리

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
        dto.setTitle(post.getTitle() != null ? post.getTitle() : ""); // Post 엔티티의 title 필드 사용
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
        
        // 익명 사용자인 경우 익명 이름 사용
        if (post.getAnonymousIndex() != null) {
            dto.setAuthorId("anonymous");
            dto.setAuthorName(anonymousUserService.generateAnonymousName(post.getAnonymousIndex()));
            dto.setAuthorProfileImage("/placeholder.svg");
        } else if (post.getAuthor() != null) {
            // 로그인 사용자 게시글
            dto.setAuthorId(post.getAuthor().getUserIdx().toString()); // UUID를 String으로 변환
            dto.setAuthorName(post.getAuthor().getNickname());
            dto.setAuthorProfileImage(post.getAuthor().getProfileImage() != null ? post.getAuthor().getProfileImage() : "");
        } else {
            // author가 null인 경우 (예외 상황)
            dto.setAuthorId("unknown");
            dto.setAuthorName("알 수 없음");
            dto.setAuthorProfileImage("");
        }
        dto.setLikeCount(post.getCalculatedLikeCount() != null ? post.getCalculatedLikeCount().longValue() : 0L);
        dto.setScrapCount(post.getCalculatedScrapCount() != null ? post.getCalculatedScrapCount().longValue() : 0L);
        dto.setCommentCount(post.getCommentCount());
        dto.setViewCount(post.getViewCount());
        
        log.info("Post {} DTO 변환 완료: likeCount={}, scrapCount={}, calculatedLikeCount={}, calculatedScrapCount={}", 
            post.getPostId(), dto.getLikeCount(), dto.getScrapCount(), post.getCalculatedLikeCount(), post.getCalculatedScrapCount());
        dto.setIsLiked(false); // 기본값 설정
        dto.setIsScrapped(false); // 기본값 설정
        
        // 코디 정보 추가 (있는 경우)
        if (post.getOutfit() != null) {
            dto.setOutfitId(post.getOutfit().getOutfitIdx());
            dto.setCodyData(convertOutfitToCodyData(post.getOutfit()));
        }
        
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

    private String extractToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return null;
        }
        if (authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        return authHeader.trim();
    }

    private Optional<User> resolveUserFromAuthHeader(String authHeader) {
        try {
            String token = extractToken(authHeader);
            if (token == null) {
                return Optional.empty();
            }

            String email = jwtUtil.getSubjectFromToken(token);
            if (email == null) {
                return Optional.empty();
            }

            return userRepository.findByEmail(email);
        } catch (Exception e) {
            log.warn("인증 사용자 해석 실패: {}", e.getMessage());
            return Optional.empty();
        }
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

    /**
     * 코디 데이터를 Outfit 엔티티로 변환하여 저장
     */
    private Long createOutfitFromCodyData(CreatePostRequestDto.CodyData codyData, User user) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            
            // 코디 데이터를 JSON으로 변환
            Map<String, Object> outfitItemMap = new java.util.HashMap<>();
            outfitItemMap.put("name", codyData.getName());
            outfitItemMap.put("items", codyData.getItems());
            outfitItemMap.put("background", codyData.getBackground());
            outfitItemMap.put("timestamp", codyData.getTimestamp());
            
            JsonNode outfitItemJson = objectMapper.valueToTree(outfitItemMap);
            
            // 썸네일 이미지 생성 (상의 아이템 우선, 없으면 첫 번째 아이템)
            String thumbnailUrl = null;
            if (codyData.getItems() != null && !codyData.getItems().isEmpty()) {
                // 상의(slot: top) 아이템을 우선적으로 찾기
                for (Object item : codyData.getItems()) {
                    if (item instanceof Map) {
                        Map<String, Object> itemMap = (Map<String, Object>) item;
                        String slot = (String) itemMap.get("slot");
                        if ("top".equals(slot)) {
                            thumbnailUrl = (String) itemMap.get("src");
                            log.info("코디 썸네일 생성 (상의): {}", thumbnailUrl);
                            break;
                        }
                    }
                }
                
                // 상의가 없으면 첫 번째 아이템 사용
                if (thumbnailUrl == null) {
                    Object firstItem = codyData.getItems().get(0);
                    if (firstItem instanceof Map) {
                        Map<String, Object> firstItemMap = (Map<String, Object>) firstItem;
                        thumbnailUrl = (String) firstItemMap.get("src");
                        log.info("코디 썸네일 생성 (첫 번째 아이템): {}", thumbnailUrl);
                    }
                }
            }
            
            // Outfit 엔티티 생성
            Outfit outfit = Outfit.builder()
                .user(user)
                .outfitName(codyData.getName() != null ? codyData.getName() : "코디")
                .outfitItem(outfitItemJson)
                .outfitThumbnail(thumbnailUrl)
                .isPublic(true)
                .build();
            
            // 저장
            Outfit savedOutfit = outfitRepository.save(outfit);
            return savedOutfit.getOutfitIdx();
            
        } catch (Exception e) {
            log.error("코디 데이터 저장 실패", e);
            throw new RuntimeException("코디 데이터 저장 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * Outfit 엔티티를 코디 데이터로 변환
     */
    private CreatePostRequestDto.CodyData convertOutfitToCodyData(Outfit outfit) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode outfitItem = outfit.getOutfitItem();
            
            CreatePostRequestDto.CodyData codyData = new CreatePostRequestDto.CodyData();
            codyData.setName(outfitItem.get("name").asText());
            codyData.setTimestamp(outfitItem.get("timestamp").asLong());
            
            // items 변환
            if (outfitItem.has("items")) {
                List<CreatePostRequestDto.CodyItem> items = new ArrayList<>();
                for (JsonNode item : outfitItem.get("items")) {
                    CreatePostRequestDto.CodyItem codyItem = new CreatePostRequestDto.CodyItem();
                    codyItem.setProductId(item.get("productId").asLong());
                    codyItem.setSrc(item.get("src").asText());
                    codyItem.setNx(item.get("nx").asDouble());
                    codyItem.setNy(item.get("ny").asDouble());
                    codyItem.setRotation(item.get("rotation").asDouble());
                    codyItem.setZ(item.get("z").asDouble());
                    codyItem.setScale(item.get("scale").asDouble());
                    items.add(codyItem);
                }
                codyData.setItems(items);
            }
            
            // background 변환
            if (outfitItem.has("background")) {
                JsonNode background = outfitItem.get("background");
                CreatePostRequestDto.CodyBackground codyBackground = new CreatePostRequestDto.CodyBackground();
                codyBackground.setType(background.get("type").asText());
                codyBackground.setSelectedBackground(background.get("selectedBackground").asText());
                codyBackground.setCustomColor(background.get("customColor").asText());
                codyData.setBackground(codyBackground);
            }
            
            return codyData;
            
        } catch (Exception e) {
            log.error("코디 데이터 변환 실패", e);
            return null;
        }
    }
    
    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIp(String forwardedFor, String realIp) {
        if (forwardedFor != null && !forwardedFor.isEmpty()) {
            return forwardedFor.split(",")[0].trim();
        }
        if (realIp != null && !realIp.isEmpty()) {
            return realIp;
        }
        return "unknown";
    }
}
