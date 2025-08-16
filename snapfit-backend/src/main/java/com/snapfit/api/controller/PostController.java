package com.snapfit.api.controller;

import com.snapfit.api.dto.post.*;
import com.snapfit.api.dto.tag.TagResponseDto;
import com.snapfit.api.entity.Post;
import com.snapfit.api.entity.Tag;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.PostRepository;
import com.snapfit.api.repository.UserRepository;
import com.snapfit.api.service.PostService;
import com.snapfit.api.service.TagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
     * 게시글 목록 조회 (페이지네이션)
     * @param pageable 페이지 정보
     * @return 게시글 목록
     */
    @GetMapping
    public ResponseEntity<Page<PostResponseDto>> getPosts(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        log.info("게시글 목록 조회 요청: page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());
        
        // TODO: 실제 게시글 목록 조회 로직 구현
        // Page<Post> posts = postService.getPosts(pageable);
        // Page<PostResponseDto> response = posts.map(this::convertToDto);
        
        // 임시 응답
        return ResponseEntity.ok(Page.empty(pageable));
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
        dto.setTags(post.getTags().stream().map(Tag::getName).collect(Collectors.toList()));
        dto.setMediaUrls(new ArrayList<>(post.getMediaUrls())); // Set을 List로 변환
        dto.setAuthorId(post.getAuthor().getUserIdx().toString()); // UUID를 String으로 변환
        dto.setLikeCount(post.getLikeCount());
        dto.setScrapCount(post.getScrapCount());
        dto.setCommentCount(post.getCommentCount());
        dto.setViewCount(post.getViewCount());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        return dto;
    }
}
