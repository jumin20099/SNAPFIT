package com.snapfit.api.repository;

import com.snapfit.api.entity.Post;
import com.snapfit.api.entity.BoardType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 게시글 리포지토리 인터페이스
 * 보안과 성능을 고려한 커스텀 쿼리 메서드
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    /**
     * 사용자별 게시글 조회 (페이징)
     * 성능: 인덱스 기반 조회
     */
    @Query("SELECT p FROM Post p WHERE p.author.userIdx = :userId AND p.isDeleted = false ORDER BY p.createdAt DESC")
    Page<Post> findByAuthorIdOrderByCreatedAtDesc(@Param("userId") UUID userId, Pageable pageable);

    /**
     * 사용자별 게시글 수 조회
     * 성능: COUNT 쿼리 최적화
     */
    @Query("SELECT COUNT(p) FROM Post p WHERE p.author.userIdx = :userId AND p.isDeleted = false")
    long countByAuthorId(@Param("userId") UUID userId);

    /**
     * 최신 게시글 조회 (무한 스크롤)
     * 성능: 커서 기반 페이지네이션
     */
    @Query("SELECT p FROM Post p WHERE p.isDeleted = false AND (p.createdAt, p.postId) < (:cursorCreatedAt, :cursorPostId) ORDER BY p.createdAt DESC, p.postId DESC")
    Slice<Post> findLatestPosts(@Param("cursorCreatedAt") LocalDateTime cursorCreatedAt, 
                                @Param("cursorPostId") Long cursorPostId, 
                                Pageable pageable);

    /**
     * 팔로우한 사용자 게시글 조회 (팔로우 피드)
     * 성능: JOIN 최적화
     */
    @Query("SELECT p FROM Post p " +
           "JOIN Follow f ON p.author.userIdx = f.followee.userIdx " +
           "WHERE f.follower.userIdx = :followerId AND p.isDeleted = false " +
           "ORDER BY p.createdAt DESC, p.postId DESC")
    Page<Post> findFollowedUsersPosts(@Param("followerId") UUID followerId, Pageable pageable);

    /**
     * 태그별 게시글 조회
     * 성능: 태그 인덱스 활용
     */
    @Query("SELECT p FROM Post p " +
           "JOIN p.tags t " +
           "WHERE t.name = :tagName AND p.isDeleted = false " +
           "ORDER BY p.createdAt DESC")
    Page<Post> findByTagNameOrderByCreatedAtDesc(@Param("tagName") String tagName, Pageable pageable);

    /**
     * 랭킹 기반 게시글 조회 (인기순)
     * 성능: 랭킹 인덱스 활용
     */
    @Query("SELECT p FROM Post p " +
           "WHERE p.isDeleted = false " +
           "ORDER BY (p.likeCount * 3 + p.scrapCount * 2 + p.commentCount + p.viewCount * 0.1) DESC, p.createdAt DESC")
    Page<Post> findTopPostsByRanking(Pageable pageable);

    /**
     * 특정 기간 인기 게시글 조회
     * 성능: 시간 범위 인덱스 활용
     */
    @Query("SELECT p FROM Post p " +
           "WHERE p.isDeleted = false AND p.createdAt >= :startDate " +
           "ORDER BY (p.likeCount * 3 + p.scrapCount * 2 + p.commentCount + p.viewCount * 0.1) DESC, p.createdAt DESC")
    Page<Post> findTopPostsByPeriod(@Param("startDate") LocalDateTime startDate, Pageable pageable);

    /**
     * 스폰서드 게시글 조회
     * 성능: 스폰서드 인덱스 활용
     */
    @Query("SELECT p FROM Post p " +
           "WHERE p.isSponsored = true AND p.isDeleted = false " +
           "ORDER BY p.createdAt DESC")
    Page<Post> findSponsoredPosts(Pageable pageable);

    /**
     * 코디 연관 게시글 조회
     * 성능: outfit_id 인덱스 활용
     */
    @Query("SELECT p FROM Post p " +
           "WHERE p.outfit.outfitIdx = :outfitId AND p.isDeleted = false " +
           "ORDER BY p.createdAt DESC")
    List<Post> findByOutfitIdOrderByCreatedAtDesc(@Param("outfitId") Long outfitId);

    /**
     * 최신 게시글 조회 (생성일 기준 내림차순)
     * 성능: createdAt 인덱스 활용
     */
    List<Post> findByOrderByCreatedAtDesc();

    /**
     * 특정 날짜 이후 게시글 조회 (생성일 기준 내림차순)
     * 성능: createdAt 인덱스 활용, User 정보 함께 조회
     */
    @Query("SELECT p FROM Post p JOIN FETCH p.author LEFT JOIN FETCH p.tags WHERE p.createdAt > :createdAt ORDER BY p.createdAt DESC")
    List<Post> findByCreatedAtAfterOrderByCreatedAtDesc(@Param("createdAt") LocalDateTime createdAt);

    @Query("SELECT p FROM Post p " +
           "LEFT JOIN FETCH p.author " +
           "LEFT JOIN FETCH p.tags " +
           "WHERE p.postId = :postId")
    Optional<Post> findByIdWithAuthorAndTags(@Param("postId") Long postId);

    /**
     * 코디 연관 게시글 조회 (페이징)
     * 성능: outfit_id 인덱스 활용
     */
    @Query("SELECT p FROM Post p " +
           "WHERE p.outfit.outfitIdx = :outfitId AND p.isDeleted = false " +
           "ORDER BY p.createdAt DESC")
    Page<Post> findByOutfitIdOrderByCreatedAtDesc(@Param("outfitId") Long outfitId, Pageable pageable);

    /**
     * 인기 게시글 조회 (좋아요 순)
     */
    Page<Post> findByOrderByLikeCountDesc(Pageable pageable);

    /**
     * 사용자별 게시글 조회 (사용자 ID로)
     */
    Page<Post> findByAuthor_UserIdxOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * 사용자별 게시글 조회 (User 엔티티로)
     */
    Page<Post> findByAuthorOrderByCreatedAtDesc(com.snapfit.api.entity.User author, Pageable pageable);

    /**
     * 검색어 기반 게시글 조회 (제목 + 내용)
     * 성능: pg_trgm 인덱스 활용
     */
    @Query(value = "SELECT p.* FROM posts p " +
                   "WHERE p.is_deleted = false " +
                   "AND (p.content ILIKE %:searchTerm% OR EXISTS (" +
                   "  SELECT 1 FROM post_tags pt " +
                   "  JOIN tags t ON pt.tag_id = t.tag_id " +
                   "  WHERE pt.post_id = p.post_id AND t.name ILIKE %:searchTerm%" +
                   ")) " +
                   "ORDER BY p.created_at DESC", 
           nativeQuery = true)
    Page<Post> searchPostsByContentAndTags(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * 사용자 차단 기반 게시글 필터링
     * 성능: 차단 테이블 JOIN 최적화
     */
    @Query("SELECT p FROM Post p " +
           "WHERE p.isDeleted = false " +
           "AND p.author.userIdx NOT IN (" +
           "  SELECT b.blockedUser.userIdx FROM Block b WHERE b.blocker.userIdx = :userId" +
           ") " +
           "ORDER BY p.createdAt DESC")
    Page<Post> findPostsExcludingBlockedUsers(@Param("userId") UUID userId, Pageable pageable);

    /**
     * 게시글 통계 조회 (관리자용)
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT COUNT(p) as totalPosts, " +
           "COUNT(CASE WHEN p.isSponsored = true THEN 1 END) as sponsoredPosts, " +
           "COUNT(CASE WHEN p.createdAt >= :startDate THEN 1 END) as recentPosts, " +
           "AVG(p.likeCount) as avgLikes, " +
           "AVG(p.scrapCount) as avgScraps " +
           "FROM Post p " +
           "WHERE p.isDeleted = false")
    Object[] getPostStatistics(@Param("startDate") LocalDateTime startDate);

    /**
     * 사용자별 게시글 통계
     * 성능: GROUP BY 최적화
     */
    @Query("SELECT p.author.userIdx as userId, " +
           "COUNT(p) as postCount, " +
           "SUM(p.likeCount) as totalLikes, " +
           "SUM(p.scrapCount) as totalScraps, " +
           "SUM(p.commentCount) as totalComments " +
           "FROM Post p " +
           "WHERE p.isDeleted = false " +
           "GROUP BY p.author.userIdx " +
           "ORDER BY postCount DESC")
    List<Object[]> getUserPostStatistics();

    /**
     * 태그별 게시글 통계
     * 성능: 태그 집계 최적화
     */
    @Query("SELECT t.name as tagName, " +
           "COUNT(p) as postCount, " +
           "AVG(p.likeCount) as avgLikes, " +
           "AVG(p.scrapCount) as avgScraps " +
           "FROM Post p " +
           "JOIN p.tags t " +
           "WHERE p.isDeleted = false " +
           "GROUP BY t.name " +
           "ORDER BY postCount DESC")
    List<Object[]> getTagPostStatistics();

    /**
     * 시간대별 게시글 통계 (트렌드 분석)
     * 성능: 시간 기반 집계
     */
    @Query("SELECT HOUR(p.createdAt) as hour, " +
           "COUNT(p) as postCount " +
           "FROM Post p " +
           "WHERE p.isDeleted = false AND p.createdAt >= :startDate " +
           "GROUP BY HOUR(p.createdAt) " +
           "ORDER BY hour")
    List<Object[]> getHourlyPostTrend(@Param("startDate") LocalDateTime startDate);

    /**
     * 게시글 존재 여부 확인 (권한 검증용)
     * 성능: EXISTS 쿼리 최적화
     */
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Post p WHERE p.postId = :postId AND p.isDeleted = false")
    boolean existsActivePost(@Param("postId") Long postId);

    /**
     * 사용자 게시글 권한 확인
     * 성능: 단일 쿼리로 권한 검증
     */
    @Query("SELECT p.author.userIdx FROM Post p WHERE p.postId = :postId AND p.isDeleted = false")
    Optional<UUID> findAuthorIdByPostId(@Param("postId") Long postId);

    /**
     * 게시글 조회수 증가 (배치 업데이트용)
     * 성능: UPDATE 쿼리 최적화
     */
    @Modifying
    @Query("UPDATE Post p SET p.viewCount = p.viewCount + 1 WHERE p.postId = :postId")
    void incrementViewCount(@Param("postId") Long postId);

    /**
     * 좋아요 수 증가
     */
    @Modifying
    @Query("UPDATE Post p SET p.likeCount = p.likeCount + 1 WHERE p.postId = :postId")
    void incrementLikeCount(@Param("postId") Long postId);

    /**
     * 좋아요 수 감소
     */
    @Modifying
    @Query("UPDATE Post p SET p.likeCount = GREATEST(p.likeCount - 1, 0) WHERE p.postId = :postId")
    void decrementLikeCount(@Param("postId") Long postId);

    /**
     * 스크랩 수 증가
     */
    @Modifying
    @Query("UPDATE Post p SET p.scrapCount = p.scrapCount + 1 WHERE p.postId = :postId")
    void incrementScrapCount(@Param("postId") Long postId);

    /**
     * 스크랩 수 감소
     */
    @Modifying
    @Query("UPDATE Post p SET p.scrapCount = GREATEST(p.scrapCount - 1, 0) WHERE p.postId = :postId")
    void decrementScrapCount(@Param("postId") Long postId);

    /**
     * 댓글 수 증가
     */
    @Modifying
    @Query("UPDATE Post p SET p.commentCount = p.commentCount + 1 WHERE p.postId = :postId")
    void incrementCommentCount(@Param("postId") Long postId);

    /**
     * 댓글 수 감소
     */
    @Modifying
    @Query("UPDATE Post p SET p.commentCount = GREATEST(p.commentCount - 1, 0) WHERE p.postId = :postId")
    void decrementCommentCount(@Param("postId") Long postId);

    /**
     * 게시글 Soft Delete
     */
    @Modifying
    @Query("UPDATE Post p SET p.isDeleted = true, p.updatedAt = :updatedAt WHERE p.postId = :postId")
    void softDeletePost(@Param("postId") Long postId, @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * 게시글 복구
     */
    @Modifying
    @Query("UPDATE Post p SET p.isDeleted = false, p.updatedAt = :updatedAt WHERE p.postId = :postId")
    void restorePost(@Param("postId") Long postId, @Param("updatedAt") LocalDateTime updatedAt);

    /**
     * 스폰서드 상태 변경
     */
    @Modifying
    @Query("UPDATE Post p SET p.isSponsored = :isSponsored, p.updatedAt = :updatedAt WHERE p.postId = :postId")
    void updateSponsoredStatus(@Param("postId") Long postId, 
                              @Param("isSponsored") Boolean isSponsored, 
                              @Param("updatedAt") LocalDateTime updatedAt);

    // ===== 게시판 타입별 조회 메서드들 =====

    /**
     * 게시판 타입별 게시글 조회 (페이징)
     * 성능: board_type 인덱스 활용
     */
    @EntityGraph(attributePaths = {"author", "tags", "outfit", "outfit.outfitItem"})
    @Query("SELECT p FROM Post p WHERE p.boardType = :boardType AND p.isDeleted = false ORDER BY p.createdAt DESC")
    Page<Post> findByBoardTypeOrderByCreatedAtDesc(@Param("boardType") BoardType boardType, Pageable pageable);

    /**
     * 게시판 타입별 인기 게시글 조회 (추천순)
     * 성능: board_type + 추천수 인덱스 활용
     */
    @EntityGraph(attributePaths = {"author", "tags", "outfit", "outfit.outfitItem"})
    @Query("SELECT p FROM Post p WHERE p.boardType = :boardType AND p.isDeleted = false ORDER BY p.recommendCount DESC, p.createdAt DESC")
    Page<Post> findByBoardTypeOrderByRecommendCountDesc(@Param("boardType") BoardType boardType, Pageable pageable);

    /**
     * 게시판 타입별 조회수 순 게시글 조회
     * 성능: board_type + 조회수 인덱스 활용
     */
    @EntityGraph(attributePaths = {"author", "tags", "outfit", "outfit.outfitItem"})
    @Query("SELECT p FROM Post p WHERE p.boardType = :boardType AND p.isDeleted = false ORDER BY p.viewCount DESC, p.createdAt DESC")
    Page<Post> findByBoardTypeOrderByViewCountDesc(@Param("boardType") BoardType boardType, Pageable pageable);

    /**
     * 게시판 타입별 댓글 수 순 게시글 조회
     * 성능: board_type + 댓글수 인덱스 활용
     */
    @EntityGraph(attributePaths = {"author", "tags", "outfit", "outfit.outfitItem"})
    @Query("SELECT p FROM Post p WHERE p.boardType = :boardType AND p.isDeleted = false ORDER BY p.commentCount DESC, p.createdAt DESC")
    Page<Post> findByBoardTypeOrderByCommentCountDesc(@Param("boardType") BoardType boardType, Pageable pageable);

    /**
     * 게시판 타입별 검색 (제목 + 내용)
     * 성능: board_type + 검색 인덱스 활용
     */
    @Query(value = "SELECT p.* FROM posts p " +
                   "WHERE p.board_type = :boardType AND p.is_deleted = false " +
                   "AND (p.title ILIKE %:searchTerm% OR p.content ILIKE %:searchTerm%) " +
                   "ORDER BY p.created_at DESC", 
           nativeQuery = true)
    Page<Post> searchByBoardTypeAndContent(@Param("boardType") String boardType, 
                                          @Param("searchTerm") String searchTerm, 
                                          Pageable pageable);

    // ===== 카운트 관련 메서드들 =====
    
    /**
     * 게시판 타입별 게시글 수 조회
     */
    long countByBoardType(BoardType boardType);

    // ===== 추천/비추천 관련 메서드들 =====

    /**
     * 추천 수 증가
     */
    @Modifying
    @Query("UPDATE Post p SET p.recommendCount = p.recommendCount + 1 WHERE p.postId = :postId")
    void incrementRecommendCount(@Param("postId") Long postId);

    /**
     * 추천 수 감소
     */
    @Modifying
    @Query("UPDATE Post p SET p.recommendCount = GREATEST(p.recommendCount - 1, 0) WHERE p.postId = :postId")
    void decrementRecommendCount(@Param("postId") Long postId);

    /**
     * 비추천 수 증가
     */
    @Modifying
    @Query("UPDATE Post p SET p.unrecommendCount = p.unrecommendCount + 1 WHERE p.postId = :postId")
    void incrementUnrecommendCount(@Param("postId") Long postId);

    /**
     * 비추천 수 감소
     */
    @Modifying
    @Query("UPDATE Post p SET p.unrecommendCount = GREATEST(p.unrecommendCount - 1, 0) WHERE p.postId = :postId")
    void decrementUnrecommendCount(@Param("postId") Long postId);

    /**
     * 게시판 타입별 통계 조회
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT p.boardType as boardType, " +
           "COUNT(p) as postCount, " +
           "AVG(p.viewCount) as avgViews, " +
           "AVG(p.recommendCount) as avgRecommends, " +
           "AVG(p.unrecommendCount) as avgUnrecommends, " +
           "AVG(p.commentCount) as avgComments " +
           "FROM Post p " +
           "WHERE p.isDeleted = false " +
           "GROUP BY p.boardType " +
           "ORDER BY postCount DESC")
    List<Object[]> getBoardTypeStatistics();

    /**
     * 익명 게시글을 위한 익명 인덱스 조회
     * 성능: 익명 인덱스 기반 조회
     */
    @Query("SELECT p FROM Post p WHERE p.boardType = :boardType AND p.anonymousIndex = :anonymousIndex AND p.isDeleted = false ORDER BY p.createdAt DESC")
    Page<Post> findByBoardTypeAndAnonymousIndexOrderByCreatedAtDesc(@Param("boardType") BoardType boardType, 
                                                                   @Param("anonymousIndex") Integer anonymousIndex, 
                                                                   Pageable pageable);
}
