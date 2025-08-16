package com.snapfit.api.repository;

import com.snapfit.api.entity.Scrap;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 스크랩 리포지토리 인터페이스
 * 보안과 성능을 고려한 커스텀 쿼리 메서드
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Repository
public interface ScrapRepository extends JpaRepository<Scrap, Scrap.ScrapId> {

    /**
     * 사용자별 스크랩 목록 조회 (페이징)
     * 성능: 복합 인덱스 활용
     */
    @Query("SELECT s FROM Scrap s WHERE s.user.userIdx = :userId ORDER BY s.createdAt DESC")
    Page<Scrap> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId, Pageable pageable);

    /**
     * 게시글별 스크랩 목록 조회
     * 성능: post_id 인덱스 활용
     */
    @Query("SELECT s FROM Scrap s WHERE s.post.postId = :postId ORDER BY s.createdAt DESC")
    List<Scrap> findByPostIdOrderByCreatedAtDesc(@Param("postId") Long postId);

    /**
     * 사용자별 스크랩 수 조회
     * 성능: COUNT 쿼리 최적화
     */
    @Query("SELECT COUNT(s) FROM Scrap s WHERE s.user.userIdx = :userId")
    long countByUserId(@Param("userId") UUID userId);

    /**
     * 게시글별 스크랩 수 조회
     * 성능: COUNT 쿼리 최적화
     */
    @Query("SELECT COUNT(s) FROM Scrap s WHERE s.post.postId = :postId")
    long countByPostId(@Param("postId") Long postId);

    /**
     * 특정 사용자의 특정 게시글 스크랩 여부 확인
     * 성능: 복합 기본키 활용
     */
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Scrap s WHERE s.user.userIdx = :userId AND s.post.postId = :postId")
    boolean existsByUserIdAndPostId(@Param("userId") UUID userId, @Param("postId") Long postId);

    /**
     * 사용자별 스크랩한 게시글 ID 목록 조회
     * 성능: SELECT 최적화
     */
    @Query("SELECT s.post.postId FROM Scrap s WHERE s.user.userIdx = :userId ORDER BY s.createdAt DESC")
    List<Long> findPostIdsByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);

    /**
     * 사용자별 스크랩한 게시글 ID 목록 조회 (페이징)
     * 성능: 페이징 최적화
     */
    @Query("SELECT s.post.postId FROM Scrap s WHERE s.user.userIdx = :userId ORDER BY s.createdAt DESC")
    Page<Long> findPostIdsByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId, Pageable pageable);

    /**
     * 특정 게시글을 스크랩한 사용자 ID 목록 조회
     * 성능: 인덱스 활용
     */
    @Query("SELECT s.user.userIdx FROM Scrap s WHERE s.post.postId = :postId ORDER BY s.createdAt DESC")
    List<UUID> findUserIdsByPostIdOrderByCreatedAtDesc(@Param("postId") Long postId);

    /**
     * 사용자별 스크랩 통계 조회
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT COUNT(s) as totalScraps, " +
           "COUNT(DISTINCT s.post.postId) as uniquePosts, " +
           "COUNT(DISTINCT s.post.author.userIdx) as uniqueAuthors " +
           "FROM Scrap s " +
           "WHERE s.user.userIdx = :userId")
    Object[] getScrapStatisticsByUserId(@Param("userId") UUID userId);

    /**
     * 게시글별 스크랩 통계 조회
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT COUNT(s) as totalScraps, " +
           "COUNT(DISTINCT s.user.userIdx) as uniqueUsers " +
           "FROM Scrap s " +
           "WHERE s.post.postId = :postId")
    Object[] getScrapStatisticsByPostId(@Param("postId") Long postId);

    /**
     * 사용자별 스크랩 트렌드 조회 (최근 N일)
     * 성능: 시간 기반 집계
     */
    @Query("SELECT DATE(s.createdAt) as scrapDate, COUNT(s) as scrapCount " +
           "FROM Scrap s " +
           "WHERE s.user.userIdx = :userId AND s.createdAt >= :startDate " +
           "GROUP BY DATE(s.createdAt) " +
           "ORDER BY scrapDate DESC")
    List<Object[]> getScrapTrendByUserId(@Param("userId") UUID userId, @Param("startDate") java.time.LocalDate startDate);

    /**
     * 게시글별 스크랩 트렌드 조회 (최근 N일)
     * 성능: 시간 기반 집계
     */
    @Query("SELECT DATE(s.createdAt) as scrapDate, COUNT(s) as scrapCount " +
           "FROM Scrap s " +
           "WHERE s.post.postId = :postId AND s.createdAt >= :startDate " +
           "GROUP BY DATE(s.createdAt) " +
           "ORDER BY scrapDate DESC")
    List<Object[]> getScrapTrendByPostId(@Param("postId") Long postId, @Param("startDate") java.time.LocalDate startDate);

    /**
     * 사용자별 스크랩한 태그 통계
     * 성능: JOIN 최적화
     */
    @Query("SELECT t.name as tagName, COUNT(s) as scrapCount " +
           "FROM Scrap s " +
           "JOIN s.post.tags t " +
           "WHERE s.user.userIdx = :userId " +
           "GROUP BY t.name " +
           "ORDER BY scrapCount DESC")
    List<Object[]> getScrapTagStatisticsByUserId(@Param("userId") UUID userId);

    /**
     * 사용자별 스크랩한 작성자 통계
     * 성능: JOIN 최적화
     */
    @Query("SELECT p.author.userIdx as authorId, p.author.nickname as authorNickname, COUNT(s) as scrapCount " +
           "FROM Scrap s " +
           "JOIN s.post p " +
           "WHERE s.user.userIdx = :userId " +
           "GROUP BY p.author.userIdx, p.author.nickname " +
           "ORDER BY scrapCount DESC")
    List<Object[]> getScrapAuthorStatisticsByUserId(@Param("userId") UUID userId);

    /**
     * 스크랩 중복 방지 확인
     * 성능: 복합 기본키 활용
     */
    @Query("SELECT s FROM Scrap s WHERE s.user.userIdx = :userId AND s.post.postId = :postId")
    Optional<Scrap> findByUserIdAndPostId(@Param("userId") UUID userId, @Param("postId") Long postId);

    /**
     * 사용자별 스크랩한 게시글 상세 정보 조회 (JOIN)
     * 성능: JOIN 최적화
     */
    @Query("SELECT s, p FROM Scrap s " +
           "JOIN s.post p " +
           "WHERE s.user.userIdx = :userId AND p.isDeleted = false " +
           "ORDER BY s.createdAt DESC")
    Page<Object[]> findScrapsWithPostsByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * 사용자별 스크랩한 게시글 상세 정보 조회 (JOIN, 태그 포함)
     * 성능: JOIN 최적화
     */
    @Query("SELECT s, p, t FROM Scrap s " +
           "JOIN s.post p " +
           "LEFT JOIN p.tags t " +
           "WHERE s.user.userIdx = :userId AND p.isDeleted = false " +
           "ORDER BY s.createdAt DESC")
    Page<Object[]> findScrapsWithPostsAndTagsByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * 사용자별 스크랩한 게시글 상세 정보 조회 (JOIN, 작성자 포함)
     * 성능: JOIN 최적화
     */
    @Query("SELECT s, p, u FROM Scrap s " +
           "JOIN s.post p " +
           "JOIN p.author u " +
           "WHERE s.user.userIdx = :userId AND p.isDeleted = false " +
           "ORDER BY s.createdAt DESC")
    Page<Object[]> findScrapsWithPostsAndAuthorsByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * 사용자별 스크랩한 게시글 상세 정보 조회 (JOIN, 모든 연관 정보 포함)
     * 성능: JOIN 최적화
     */
    @Query("SELECT s, p, u, t FROM Scrap s " +
           "JOIN s.post p " +
           "JOIN p.author u " +
           "LEFT JOIN p.tags t " +
           "WHERE s.user.userIdx = :userId AND p.isDeleted = false " +
           "ORDER BY s.createdAt DESC")
    Page<Object[]> findScrapsWithAllDetailsByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * 사용자별 스크랩한 게시글 검색 (내용 기반)
     * 성능: 검색 인덱스 활용
     */
    @Query("SELECT s FROM Scrap s " +
           "JOIN s.post p " +
           "WHERE s.user.userIdx = :userId AND p.isDeleted = false " +
           "AND (p.content ILIKE %:searchTerm% OR EXISTS (" +
           "  SELECT 1 FROM p.tags t WHERE t.name ILIKE %:searchTerm%" +
           ")) " +
           "ORDER BY s.createdAt DESC")
    Page<Scrap> searchScrapsByContentAndTags(@Param("userId") UUID userId, 
                                             @Param("searchTerm") String searchTerm, 
                                             Pageable pageable);

    /**
     * 사용자별 스크랩한 게시글 필터링 (태그 기반)
     * 성능: 태그 인덱스 활용
     */
    @Query("SELECT s FROM Scrap s " +
           "JOIN s.post p " +
           "JOIN p.tags t " +
           "WHERE s.user.userIdx = :userId AND p.isDeleted = false AND t.name = :tagName " +
           "ORDER BY s.createdAt DESC")
    Page<Scrap> findScrapsByTagName(@Param("userId") UUID userId, 
                                    @Param("tagName") String tagName, 
                                    Pageable pageable);

    /**
     * 사용자별 스크랩한 게시글 필터링 (작성자 기반)
     * 성능: 작성자 인덱스 활용
     */
    @Query("SELECT s FROM Scrap s " +
           "JOIN s.post p " +
           "WHERE s.user.userIdx = :userId AND p.isDeleted = false AND p.author.userIdx = :authorId " +
           "ORDER BY s.createdAt DESC")
    Page<Scrap> findScrapsByAuthorId(@Param("userId") UUID userId, 
                                     @Param("authorId") UUID authorId, 
                                     Pageable pageable);

    /**
     * 사용자별 스크랩한 게시글 필터링 (스폰서드 여부)
     * 성능: 스폰서드 인덱스 활용
     */
    @Query("SELECT s FROM Scrap s " +
           "JOIN s.post p " +
           "WHERE s.user.userIdx = :userId AND p.isDeleted = false AND p.isSponsored = :isSponsored " +
           "ORDER BY s.createdAt DESC")
    Page<Scrap> findScrapsBySponsoredStatus(@Param("userId") UUID userId, 
                                            @Param("isSponsored") Boolean isSponsored, 
                                            Pageable pageable);

    /**
     * 사용자별 스크랩한 게시글 필터링 (날짜 범위)
     * 성능: 날짜 인덱스 활용
     */
    @Query("SELECT s FROM Scrap s " +
           "JOIN s.post p " +
           "WHERE s.user.userIdx = :userId AND p.isDeleted = false " +
           "AND s.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY s.createdAt DESC")
    Page<Scrap> findScrapsByDateRange(@Param("userId") UUID userId, 
                                      @Param("startDate") java.time.LocalDateTime startDate, 
                                      @Param("endDate") java.time.LocalDateTime endDate, 
                                      Pageable pageable);

    /**
     * 사용자별 스크랩한 게시글 정렬 (좋아요 수 기준)
     * 성능: 좋아요 수 인덱스 활용
     */
    @Query("SELECT s FROM Scrap s " +
           "JOIN s.post p " +
           "WHERE s.user.userIdx = :userId AND p.isDeleted = false " +
           "ORDER BY p.likeCount DESC, s.createdAt DESC")
    Page<Scrap> findScrapsOrderByLikeCount(@Param("userId") UUID userId, Pageable pageable);

    /**
     * 사용자별 스크랩한 게시글 정렬 (스크랩 수 기준)
     * 성능: 스크랩 수 인덱스 활용
     */
    @Query("SELECT s FROM Scrap s " +
           "JOIN s.post p " +
           "WHERE s.user.userIdx = :userId AND p.isDeleted = false " +
           "ORDER BY p.scrapCount DESC, s.createdAt DESC")
    Page<Scrap> findScrapsOrderByScrapCount(@Param("userId") UUID userId, Pageable pageable);

    /**
     * 사용자별 스크랩한 게시글 정렬 (댓글 수 기준)
     * 성능: 댓글 수 인덱스 활용
     */
    @Query("SELECT s FROM Scrap s " +
           "JOIN s.post p " +
           "WHERE s.user.userIdx = :userId AND p.isDeleted = false " +
           "ORDER BY p.commentCount DESC, s.createdAt DESC")
    Page<Scrap> findScrapsOrderByCommentCount(@Param("userId") UUID userId, Pageable pageable);

    /**
     * 사용자별 스크랩한 게시글 정렬 (조회수 기준)
     * 성능: 조회수 인덱스 활용
     */
    @Query("SELECT s FROM Scrap s " +
           "JOIN s.post p " +
           "WHERE s.user.userIdx = :userId AND p.isDeleted = false " +
           "ORDER BY p.viewCount DESC, s.createdAt DESC")
    Page<Scrap> findScrapsOrderByViewCount(@Param("userId") UUID userId, Pageable pageable);
}
