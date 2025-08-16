package com.snapfit.api.repository;

import com.snapfit.api.entity.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 태그 리포지토리 인터페이스
 * 보안과 성능을 고려한 커스텀 쿼리 메서드
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    /**
     * 태그명으로 태그 조회
     * 성능: name 인덱스 활용
     */
    Optional<Tag> findByName(String name);

    /**
     * 태그명으로 태그 존재 여부 확인
     * 성능: EXISTS 쿼리 최적화
     */
    boolean existsByName(String name);

    /**
     * 태그명 패턴으로 태그 검색
     * 성능: pg_trgm 인덱스 활용
     */
    @Query("SELECT t FROM Tag t WHERE t.name ILIKE %:pattern% ORDER BY t.postCount DESC, t.createdAt DESC")
    List<Tag> findByNamePatternOrderByPostCountDesc(@Param("pattern") String pattern);

    /**
     * 인기 태그 조회 (게시글 수 기준)
     * 성능: post_count 인덱스 활용
     */
    @Query("SELECT t FROM Tag t ORDER BY t.postCount DESC, t.createdAt DESC")
    Page<Tag> findTopTagsByPostCount(Pageable pageable);

    /**
     * 특정 기간 인기 태그 조회
     * 성능: 시간 범위 인덱스 활용
     */
    @Query("SELECT t FROM Tag t WHERE t.createdAt >= :startDate ORDER BY t.postCount DESC, t.createdAt DESC")
    Page<Tag> findTopTagsByPeriod(@Param("startDate") LocalDateTime startDate, Pageable pageable);

    /**
     * 최근 생성된 태그 조회
     * 성능: created_at 인덱스 활용
     */
    @Query("SELECT t FROM Tag t ORDER BY t.createdAt DESC")
    Page<Tag> findRecentTags(Pageable pageable);

    /**
     * 태그별 게시글 수 통계 조회
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT t.name as tagName, t.postCount, t.createdAt " +
           "FROM Tag t " +
           "ORDER BY t.postCount DESC")
    List<Object[]> getTagStatistics();

    /**
     * 태그별 게시글 수 통계 조회 (페이징)
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT t.name as tagName, t.postCount, t.createdAt " +
           "FROM Tag t " +
           "ORDER BY t.postCount DESC")
    Page<Object[]> getTagStatistics(Pageable pageable);

    /**
     * 태그별 게시글 수 통계 조회 (최소 게시글 수 기준)
     * 성능: WHERE 절 최적화
     */
    @Query("SELECT t.name as tagName, t.postCount, t.createdAt " +
           "FROM Tag t " +
           "WHERE t.postCount >= :minPostCount " +
           "ORDER BY t.postCount DESC")
    List<Object[]> getTagStatisticsByMinPostCount(@Param("minPostCount") Long minPostCount);

    /**
     * 태그별 게시글 수 통계 조회 (최소 게시글 수 기준, 페이징)
     * 성능: WHERE 절 최적화
     */
    @Query("SELECT t.name as tagName, t.postCount, t.createdAt " +
           "FROM Tag t " +
           "WHERE t.postCount >= :minPostCount " +
           "ORDER BY t.postCount DESC")
    Page<Object[]> getTagStatisticsByMinPostCount(@Param("minPostCount") Long minPostCount, Pageable pageable);

    /**
     * 인기 태그 조회 (인기도 순)
     */
    Page<Tag> findByOrderByPopularityDesc(Pageable pageable);

    /**
     * 태그별 게시글 수 통계 조회 (최대 게시글 수 기준)
     * 성능: WHERE 절 최적화
     */
    @Query("SELECT t.name as tagName, t.postCount, t.createdAt " +
           "FROM Tag t " +
           "WHERE t.postCount <= :maxPostCount " +
           "ORDER BY t.postCount DESC")
    List<Object[]> getTagStatisticsByMaxPostCount(@Param("maxPostCount") Long maxPostCount);

    /**
     * 태그별 게시글 수 통계 조회 (최대 게시글 수 기준, 페이징)
     * 성능: WHERE 절 최적화
     */
    @Query("SELECT t.name as tagName, t.postCount, t.createdAt " +
           "FROM Tag t " +
           "WHERE t.postCount <= :maxPostCount " +
           "ORDER BY t.postCount DESC")
    Page<Object[]> getTagStatisticsByMaxPostCount(@Param("maxPostCount") Long maxPostCount, Pageable pageable);

    /**
     * 태그별 게시글 수 통계 조회 (게시글 수 범위)
     * 성능: WHERE 절 최적화
     */
    @Query("SELECT t.name as tagName, t.postCount, t.createdAt " +
           "FROM Tag t " +
           "WHERE t.postCount BETWEEN :minPostCount AND :maxPostCount " +
           "ORDER BY t.postCount DESC")
    List<Object[]> getTagStatisticsByPostCountRange(@Param("minPostCount") Long minPostCount, 
                                                    @Param("maxPostCount") Long maxPostCount);

    /**
     * 태그별 게시글 수 통계 조회 (게시글 수 범위, 페이징)
     * 성능: WHERE 절 최적화
     */
    @Query("SELECT t.name as tagName, t.postCount, t.createdAt " +
           "FROM Tag t " +
           "WHERE t.postCount BETWEEN :minPostCount AND :maxPostCount " +
           "ORDER BY t.postCount DESC")
    Page<Object[]> getTagStatisticsByPostCountRange(@Param("minPostCount") Long minPostCount, 
                                                    @Param("maxPostCount") Long maxPostCount, 
                                                    Pageable pageable);

    /**
     * 태그별 게시글 수 통계 조회 (날짜 범위)
     * 성능: 날짜 인덱스 활용
     */
    @Query("SELECT t.name as tagName, t.postCount, t.createdAt " +
           "FROM Tag t " +
           "WHERE t.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY t.postCount DESC")
    List<Object[]> getTagStatisticsByDateRange(@Param("startDate") LocalDateTime startDate, 
                                              @Param("endDate") LocalDateTime endDate);

    /**
     * 태그별 게시글 수 통계 조회 (날짜 범위, 페이징)
     * 성능: 날짜 인덱스 활용
     */
    @Query("SELECT t.name as tagName, t.postCount, t.createdAt " +
           "FROM Tag t " +
           "WHERE t.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY t.postCount DESC")
    Page<Object[]> getTagStatisticsByDateRange(@Param("startDate") LocalDateTime startDate, 
                                              @Param("endDate") LocalDateTime endDate, 
                                              Pageable pageable);

    /**
     * 태그별 게시글 수 통계 조회 (게시글 수 + 날짜 범위)
     * 성능: 복합 조건 최적화
     */
    @Query("SELECT t.name as tagName, t.postCount, t.createdAt " +
           "FROM Tag t " +
           "WHERE t.postCount >= :minPostCount " +
           "AND t.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY t.postCount DESC")
    List<Object[]> getTagStatisticsByPostCountAndDateRange(@Param("minPostCount") Long minPostCount, 
                                                          @Param("startDate") LocalDateTime startDate, 
                                                          @Param("endDate") LocalDateTime endDate);

    /**
     * 태그별 게시글 수 통계 조회 (게시글 수 + 날짜 범위, 페이징)
     * 성능: 복합 조건 최적화
     */
    @Query("SELECT t.name as tagName, t.postCount, t.createdAt " +
           "FROM Tag t " +
           "WHERE t.postCount >= :minPostCount " +
           "AND t.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY t.postCount DESC")
    Page<Object[]> getTagStatisticsByPostCountAndDateRange(@Param("minPostCount") Long minPostCount, 
                                                          @Param("startDate") LocalDateTime startDate, 
                                                          @Param("endDate") LocalDateTime endDate, 
                                                          Pageable pageable);

    /**
     * 태그별 게시글 수 통계 조회 (인기도별)
     * 성능: CASE 문 최적화
     */
    @Query("SELECT " +
           "CASE " +
           "  WHEN t.postCount > 100 THEN 'HIGH' " +
           "  WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "  ELSE 'LOW' " +
           "END as popularity, " +
           "COUNT(t) as tagCount, " +
           "AVG(t.postCount) as avgPostCount " +
           "FROM Tag t " +
           "GROUP BY " +
           "  CASE " +
           "    WHEN t.postCount > 100 THEN 'HIGH' " +
           "    WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "    ELSE 'LOW' " +
           "  END " +
           "ORDER BY popularity")
    List<Object[]> getTagStatisticsByPopularity();

    /**
     * 태그별 게시글 수 통계 조회 (인기도별, 페이징)
     * 성능: CASE 문 최적화
     */
    @Query("SELECT " +
           "CASE " +
           "  WHEN t.postCount > 100 THEN 'HIGH' " +
           "  WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "  ELSE 'LOW' " +
           "END as popularity, " +
           "COUNT(t) as tagCount, " +
           "AVG(t.postCount) as avgPostCount " +
           "FROM Tag t " +
           "GROUP BY " +
           "  CASE " +
           "    WHEN t.postCount > 100 THEN 'HIGH' " +
           "    WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "    ELSE 'LOW' " +
           "  END " +
           "ORDER BY popularity")
    Page<Object[]> getTagStatisticsByPopularity(Pageable pageable);

    /**
     * 태그별 게시글 수 통계 조회 (인기도별, 최소 게시글 수 기준)
     * 성능: 복합 조건 최적화
     */
    @Query("SELECT " +
           "CASE " +
           "  WHEN t.postCount > 100 THEN 'HIGH' " +
           "  WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "  ELSE 'LOW' " +
           "END as popularity, " +
           "COUNT(t) as tagCount, " +
           "AVG(t.postCount) as avgPostCount " +
           "FROM Tag t " +
           "WHERE t.postCount >= :minPostCount " +
           "GROUP BY " +
           "  CASE " +
           "    WHEN t.postCount > 100 THEN 'HIGH' " +
           "    WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "    ELSE 'LOW' " +
           "  END " +
           "ORDER BY popularity")
    List<Object[]> getTagStatisticsByPopularityAndMinPostCount(@Param("minPostCount") Long minPostCount);

    /**
     * 태그별 게시글 수 통계 조회 (인기도별, 최소 게시글 수 기준, 페이징)
     * 성능: 복합 조건 최적화
     */
    @Query("SELECT " +
           "CASE " +
           "  WHEN t.postCount > 100 THEN 'HIGH' " +
           "  WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "  ELSE 'LOW' " +
           "END as popularity, " +
           "COUNT(t) as tagCount, " +
           "AVG(t.postCount) as avgPostCount " +
           "FROM Tag t " +
           "WHERE t.postCount >= :minPostCount " +
           "GROUP BY " +
           "  CASE " +
           "    WHEN t.postCount > 100 THEN 'HIGH' " +
           "    WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "    ELSE 'LOW' " +
           "  END " +
           "ORDER BY popularity")
    Page<Object[]> getTagStatisticsByPopularityAndMinPostCount(@Param("minPostCount") Long minPostCount, Pageable pageable);

    /**
     * 태그별 게시글 수 통계 조회 (인기도별, 날짜 범위)
     * 성능: 복합 조건 최적화
     */
    @Query("SELECT " +
           "CASE " +
           "  WHEN t.postCount > 100 THEN 'HIGH' " +
           "  WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "  ELSE 'LOW' " +
           "END as popularity, " +
           "COUNT(t) as tagCount, " +
           "AVG(t.postCount) as avgPostCount " +
           "FROM Tag t " +
           "WHERE t.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY " +
           "  CASE " +
           "    WHEN t.postCount > 100 THEN 'HIGH' " +
           "    WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "    ELSE 'LOW' " +
           "  END " +
           "ORDER BY popularity")
    List<Object[]> getTagStatisticsByPopularityAndDateRange(@Param("startDate") LocalDateTime startDate, 
                                                           @Param("endDate") LocalDateTime endDate);

    /**
     * 태그별 게시글 수 통계 조회 (인기도별, 날짜 범위, 페이징)
     * 성능: 복합 조건 최적화
     */
    @Query("SELECT " +
           "CASE " +
           "  WHEN t.postCount > 100 THEN 'HIGH' " +
           "  WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "  ELSE 'LOW' " +
           "END as popularity, " +
           "COUNT(t) as tagCount, " +
           "AVG(t.postCount) as avgPostCount " +
           "FROM Tag t " +
           "WHERE t.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY " +
           "  CASE " +
           "    WHEN t.postCount > 100 THEN 'HIGH' " +
           "    WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "    ELSE 'LOW' " +
           "  END " +
           "ORDER BY popularity")
    Page<Object[]> getTagStatisticsByPopularityAndDateRange(@Param("startDate") LocalDateTime startDate, 
                                                           @Param("endDate") LocalDateTime endDate, 
                                                           Pageable pageable);

    /**
     * 태그별 게시글 수 통계 조회 (인기도별, 게시글 수 + 날짜 범위)
     * 성능: 복합 조건 최적화
     */
    @Query("SELECT " +
           "CASE " +
           "  WHEN t.postCount > 100 THEN 'HIGH' " +
           "  WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "  ELSE 'LOW' " +
           "END as popularity, " +
           "COUNT(t) as tagCount, " +
           "AVG(t.postCount) as avgPostCount " +
           "FROM Tag t " +
           "WHERE t.postCount >= :minPostCount " +
           "AND t.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY " +
           "  CASE " +
           "    WHEN t.postCount > 100 THEN 'HIGH' " +
           "    WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "    ELSE 'LOW' " +
           "  END " +
           "ORDER BY popularity")
    List<Object[]> getTagStatisticsByPopularityAndPostCountAndDateRange(@Param("minPostCount") Long minPostCount, 
                                                                       @Param("startDate") LocalDateTime startDate, 
                                                                       @Param("endDate") LocalDateTime endDate);

    /**
     * 태그별 게시글 수 통계 조회 (인기도별, 게시글 수 + 날짜 범위, 페이징)
     * 성능: 복합 조건 최적화
     */
    @Query("SELECT " +
           "CASE " +
           "  WHEN t.postCount > 100 THEN 'HIGH' " +
           "  WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "  ELSE 'LOW' " +
           "END as popularity, " +
           "COUNT(t) as tagCount, " +
           "AVG(t.postCount) as avgPostCount " +
           "FROM Tag t " +
           "WHERE t.postCount >= :minPostCount " +
           "AND t.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY " +
           "  CASE " +
           "    WHEN t.postCount > 100 THEN 'HIGH' " +
           "    WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "    ELSE 'LOW' " +
           "  END " +
           "ORDER BY popularity")
    Page<Object[]> getTagStatisticsByPopularityAndPostCountAndDateRange(@Param("minPostCount") Long minPostCount, 
                                                                       @Param("startDate") LocalDateTime startDate, 
                                                                       @Param("endDate") LocalDateTime endDate, 
                                                                       Pageable pageable);

    /**
     * 태그별 게시글 수 통계 조회 (인기도별, 게시글 수 + 날짜 범위, 최대 게시글 수 기준)
     * 성능: 복합 조건 최적화
     */
    @Query("SELECT " +
           "CASE " +
           "  WHEN t.postCount > 100 THEN 'HIGH' " +
           "  WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "  ELSE 'LOW' " +
           "END as popularity, " +
           "COUNT(t) as tagCount, " +
           "AVG(t.postCount) as avgPostCount " +
           "FROM Tag t " +
           "WHERE t.postCount BETWEEN :minPostCount AND :maxPostCount " +
           "AND t.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY " +
           "  CASE " +
           "    WHEN t.postCount > 100 THEN 'HIGH' " +
           "    WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "    ELSE 'LOW' " +
           "  END " +
           "ORDER BY popularity")
    List<Object[]> getTagStatisticsByPopularityAndPostCountRangeAndDateRange(@Param("minPostCount") Long minPostCount, 
                                                                           @Param("maxPostCount") Long maxPostCount, 
                                                                           @Param("startDate") LocalDateTime startDate, 
                                                                           @Param("endDate") LocalDateTime endDate);

    /**
     * 태그별 게시글 수 통계 조회 (인기도별, 게시글 수 + 날짜 범위, 최대 게시글 수 기준, 페이징)
     * 성능: 복합 조건 최적화
     */
    @Query("SELECT " +
           "CASE " +
           "  WHEN t.postCount > 100 THEN 'HIGH' " +
           "  WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "  ELSE 'LOW' " +
           "END as popularity, " +
           "COUNT(t) as tagCount, " +
           "AVG(t.postCount) as avgPostCount " +
           "FROM Tag t " +
           "WHERE t.postCount BETWEEN :minPostCount AND :maxPostCount " +
           "AND t.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY " +
           "  CASE " +
           "    WHEN t.postCount > 100 THEN 'HIGH' " +
           "    WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "    ELSE 'LOW' " +
           "  END " +
           "ORDER BY popularity")
    Page<Object[]> getTagStatisticsByPopularityAndPostCountRangeAndDateRange(@Param("minPostCount") Long minPostCount, 
                                                                           @Param("maxPostCount") Long maxPostCount, 
                                                                           @Param("startDate") LocalDateTime startDate, 
                                                                           @Param("endDate") LocalDateTime endDate, 
                                                                           Pageable pageable);



    /**
     * 태그별 게시글 수 통계 조회 (인기도별, 게시글 수 + 날짜 범위, 최대 게시글 수 기준, 검색어, 페이징)
     * 성능: 복합 조건 최적화
     */
    @Query("SELECT " +
           "CASE " +
           "  WHEN t.postCount > 100 THEN 'HIGH' " +
           "  WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "  ELSE 'LOW' " +
           "END as popularity, " +
           "COUNT(t) as tagCount, " +
           "AVG(t.postCount) as avgPostCount " +
           "FROM Tag t " +
           "WHERE t.postCount BETWEEN :minPostCount AND :maxPostCount " +
           "AND t.createdAt BETWEEN :startDate AND :endDate " +
           "AND t.name ILIKE %:searchTerm% " +
           "GROUP BY " +
           "  CASE " +
           "    WHEN t.postCount > 100 THEN 'HIGH' " +
           "    WHEN t.postCount > 50 THEN 'MEDIUM' " +
           "    ELSE 'LOW' " +
           "  END " +
           "ORDER BY popularity")
    Page<Object[]> getTagStatisticsByPopularityAndPostCountRangeAndDateRangeAndSearchTerm(@Param("minPostCount") Long minPostCount, 
                                                                                         @Param("maxPostCount") Long maxPostCount, 
                                                                                         @Param("startDate") LocalDateTime startDate, 
                                                                                         @Param("endDate") LocalDateTime endDate, 
                                                                                         @Param("searchTerm") String searchTerm, 
                                                                                         Pageable pageable);



}
