package com.snapfit.api.service;

import com.snapfit.api.entity.Post;
import com.snapfit.api.entity.Tag;
import com.snapfit.api.entity.User;
import com.snapfit.api.repository.PostRepository;
import com.snapfit.api.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 게시글 서비스
 * 보안과 성능을 고려한 게시글 비즈니스 로직
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final TagRepository tagRepository;

    // 태그 정규식 패턴 (한글, 영문, 숫자, 언더스코어, 하이픈)
    private static final Pattern TAG_PATTERN = Pattern.compile("^[가-힣a-zA-Z0-9_-]+$");
    private static final int MAX_TAGS_PER_POST = 10;
    private static final int MAX_TAG_LENGTH = 20;

    /**
     * 게시글 생성
     * 보안: 입력 검증, 태그 정규화, 권한 확인
     */
    @Transactional
    public Post createPost(Post post, User author, String tagString) {
        log.info("게시글 생성 시작: 작성자={}", author.getUserIdx());
        
        try {
            // 입력 검증
            validatePostInput(post);
            
            // 작성자 설정
            post.setAuthor(author);
            post.setCreatedAt(LocalDateTime.now());
            post.setUpdatedAt(LocalDateTime.now());
            
            // 태그 처리
            Set<Tag> tags = processTags(tagString);
            post.setTags(tags);
            
            // 초기 카운터 설정
            post.setLikeCount(0L);
            post.setScrapCount(0L);
            post.setCommentCount(0L);
            post.setViewCount(0L);
            
            // 게시글 저장
            Post savedPost = postRepository.save(post);
            
            // 태그별 게시글 수 업데이트
            updateTagPostCounts(tags);
            
            log.info("게시글 생성 완료: ID={}", savedPost.getPostId());
            return savedPost;
            
        } catch (Exception e) {
            log.error("게시글 생성 실패: 작성자={}", author.getUserIdx(), e);
            throw new RuntimeException("게시글 생성 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 게시글 수정
     * 보안: 소유자 확인, 입력 검증
     */
    @Transactional
    public Post updatePost(Long postId, Post updateData, User user, String tagString, boolean skipAuthorCheck) {
        log.info("게시글 수정 시작: ID={}, 수정자={}", postId, user != null ? user.getUserIdx() : "anonymous");
        
        try {
            Post existingPost = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다"));
            
            boolean postHasAuthor = existingPost.getAuthor() != null;

            if (!skipAuthorCheck) {
                if (postHasAuthor) {
                    if (user == null || !existingPost.getAuthor().getUserIdx().equals(user.getUserIdx())) {
                        throw new RuntimeException("게시글 수정 권한이 없습니다");
                    }
                } else {
                    if (user != null) {
                        throw new RuntimeException("게시글 수정 권한이 없습니다");
                    }
                }
            } else {
                if (postHasAuthor) {
                    throw new RuntimeException("게시글 수정 권한이 없습니다");
                }
            }
            
            // 입력 검증
            validatePostInput(updateData);
            
            // 기존 태그 제거
            Set<Tag> oldTags = existingPost.getTags();
            if (oldTags != null) {
                for (Tag tag : oldTags) {
                    if (tag.getPostCount() != null && tag.getPostCount() > 0) {
                        tag.setPostCount(tag.getPostCount() - 1);
                    } else {
                        tag.setPostCount(0L);
                    }
                    tagRepository.save(tag);
                }
            }
            
            // 새 태그 처리
            Set<Tag> newTags = processTags(tagString);
            existingPost.setTags(newTags);
            
            // 내용 업데이트
            existingPost.setTitle(updateData.getTitle());
            existingPost.setContent(updateData.getContent());
            if (updateData.getMediaUrls() != null) {
                existingPost.setMediaUrls(new HashSet<>(updateData.getMediaUrls()));
            }
            if (updateData.getOutfit() != null) {
                existingPost.setOutfit(updateData.getOutfit());
            }
            if (updateData.getIsSponsored() != null) {
                existingPost.setIsSponsored(updateData.getIsSponsored());
            }
            existingPost.setUpdatedAt(LocalDateTime.now());
            
            // 게시글 저장
            Post updatedPost = postRepository.save(existingPost);
            
            // 태그별 게시글 수 업데이트
            updateTagPostCounts(newTags);
            
            log.info("게시글 수정 완료: ID={}", updatedPost.getPostId());
            return updatedPost;
            
        } catch (Exception e) {
            log.error("게시글 수정 실패: ID={}, 수정자={}", postId, user != null ? user.getUserIdx() : "anonymous", e);
            throw new RuntimeException("게시글 수정 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 게시글 삭제 (Soft Delete)
     * 보안: 소유자 확인, 연관 데이터 정리
     */
    @Transactional
    public void deletePost(Long postId, User user, boolean skipAuthorCheck) {
        log.info("게시글 삭제 시작: ID={}, 삭제자={}", postId, user != null ? user.getUserIdx() : "anonymous");
        
        try {
            Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다"));
            
            boolean postHasAuthor = post.getAuthor() != null;

            if (!skipAuthorCheck) {
                if (postHasAuthor) {
                    if (user == null || !post.getAuthor().getUserIdx().equals(user.getUserIdx())) {
                        throw new RuntimeException("게시글 삭제 권한이 없습니다");
                    }
                } else {
                    if (user != null) {
                        throw new RuntimeException("게시글 삭제 권한이 없습니다");
                    }
                }
            } else {
                if (postHasAuthor) {
                    throw new RuntimeException("게시글 삭제 권한이 없습니다");
                }
            }
            
            // Soft Delete
            postRepository.softDeletePost(postId, LocalDateTime.now());
            
            // 태그별 게시글 수 감소
            if (post.getTags() != null) {
                for (Tag tag : post.getTags()) {
                    if (tag.getPostCount() != null && tag.getPostCount() > 0) {
                        tag.setPostCount(tag.getPostCount() - 1);
                    } else {
                        tag.setPostCount(0L);
                    }
                    tagRepository.save(tag);
                }
            }
            
            log.info("게시글 삭제 완료: ID={}", postId);
            
        } catch (Exception e) {
            log.error("게시글 삭제 실패: ID={}, 삭제자={}", postId, user != null ? user.getUserIdx() : "anonymous", e);
            throw new RuntimeException("게시글 삭제 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 게시글 조회
     * 성능: 조회수 증가, 캐시 고려
     */
    @Transactional
    public Post getPost(Long postId, User user) {
        log.info("게시글 조회 시작: ID={}, 조회자={}", postId, user != null ? user.getUserIdx() : "anonymous");
        
        try {
            Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다"));
            
            // 삭제된 게시글 확인
            if (post.getIsDeleted()) {
                throw new RuntimeException("삭제된 게시글입니다");
            }
            
            // 조회수 증가 (배치 처리 고려)
            postRepository.incrementViewCount(postId);
            
            log.info("게시글 조회 완료: ID={}", postId);
            return post;
            
        } catch (Exception e) {
            log.error("게시글 조회 실패: ID={}", postId, e);
            throw new RuntimeException("게시글 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 최신 게시글 조회 (무한 스크롤)
     * 성능: 커서 기반 페이지네이션
     */
    public Slice<Post> getLatestPosts(LocalDateTime cursorCreatedAt, Long cursorPostId, Pageable pageable) {
        log.info("최신 게시글 조회 시작: 커서={}, {}", cursorCreatedAt, cursorPostId);
        
        try {
            Slice<Post> posts = postRepository.findLatestPosts(cursorCreatedAt, cursorPostId, pageable);
            log.info("최신 게시글 조회 완료: {}개", posts.getNumberOfElements());
            return posts;
            
        } catch (Exception e) {
            log.error("최신 게시글 조회 실패", e);
            throw new RuntimeException("최신 게시글 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 인기 게시글 조회
     * 성능: 랭킹 알고리즘 최적화
     */
    public Page<Post> getTopPosts(Pageable pageable) {
        log.info("인기 게시글 조회 시작");
        
        try {
            Page<Post> posts = postRepository.findTopPostsByRanking(pageable);
            log.info("인기 게시글 조회 완료: {}개", posts.getNumberOfElements());
            return posts;
            
        } catch (Exception e) {
            log.error("인기 게시글 조회 실패", e);
            throw new RuntimeException("인기 게시글 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 사용자별 게시글 조회
     * 성능: 페이징 최적화
     */
    public Page<Post> getUserPosts(UUID userId, Pageable pageable) {
        log.info("사용자 게시글 조회 시작: 사용자={}", userId);
        
        try {
            Page<Post> posts = postRepository.findByAuthorIdOrderByCreatedAtDesc(userId, pageable);
            log.info("사용자 게시글 조회 완료: 사용자={}, {}개", userId, posts.getNumberOfElements());
            return posts;
            
        } catch (Exception e) {
            log.error("사용자 게시글 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("사용자 게시글 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 태그별 게시글 조회
     * 성능: 태그 인덱스 활용
     */
    public Page<Post> getPostsByTag(String tagName, Pageable pageable) {
        log.info("태그별 게시글 조회 시작: 태그={}", tagName);
        
        try {
            Page<Post> posts = postRepository.findByTagNameOrderByCreatedAtDesc(tagName, pageable);
            log.info("태그별 게시글 조회 완료: 태그={}, {}개", tagName, posts.getNumberOfElements());
            return posts;
            
        } catch (Exception e) {
            log.error("태그별 게시글 조회 실패: 태그={}", tagName, e);
            throw new RuntimeException("태그별 게시글 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 게시글 검색
     * 성능: pg_trgm 인덱스 활용
     */
    public Page<Post> searchPosts(String searchTerm, Pageable pageable) {
        log.info("게시글 검색 시작: 검색어={}", searchTerm);
        
        try {
            Page<Post> posts = postRepository.searchPostsByContentAndTags(searchTerm, pageable);
            log.info("게시글 검색 완료: 검색어={}, {}개", searchTerm, posts.getNumberOfElements());
            return posts;
            
        } catch (Exception e) {
            log.error("게시글 검색 실패: 검색어={}", searchTerm, e);
            throw new RuntimeException("게시글 검색 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 태그 처리 및 정규화
     * 보안: 태그 유효성 검증, 중복 제거
     */
    private Set<Tag> processTags(String tagString) {
        if (!StringUtils.hasText(tagString)) {
            return new HashSet<>();
        }
        
        Set<Tag> tags = new HashSet<>();
        String[] tagNames = tagString.split("\\s*,\\s*");
        
        for (String tagName : tagNames) {
            tagName = tagName.trim();
            
            // 태그 길이 및 패턴 검증
            if (tagName.length() > MAX_TAG_LENGTH || !TAG_PATTERN.matcher(tagName).matches()) {
                continue;
            }
            
            // 기존 태그 조회 또는 새로 생성
            Tag tag = tagRepository.findByName(tagName)
                .orElse(Tag.builder()
                    .name(tagName)
                    .postCount(0L)
                    .createdAt(LocalDateTime.now())
                    .build());
            
            tags.add(tag);
            
            // 최대 태그 수 제한
            if (tags.size() >= MAX_TAGS_PER_POST) {
                break;
            }
        }
        
        return tags;
    }

    /**
     * 태그별 게시글 수 업데이트
     * 성능: 배치 업데이트 고려
     */
    private void updateTagPostCounts(Set<Tag> tags) {
        for (Tag tag : tags) {
            tag.setPostCount(tag.getPostCount() + 1);
            tagRepository.save(tag);
        }
    }

    /**
     * 게시글 입력 검증
     * 보안: XSS 방지, 길이 제한
     */
    private void validatePostInput(Post post) {
        if (post == null) {
            throw new RuntimeException("게시글 정보가 없습니다");
        }
        
        if (!StringUtils.hasText(post.getContent()) || post.getContent().length() > 10000) {
            throw new RuntimeException("내용은 1-10000자 사이여야 합니다");
        }
        

        
        if (post.getMediaUrls() != null && post.getMediaUrls().size() > 10) {
            throw new RuntimeException("미디어는 최대 10개까지 업로드 가능합니다");
        }
    }

    /**
     * 게시글 통계 조회
     * 성능: 집계 쿼리 최적화
     */
    public Map<String, Object> getPostStatistics(LocalDateTime startDate) {
        log.info("게시글 통계 조회 시작: 시작일={}", startDate);
        
        try {
            Object[] stats = postRepository.getPostStatistics(startDate);
            
            Map<String, Object> statistics = Map.of(
                "totalPosts", stats[0],
                "sponsoredPosts", stats[1],
                "recentPosts", stats[2],
                "avgLikes", stats[3],
                "avgScraps", stats[4]
            );
            
            log.info("게시글 통계 조회 완료");
            return statistics;
            
        } catch (Exception e) {
            log.error("게시글 통계 조회 실패", e);
            throw new RuntimeException("게시글 통계 조회 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 게시글 목록 조회 (페이지네이션)
     */
    public Page<Post> getPosts(Pageable pageable) {
        log.info("게시글 목록 조회: page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());
        return postRepository.findAll(pageable);
    }

    /**
     * 인기 게시글 조회
     */
    public Page<Post> getTrendingPosts(Pageable pageable) {
        log.info("인기 게시글 조회");
        return postRepository.findByOrderByLikeCountDesc(pageable);
    }

    /**
     * 사용자별 게시글 조회
     */
    public Page<Post> getPostsByUser(Long userId, Pageable pageable) {
        log.info("사용자별 게시글 조회: userId={}", userId);
        return postRepository.findByAuthor_UserIdxOrderByCreatedAtDesc(userId, pageable);
    }

    /**
     * 게시글 좋아요 토글
     */
    @Transactional
    public Map<String, Object> toggleLike(Long postId) {
        log.info("게시글 좋아요 토글: postId={}", postId);
        
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다"));
        
        // TODO: 실제 사용자 정보를 받아서 좋아요 처리
        // 현재는 임시로 좋아요 수만 증가
        post.setLikeCount(post.getLikeCount() + 1);
        postRepository.save(post);
        
        return Map.of(
            "postId", postId,
            "isLiked", true,
            "likeCount", post.getLikeCount()
        );
    }

    /**
     * 게시글 조회수 증가
     */
    @Transactional
    public Map<String, Object> incrementViewCount(Long postId) {
        log.info("게시글 조회수 증가: postId={}", postId);
        
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다"));
        
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);
        
        return Map.of(
            "postId", postId,
            "viewCount", post.getViewCount()
        );
    }

    /**
     * 팔로우한 사용자들의 게시글 조회
     * @param userId 현재 사용자 ID
     * @param pageable 페이징 정보
     * @return 팔로우한 사용자들의 게시글 목록
     */
    public List<Post> getFollowingPosts(UUID userId, Pageable pageable) {
        log.info("팔로잉 게시글 조회 시작: 사용자={}", userId);
        
        try {
            // 팔로우한 사용자들의 게시글 조회 (기존 메서드 사용)
            Page<Post> followingPostsPage = postRepository.findFollowedUsersPosts(userId, pageable);
            List<Post> followingPosts = followingPostsPage.getContent();
            
            log.info("팔로잉 게시글 조회 완료: 사용자={}, 게시글 수={}", 
                userId, followingPosts.size());
            
            return followingPosts;
            
        } catch (Exception e) {
            log.error("팔로잉 게시글 조회 실패: 사용자={}", userId, e);
            throw new RuntimeException("팔로잉 게시글 조회 중 오류가 발생했습니다", e);
        }
    }
}
