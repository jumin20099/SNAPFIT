package com.snapfit.api.repository;

import com.snapfit.api.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 댓글 리포지토리 인터페이스
 * 보안과 성능을 고려한 커스텀 쿼리 메서드
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * 게시글별 댓글 목록 조회 (페이징)
     * 성능: post_id 인덱스 활용
     */
    @Query("SELECT c FROM Comment c WHERE c.post.postId = :postId AND c.isDeleted = false ORDER BY c.createdAt ASC")
    Page<Comment> findByPostIdOrderByCreatedAtAsc(@Param("postId") Long postId, Pageable pageable);

    /**
     * 게시글별 댓글 수 조회
     * 성능: COUNT 쿼리 최적화
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.post.postId = :postId AND c.isDeleted = false")
    long countByPostId(@Param("postId") Long postId);

    /**
     * 사용자별 댓글 목록 조회 (페이징)
     * 성능: author_id 인덱스 활용
     */
    @Query("SELECT c FROM Comment c WHERE c.author.userIdx = :authorId AND c.isDeleted = false ORDER BY c.createdAt DESC")
    Page<Comment> findByAuthorIdOrderByCreatedAtDesc(@Param("authorId") UUID authorId, Pageable pageable);

    /**
     * 사용자별 댓글 수 조회
     * 성능: COUNT 쿼리 최적화
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.author.userIdx = :authorId AND c.isDeleted = false")
    long countByAuthorId(@Param("authorId") UUID authorId);

    /**
     * 부모 댓글별 대댓글 목록 조회
     * 성능: parent_id 인덱스 활용
     */
    @Query("SELECT c FROM Comment c WHERE c.parent.commentId = :parentId AND c.isDeleted = false ORDER BY c.createdAt ASC")
    List<Comment> findByParentIdOrderByCreatedAtAsc(@Param("parentId") Long parentId);

    /**
     * 부모 댓글별 대댓글 수 조회
     * 성능: COUNT 쿼리 최적화
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.parent.commentId = :parentId AND c.isDeleted = false")
    long countByParentId(@Param("parentId") Long parentId);

    /**
     * 게시글별 최상위 댓글만 조회 (페이징)
     * 성능: parent_id IS NULL 조건 최적화
     */
    @Query("SELECT c FROM Comment c WHERE c.post.postId = :postId AND c.parent IS NULL AND c.isDeleted = false ORDER BY c.createdAt ASC")
    Page<Comment> findTopLevelCommentsByPostId(@Param("postId") Long postId, Pageable pageable);

    /**
     * 게시글별 최상위 댓글 수 조회
     * 성능: COUNT 쿼리 최적화
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.post.postId = :postId AND c.parent IS NULL AND c.isDeleted = false")
    long countTopLevelCommentsByPostId(@Param("postId") Long postId);

    /**
     * 게시글별 댓글 트리 구조 조회 (최상위 댓글 + 대댓글)
     * 성능: JOIN 최적화
     */
    @Query("SELECT c, r FROM Comment c " +
           "LEFT JOIN c.replies r " +
           "WHERE c.post.postId = :postId AND c.parent IS NULL AND c.isDeleted = false " +
           "ORDER BY c.createdAt ASC, r.createdAt ASC")
    List<Object[]> findCommentTreeByPostId(@Param("postId") Long postId);

    /**
     * 게시글별 댓글 트리 구조 조회 (페이징)
     * 성능: JOIN 최적화
     */
    @Query("SELECT c, r FROM Comment c " +
           "LEFT JOIN c.replies r " +
           "WHERE c.post.postId = :postId AND c.parent IS NULL AND c.isDeleted = false " +
           "ORDER BY c.createdAt ASC, r.createdAt ASC")
    Page<Object[]> findCommentTreeByPostId(@Param("postId") Long postId, Pageable pageable);

    /**
     * 댓글 작성자 ID 조회 (권한 검증용)
     * 성능: 단일 쿼리로 권한 검증
     */
    @Query("SELECT c.author.userIdx FROM Comment c WHERE c.commentId = :commentId AND c.isDeleted = false")
    Optional<UUID> findAuthorIdByCommentId(@Param("commentId") Long commentId);

    /**
     * 댓글 존재 여부 확인 (권한 검증용)
     * 성능: EXISTS 쿼리 최적화
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Comment c WHERE c.commentId = :commentId AND c.isDeleted = false")
    boolean existsActiveComment(@Param("commentId") Long commentId);

    /**
     * 댓글 내용 검색 (내용 기반)
     * 성능: pg_trgm 인덱스 활용
     */
    @Query("SELECT c FROM Comment c WHERE c.content ILIKE %:searchTerm% AND c.isDeleted = false ORDER BY c.createdAt DESC")
    Page<Comment> searchByContent(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * 게시글별 댓글 내용 검색
     * 성능: 복합 조건 최적화
     */
    @Query("SELECT c FROM Comment c WHERE c.post.postId = :postId AND c.content ILIKE %:searchTerm% AND c.isDeleted = false ORDER BY c.createdAt DESC")
    Page<Comment> searchByPostIdAndContent(@Param("postId") Long postId, 
                                          @Param("searchTerm") String searchTerm, 
                                          Pageable pageable);

    /**
     * 사용자별 댓글 내용 검색
     * 성능: 복합 조건 최적화
     */
    @Query("SELECT c FROM Comment c WHERE c.author.userIdx = :authorId AND c.content ILIKE %:searchTerm% AND c.isDeleted = false ORDER BY c.createdAt DESC")
    Page<Comment> searchByAuthorIdAndContent(@Param("authorId") UUID authorId, 
                                            @Param("searchTerm") String searchTerm, 
                                            Pageable pageable);

    /**
     * 댓글 통계 조회 (게시글별)
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT COUNT(c) as totalComments, " +
           "COUNT(CASE WHEN c.parent IS NULL THEN 1 END) as topLevelComments, " +
           "COUNT(CASE WHEN c.parent IS NOT NULL THEN 1 END) as replyComments, " +
           "AVG(LENGTH(c.content)) as avgContentLength " +
           "FROM Comment c " +
           "WHERE c.post.postId = :postId AND c.isDeleted = false")
    Object[] getCommentStatisticsByPostId(@Param("postId") Long postId);

    /**
     * 댓글 통계 조회 (사용자별)
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT COUNT(c) as totalComments, " +
           "COUNT(CASE WHEN c.parent IS NULL THEN 1 END) as topLevelComments, " +
           "COUNT(CASE WHEN c.parent IS NOT NULL THEN 1 END) as replyComments, " +
           "AVG(LENGTH(c.content)) as avgContentLength " +
           "FROM Comment c " +
           "WHERE c.author.userIdx = :authorId AND c.isDeleted = false")
    Object[] getCommentStatisticsByAuthorId(@Param("authorId") UUID authorId);

    /**
     * 댓글 통계 조회 (전체)
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT COUNT(c) as totalComments, " +
           "COUNT(CASE WHEN c.parent IS NULL THEN 1 END) as topLevelComments, " +
           "COUNT(CASE WHEN c.parent IS NOT NULL THEN 1 END) as replyComments, " +
           "AVG(LENGTH(c.content)) as avgContentLength " +
           "FROM Comment c " +
           "WHERE c.isDeleted = false")
    Object[] getCommentStatistics();

    /**
     * 댓글 통계 조회 (날짜 범위)
     * 성능: 날짜 인덱스 활용
     */
    @Query("SELECT COUNT(c) as totalComments, " +
           "COUNT(CASE WHEN c.parent IS NULL THEN 1 END) as topLevelComments, " +
           "COUNT(CASE WHEN c.parent IS NOT NULL THEN 1 END) as replyComments, " +
           "AVG(LENGTH(c.content)) as avgContentLength " +
           "FROM Comment c " +
           "WHERE c.createdAt BETWEEN :startDate AND :endDate AND c.isDeleted = false")
    Object[] getCommentStatisticsByDateRange(@Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);

    /**
     * 댓글 통계 조회 (게시글별 + 날짜 범위)
     * 성능: 복합 조건 최적화
     */
    @Query("SELECT COUNT(c) as totalComments, " +
           "COUNT(CASE WHEN c.parent IS NULL THEN 1 END) as topLevelComments, " +
           "COUNT(CASE WHEN c.parent IS NOT NULL THEN 1 END) as replyComments, " +
           "AVG(LENGTH(c.content)) as avgContentLength " +
           "FROM Comment c " +
           "WHERE c.post.postId = :postId " +
           "AND c.createdAt BETWEEN :startDate AND :endDate " +
           "AND c.isDeleted = false")
    Object[] getCommentStatisticsByPostIdAndDateRange(@Param("postId") Long postId, 
                                                     @Param("startDate") LocalDateTime startDate, 
                                                     @Param("endDate") LocalDateTime endDate);

    /**
     * 댓글 통계 조회 (사용자별 + 날짜 범위)
     * 성능: 복합 조건 최적화
     */
    @Query("SELECT COUNT(c) as totalComments, " +
           "COUNT(CASE WHEN c.parent IS NULL THEN 1 END) as topLevelComments, " +
           "COUNT(CASE WHEN c.parent IS NOT NULL THEN 1 END) as replyComments, " +
           "AVG(LENGTH(c.content)) as avgContentLength " +
           "FROM Comment c " +
           "WHERE c.author.userIdx = :authorId " +
           "AND c.createdAt BETWEEN :startDate AND :endDate " +
           "AND c.isDeleted = false")
    Object[] getCommentStatisticsByAuthorIdAndDateRange(@Param("authorId") UUID authorId, 
                                                       @Param("startDate") LocalDateTime startDate, 
                                                       @Param("endDate") LocalDateTime endDate);

    /**
     * 댓글 트렌드 조회 (시간대별)
     * 성능: 시간 기반 집계
     */
    @Query("SELECT HOUR(c.createdAt) as hour, COUNT(c) as commentCount " +
           "FROM Comment c " +
           "WHERE c.createdAt >= :startDate AND c.isDeleted = false " +
           "GROUP BY HOUR(c.createdAt) " +
           "ORDER BY hour")
    List<Object[]> getCommentTrendByHour(@Param("startDate") LocalDateTime startDate);

    /**
     * 댓글 트렌드 조회 (일별)
     * 성능: 시간 기반 집계
     */
    @Query("SELECT DATE(c.createdAt) as commentDate, COUNT(c) as commentCount " +
           "FROM Comment c " +
           "WHERE c.createdAt >= :startDate AND c.isDeleted = false " +
           "GROUP BY DATE(c.createdAt) " +
           "ORDER BY commentDate DESC")
    List<Object[]> getCommentTrendByDate(@Param("startDate") LocalDateTime startDate);

    /**
     * 댓글 트렌드 조회 (주별)
     * 성능: 시간 기반 집계
     */
    @Query("SELECT YEARWEEK(c.createdAt) as commentWeek, COUNT(c) as commentCount " +
           "FROM Comment c " +
           "WHERE c.createdAt >= :startDate AND c.isDeleted = false " +
           "GROUP BY YEARWEEK(c.createdAt) " +
           "ORDER BY commentWeek DESC")
    List<Object[]> getCommentTrendByWeek(@Param("startDate") LocalDateTime startDate);

    /**
     * 댓글 트렌드 조회 (월별)
     * 성능: 시간 기반 집계
     */
    @Query("SELECT YEAR(c.createdAt) as commentYear, MONTH(c.createdAt) as commentMonth, COUNT(c) as commentCount " +
           "FROM Comment c " +
           "WHERE c.createdAt >= :startDate AND c.isDeleted = false " +
           "GROUP BY YEAR(c.createdAt), MONTH(c.createdAt) " +
           "ORDER BY commentYear DESC, commentMonth DESC")
    List<Object[]> getCommentTrendByMonth(@Param("startDate") LocalDateTime startDate);

    /**
     * 댓글 트렌드 조회 (게시글별)
     * 성능: 게시글별 집계
     */
    @Query("SELECT c.post.postId as postId, COUNT(c) as commentCount " +
           "FROM Comment c " +
           "WHERE c.createdAt >= :startDate AND c.isDeleted = false " +
           "GROUP BY c.post.postId " +
           "ORDER BY commentCount DESC")
    List<Object[]> getCommentTrendByPost(@Param("startDate") LocalDateTime startDate);

    /**
     * 댓글 트렌드 조회 (사용자별)
     * 성능: 사용자별 집계
     */
    @Query("SELECT c.author.userIdx as authorId, COUNT(c) as commentCount " +
           "FROM Comment c " +
           "WHERE c.createdAt >= :startDate AND c.isDeleted = false " +
           "GROUP BY c.author.userIdx " +
           "ORDER BY commentCount DESC")
    List<Object[]> getCommentTrendByAuthor(@Param("startDate") LocalDateTime startDate);

    /**
     * 댓글 트렌드 조회 (게시글별 + 날짜 범위)
     * 성능: 복합 조건 집계
     */
    @Query("SELECT c.post.postId as postId, COUNT(c) as commentCount " +
           "FROM Comment c " +
           "WHERE c.createdAt BETWEEN :startDate AND :endDate AND c.isDeleted = false " +
           "GROUP BY c.post.postId " +
           "ORDER BY commentCount DESC")
    List<Object[]> getCommentTrendByPostAndDateRange(@Param("startDate") LocalDateTime startDate, 
                                                    @Param("endDate") LocalDateTime endDate);

    /**
     * 댓글 트렌드 조회 (사용자별 + 날짜 범위)
     * 성능: 복합 조건 집계
     */
    @Query("SELECT c.author.userIdx as authorId, COUNT(c) as commentCount " +
           "FROM Comment c " +
           "WHERE c.createdAt BETWEEN :startDate AND :endDate AND c.isDeleted = false " +
           "GROUP BY c.author.userIdx " +
           "ORDER BY commentCount DESC")
    List<Object[]> getCommentTrendByAuthorAndDateRange(@Param("startDate") LocalDateTime startDate, 
                                                      @Param("endDate") LocalDateTime endDate);

    /**
     * 댓글 트렌드 조회 (게시글별 + 날짜 범위 + 페이징)
     * 성능: 복합 조건 집계 + 페이징
     */
    @Query("SELECT c.post.postId as postId, COUNT(c) as commentCount " +
           "FROM Comment c " +
           "WHERE c.createdAt BETWEEN :startDate AND :endDate AND c.isDeleted = false " +
           "GROUP BY c.post.postId " +
           "ORDER BY commentCount DESC")
    Page<Object[]> getCommentTrendByPostAndDateRange(@Param("startDate") LocalDateTime startDate, 
                                                    @Param("endDate") LocalDateTime endDate, 
                                                    Pageable pageable);

    /**
     * 댓글 트렌드 조회 (사용자별 + 날짜 범위 + 페이징)
     * 성능: 복합 조건 집계 + 페이징
     */
    @Query("SELECT c.author.userIdx as authorId, COUNT(c) as commentCount " +
           "FROM Comment c " +
           "WHERE c.createdAt BETWEEN :startDate AND :endDate AND c.isDeleted = false " +
           "GROUP BY c.author.userIdx " +
           "ORDER BY commentCount DESC")
    Page<Object[]> getCommentTrendByAuthorAndDateRange(@Param("startDate") LocalDateTime startDate, 
                                                      @Param("endDate") LocalDateTime endDate, 
                                                      Pageable pageable);

    /**
     * 댓글 트렌드 조회 (게시글별 + 날짜 범위 + 검색어)
     * 성능: 복합 조건 집계 + 검색
     */
    @Query("SELECT c.post.postId as postId, COUNT(c) as commentCount " +
           "FROM Comment c " +
           "WHERE c.createdAt BETWEEN :startDate AND :endDate " +
           "AND c.content ILIKE %:searchTerm% " +
           "AND c.isDeleted = false " +
           "GROUP BY c.post.postId " +
           "ORDER BY commentCount DESC")
    List<Object[]> getCommentTrendByPostAndDateRangeAndSearchTerm(@Param("startDate") LocalDateTime startDate, 
                                                                 @Param("endDate") LocalDateTime endDate, 
                                                                 @Param("searchTerm") String searchTerm);

    /**
     * 댓글 트렌드 조회 (사용자별 + 날짜 범위 + 검색어)
     * 성능: 복합 조건 집계 + 검색
     */
    @Query("SELECT c.author.userIdx as authorId, COUNT(c) as commentCount " +
           "FROM Comment c " +
           "WHERE c.createdAt BETWEEN :startDate AND :endDate " +
           "AND c.content ILIKE %:searchTerm% " +
           "AND c.isDeleted = false " +
           "GROUP BY c.author.userIdx " +
           "ORDER BY commentCount DESC")
    List<Object[]> getCommentTrendByAuthorAndDateRangeAndSearchTerm(@Param("startDate") LocalDateTime startDate, 
                                                                   @Param("endDate") LocalDateTime endDate, 
                                                                   @Param("searchTerm") String searchTerm);

    /**
     * 댓글 트렌드 조회 (게시글별 + 날짜 범위 + 검색어 + 페이징)
     * 성능: 복합 조건 집계 + 검색 + 페이징
     */
    @Query("SELECT c.post.postId as postId, COUNT(c) as commentCount " +
           "FROM Comment c " +
           "WHERE c.createdAt BETWEEN :startDate AND :endDate " +
           "AND c.content ILIKE %:searchTerm% " +
           "AND c.isDeleted = false " +
           "GROUP BY c.post.postId " +
           "ORDER BY commentCount DESC")
    Page<Object[]> getCommentTrendByPostAndDateRangeAndSearchTerm(@Param("startDate") LocalDateTime startDate, 
                                                                 @Param("endDate") LocalDateTime endDate, 
                                                                 @Param("searchTerm") String searchTerm, 
                                                                 Pageable pageable);

    /**
     * 댓글 트렌드 조회 (사용자별 + 날짜 범위 + 검색어 + 페이징)
     * 성능: 복합 조건 집계 + 검색 + 페이징
     */
    @Query("SELECT c.author.userIdx as authorId, COUNT(c) as commentCount " +
           "FROM Comment c " +
           "WHERE c.createdAt BETWEEN :startDate AND :endDate " +
           "AND c.content ILIKE %:searchTerm% " +
           "AND c.isDeleted = false " +
           "GROUP BY c.author.userIdx " +
           "ORDER BY commentCount DESC")
    Page<Object[]> getCommentTrendByAuthorAndDateRangeAndSearchTerm(@Param("startDate") LocalDateTime startDate, 
                                                                   @Param("endDate") LocalDateTime endDate, 
                                                                   @Param("searchTerm") String searchTerm, 
                                                                   Pageable pageable);







}
