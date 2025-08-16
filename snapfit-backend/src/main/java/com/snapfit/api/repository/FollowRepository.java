package com.snapfit.api.repository;

import com.snapfit.api.entity.Follow;
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
 * 팔로우 리포지토리 인터페이스
 * 보안과 성능을 고려한 커스텀 쿼리 메서드
 * 
 * @author Snapfit Team
 * @version 1.0
 */
@Repository
public interface FollowRepository extends JpaRepository<Follow, Follow.FollowId> {

    /**
     * 팔로워별 팔로우 목록 조회 (페이징)
     * 성능: 복합 인덱스 활용
     */
    @Query("SELECT f FROM Follow f WHERE f.follower.userIdx = :followerId ORDER BY f.createdAt DESC")
    Page<Follow> findByFollowerIdOrderByCreatedAtDesc(@Param("followerId") UUID followerId, Pageable pageable);

    /**
     * 팔로이별 팔로워 목록 조회 (페이징)
     * 성능: 복합 인덱스 활용
     */
    @Query("SELECT f FROM Follow f WHERE f.followee.userIdx = :followeeId ORDER BY f.createdAt DESC")
    Page<Follow> findByFolloweeIdOrderByCreatedAtDesc(@Param("followeeId") UUID followeeId, Pageable pageable);

    /**
     * 팔로워 수 조회
     * 성능: COUNT 쿼리 최적화
     */
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.followee.userIdx = :followeeId")
    long countFollowersByFolloweeId(@Param("followeeId") UUID followeeId);

    /**
     * 팔로잉 수 조회
     * 성능: COUNT 쿼리 최적화
     */
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.follower.userIdx = :followerId")
    long countFollowingByFollowerId(@Param("followerId") UUID followerId);

    /**
     * 특정 사용자 간 팔로우 관계 확인
     * 성능: 복합 기본키 활용
     */
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Follow f WHERE f.follower.userIdx = :followerId AND f.followee.userIdx = :followeeId")
    boolean existsByFollowerIdAndFolloweeId(@Param("followerId") UUID followerId, @Param("followeeId") UUID followeeId);

    /**
     * 팔로우 관계 조회
     * 성능: 복합 기본키 활용
     */
    @Query("SELECT f FROM Follow f WHERE f.follower.userIdx = :followerId AND f.followee.userIdx = :followeeId")
    Optional<Follow> findByFollowerIdAndFolloweeId(@Param("followerId") UUID followerId, @Param("followeeId") UUID followeeId);

    /**
     * 사용자별 팔로잉한 사용자 ID 목록 조회
     * 성능: SELECT 최적화
     */
    @Query("SELECT f.followee.userIdx FROM Follow f WHERE f.follower.userIdx = :followerId ORDER BY f.createdAt DESC")
    List<UUID> findFolloweeIdsByFollowerIdOrderByCreatedAtDesc(@Param("followerId") UUID followerId);

    /**
     * 사용자별 팔로워 ID 목록 조회
     * 성능: SELECT 최적화
     */
    @Query("SELECT f.follower.userIdx FROM Follow f WHERE f.followee.userIdx = :followeeId ORDER BY f.createdAt DESC")
    List<UUID> findFollowerIdsByFolloweeIdOrderByCreatedAtDesc(@Param("followeeId") UUID followeeId);

    /**
     * 사용자별 팔로잉한 사용자 ID 목록 조회 (페이징)
     * 성능: 페이징 최적화
     */
    @Query("SELECT f.followee.userIdx FROM Follow f WHERE f.follower.userIdx = :followerId ORDER BY f.createdAt DESC")
    Page<UUID> findFolloweeIdsByFollowerIdOrderByCreatedAtDesc(@Param("followerId") UUID followerId, Pageable pageable);

    /**
     * 사용자별 팔로워 ID 목록 조회 (페이징)
     * 성능: 페이징 최적화
     */
    @Query("SELECT f.follower.userIdx FROM Follow f WHERE f.followee.userIdx = :followeeId ORDER BY f.createdAt DESC")
    Page<UUID> findFollowerIdsByFolloweeIdOrderByCreatedAtDesc(@Param("followeeId") UUID followeeId, Pageable pageable);

    /**
     * 사용자별 팔로우 통계 조회
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT COUNT(f) as totalFollows, " +
           "COUNT(DISTINCT f.followee.userIdx) as uniqueFollowees " +
           "FROM Follow f " +
           "WHERE f.follower.userIdx = :followerId")
    Object[] getFollowStatisticsByFollowerId(@Param("followerId") UUID followerId);

    /**
     * 사용자별 팔로워 통계 조회
     * 성능: 집계 쿼리 최적화
     */
    @Query("SELECT COUNT(f) as totalFollowers, " +
           "COUNT(DISTINCT f.follower.userIdx) as uniqueFollowers " +
           "FROM Follow f " +
           "WHERE f.followee.userIdx = :followeeId")
    Object[] getFollowerStatisticsByFolloweeId(@Param("followeeId") UUID followeeId);

    /**
     * 사용자별 팔로우 트렌드 조회 (최근 N일)
     * 성능: 시간 기반 집계
     */
    @Query("SELECT DATE(f.createdAt) as followDate, COUNT(f) as followCount " +
           "FROM Follow f " +
           "WHERE f.follower.userIdx = :followerId AND f.createdAt >= :startDate " +
           "GROUP BY DATE(f.createdAt) " +
           "ORDER BY followDate DESC")
    List<Object[]> getFollowTrendByFollowerId(@Param("followerId") UUID followerId, @Param("startDate") java.time.LocalDate startDate);

    /**
     * 사용자별 팔로워 트렌드 조회 (최근 N일)
     * 성능: 시간 기반 집계
     */
    @Query("SELECT DATE(f.createdAt) as followerDate, COUNT(f) as followerCount " +
           "FROM Follow f " +
           "WHERE f.followee.userIdx = :followeeId AND f.createdAt >= :startDate " +
           "GROUP BY DATE(f.createdAt) " +
           "ORDER BY followerDate DESC")
    List<Object[]> getFollowerTrendByFolloweeId(@Param("followeeId") UUID followeeId, @Param("startDate") java.time.LocalDate startDate);

    /**
     * 상호 팔로우 관계 조회 (친구 관계)
     * 성능: JOIN 최적화
     */
    @Query("SELECT f1.followee.userIdx as userId FROM Follow f1 " +
           "WHERE f1.follower.userIdx = :userId " +
           "AND EXISTS (" +
           "  SELECT 1 FROM Follow f2 " +
           "  WHERE f2.follower.userIdx = f1.followee.userIdx " +
           "  AND f2.followee.userIdx = :userId" +
           ")")
    List<UUID> findMutualFollowsByUserId(@Param("userId") UUID userId);

    /**
     * 상호 팔로우 관계 조회 (페이징)
     * 성능: JOIN 최적화
     */
    @Query("SELECT f1.followee.userIdx as userId FROM Follow f1 " +
           "WHERE f1.follower.userIdx = :userId " +
           "AND EXISTS (" +
           "  SELECT 1 FROM Follow f2 " +
           "  WHERE f2.follower.userIdx = f1.followee.userIdx " +
           "  AND f2.followee.userIdx = :userId" +
           ")")
    Page<UUID> findMutualFollowsByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * 사용자별 팔로우 추천 (공통 팔로우 기반)
     * 성능: JOIN 최적화
     */
    @Query("SELECT f.followee.userIdx as userId, COUNT(common) as commonFollows " +
           "FROM Follow f " +
           "JOIN Follow common ON common.follower.userIdx = f.followee.userIdx " +
           "WHERE f.follower.userIdx = :userId " +
           "AND common.followee.userIdx IN (" +
           "  SELECT f2.followee.userIdx FROM Follow f2 WHERE f2.follower.userIdx = :userId" +
           ") " +
           "AND f.followee.userIdx != :userId " +
           "AND f.followee.userIdx NOT IN (" +
           "  SELECT f3.followee.userIdx FROM Follow f3 WHERE f3.follower.userIdx = :userId" +
           ") " +
           "GROUP BY f.followee.userIdx " +
           "ORDER BY commonFollows DESC")
    List<Object[]> findFollowRecommendationsByCommonFollows(@Param("userId") UUID userId);

    /**
     * 사용자별 팔로우 추천 (페이징)
     * 성능: JOIN 최적화
     */
    @Query("SELECT f.followee.userIdx as userId, COUNT(common) as commonFollows " +
           "FROM Follow f " +
           "JOIN Follow common ON common.follower.userIdx = f.followee.userIdx " +
           "WHERE f.follower.userIdx = :userId " +
           "AND common.followee.userIdx IN (" +
           "  SELECT f2.followee.userIdx FROM Follow f2 WHERE f2.follower.userIdx = :userId" +
           ") " +
           "AND f.followee.userIdx != :userId " +
           "AND f.followee.userIdx NOT IN (" +
           "  SELECT f3.followee.userIdx FROM Follow f3 WHERE f3.follower.userIdx = :userId" +
           ") " +
           "GROUP BY f.followee.userIdx " +
           "ORDER BY commonFollows DESC")
    Page<Object[]> findFollowRecommendationsByCommonFollows(@Param("userId") UUID userId, Pageable pageable);

    /**
     * 사용자별 팔로우한 사용자 상세 정보 조회 (JOIN)
     * 성능: JOIN 최적화
     */
    @Query("SELECT f, u FROM Follow f " +
           "JOIN f.followee u " +
           "WHERE f.follower.userIdx = :followerId " +
           "ORDER BY f.createdAt DESC")
    Page<Object[]> findFollowsWithUsersByFollowerId(@Param("followerId") UUID followerId, Pageable pageable);

    /**
     * 사용자별 팔로워 상세 정보 조회 (JOIN)
     * 성능: JOIN 최적화
     */
    @Query("SELECT f, u FROM Follow f " +
           "JOIN f.follower u " +
           "WHERE f.followee.userIdx = :followeeId " +
           "ORDER BY f.createdAt DESC")
    Page<Object[]> findFollowersWithUsersByFolloweeId(@Param("followeeId") UUID followeeId, Pageable pageable);

    /**
     * 사용자별 팔로우한 사용자 검색 (닉네임 기반)
     * 성능: 검색 인덱스 활용
     */
    @Query("SELECT f FROM Follow f " +
           "JOIN f.followee u " +
           "WHERE f.follower.userIdx = :followerId " +
           "AND u.nickname ILIKE %:searchTerm% " +
           "ORDER BY f.createdAt DESC")
    Page<Follow> searchFollowsByNickname(@Param("followerId") UUID followerId, 
                                        @Param("searchTerm") String searchTerm, 
                                        Pageable pageable);

    /**
     * 사용자별 팔로워 검색 (닉네임 기반)
     * 성능: 검색 인덱스 활용
     */
    @Query("SELECT f FROM Follow f " +
           "JOIN f.follower u " +
           "WHERE f.followee.userIdx = :followeeId " +
           "AND u.nickname ILIKE %:searchTerm% " +
           "ORDER BY f.createdAt DESC")
    Page<Follow> searchFollowersByNickname(@Param("followeeId") UUID followeeId, 
                                          @Param("searchTerm") String searchTerm, 
                                          Pageable pageable);

    /**
     * 사용자별 팔로우한 사용자 필터링 (날짜 범위)
     * 성능: 날짜 인덱스 활용
     */
    @Query("SELECT f FROM Follow f " +
           "WHERE f.follower.userIdx = :followerId " +
           "AND f.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY f.createdAt DESC")
    Page<Follow> findFollowsByDateRange(@Param("followerId") UUID followerId, 
                                       @Param("startDate") java.time.LocalDateTime startDate, 
                                       @Param("endDate") java.time.LocalDateTime endDate, 
                                       Pageable pageable);

    /**
     * 사용자별 팔로워 필터링 (날짜 범위)
     * 성능: 날짜 인덱스 활용
     */
    @Query("SELECT f FROM Follow f " +
           "WHERE f.followee.userIdx = :followeeId " +
           "AND f.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY f.createdAt DESC")
    Page<Follow> findFollowersByDateRange(@Param("followeeId") UUID followeeId, 
                                         @Param("startDate") java.time.LocalDateTime startDate, 
                                         @Param("endDate") java.time.LocalDateTime endDate, 
                                         Pageable pageable);

    /**
     * 사용자별 팔로우한 사용자 정렬 (팔로워 수 기준)
     * 성능: JOIN 최적화
     */
    @Query("SELECT f FROM Follow f " +
           "JOIN f.followee u " +
           "WHERE f.follower.userIdx = :followerId " +
           "ORDER BY (" +
           "  SELECT COUNT(f2) FROM Follow f2 WHERE f2.followee.userIdx = u.userIdx" +
           ") DESC, f.createdAt DESC")
    Page<Follow> findFollowsOrderByFollowerCount(@Param("followerId") UUID followerId, Pageable pageable);

    /**
     * 사용자별 팔로워 정렬 (팔로잉 수 기준)
     * 성능: JOIN 최적화
     */
    @Query("SELECT f FROM Follow f " +
           "JOIN f.follower u " +
           "WHERE f.followee.userIdx = :followeeId " +
           "ORDER BY (" +
           "  SELECT COUNT(f2) FROM Follow f2 WHERE f2.follower.userIdx = u.userIdx" +
           ") DESC, f.createdAt DESC")
    Page<Follow> findFollowersOrderByFollowingCount(@Param("followeeId") UUID followeeId, Pageable pageable);

    /**
     * 사용자별 팔로우한 사용자 정렬 (게시글 수 기준)
     * 성능: JOIN 최적화
     */
    @Query("SELECT f FROM Follow f " +
           "JOIN f.followee u " +
           "WHERE f.follower.userIdx = :followerId " +
           "ORDER BY (" +
           "  SELECT COUNT(p) FROM Post p WHERE p.author.userIdx = u.userIdx AND p.isDeleted = false" +
           ") DESC, f.createdAt DESC")
    Page<Follow> findFollowsOrderByPostCount(@Param("followerId") UUID followerId, Pageable pageable);

    /**
     * 사용자별 팔로워 정렬 (게시글 수 기준)
     * 성능: JOIN 최적화
     */
    @Query("SELECT f FROM Follow f " +
           "JOIN f.follower u " +
           "WHERE f.followee.userIdx = :followeeId " +
           "ORDER BY (" +
           "  SELECT COUNT(p) FROM Post p WHERE p.author.userIdx = u.userIdx AND p.isDeleted = false" +
           ") DESC, f.createdAt DESC")
    Page<Follow> findFollowersOrderByPostCount(@Param("followeeId") UUID followeeId, Pageable pageable);
}
