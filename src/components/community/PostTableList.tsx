'use client'

import React, { useMemo, useCallback } from 'react'
import { PostActionMenu } from '@/components/ui/PostActionMenu'

interface PostTableItem {
  postId: number
  title?: string | null
  content?: string | null
  authorName?: string | null
  anonymousIndex?: number | null
  createdAt?: string | null
  viewCount?: number | null
  recommendCount?: number | null
  order?: number | null
  thumbnailUrl?: string | null
  categoryLabel?: string | null
}

interface PostTableListProps {
  posts: PostTableItem[]
  onSelect?: (postId: number) => void
  onEdit?: (postId: number) => void
  onDelete?: (postId: number) => void
  currentUserId?: number
  postAuthors?: Record<number, number> // postId -> authorId 매핑
}

/**
 * formatPostDate 함수는 ISO 문자열을 한국 사용자에게 익숙한 형식으로 변환합니다.
 * @param isoString 변환 대상이 되는 날짜 문자열입니다. 서버에서 내려오는 ISO8601 포맷을 기대합니다.
 * @returns 사용자가 읽기 쉬운 'YYYY.MM.DD HH:mm' 형태의 문자열을 반환합니다.
 * 변환이 실패하는 경우에는 안전하게 '-' 문자를 반환해 UI가 깨지지 않도록 합니다.
 */
const formatPostDate = (isoString?: string | null): string => {
  if (!isoString) {
    return '-'
  }

  try {
    const dateInstance = new Date(isoString)
    if (Number.isNaN(dateInstance.getTime())) {
      return '-'
    }

    const now = new Date()
    const isSameDay =
      dateInstance.getFullYear() === now.getFullYear() &&
      dateInstance.getMonth() === now.getMonth() &&
      dateInstance.getDate() === now.getDate()

    if (isSameDay) {
      const hours = `${dateInstance.getHours()}`.padStart(2, '0')
      const minutes = `${dateInstance.getMinutes()}`.padStart(2, '0')
    return `${hours}:${minutes}`
    }

    const year = dateInstance.getFullYear()
    const month = `${dateInstance.getMonth() + 1}`.padStart(2, '0')
    const day = `${dateInstance.getDate()}`.padStart(2, '0')

    return `${year}:${month}:${day}`
  } catch (error) {
    console.error('[community:table] formatPostDate:error', error)
    return '-'
  }
}

/**
 * buildAuthorLabel 함수는 게시글 작성자 표시 텍스트를 생성합니다.
 * @param authorName 로그인 사용자가 작성한 경우 표시할 닉네임 또는 이름입니다.
 * @param anonymousIndex 비회원 또는 익명 작성자의 고유 식별 번호입니다.
 * 함수는 우선순위에 따라 닉네임을 우선으로 사용하고, 없을 경우 익명 식별자를 반환하며, 그마저 없으면 기본 문자열을 제공합니다.
 */
const buildAuthorLabel = (authorName?: string | null, anonymousIndex?: number | null): string => {
  if (authorName && authorName.trim().length > 0) {
    return authorName
  }

  if (typeof anonymousIndex === 'number' && anonymousIndex >= 0) {
    return `익명${anonymousIndex}`
  }

  return '익명'
}

/**
 * PostTableList 컴포넌트는 텍스트 중심 커뮤니티 게시판을 위해 테이블 형태의 UI를 제공합니다.
 * @param posts 화면에 렌더링할 게시글 컬렉션입니다. 번호, 제목, 작성자, 날짜, 조회수, 추천 수를 표시합니다.
 * @param onSelect 사용자가 행을 클릭했을 때 호출되는 콜백입니다. 게시글 상세 페이지로 이동하는 데 활용할 수 있습니다.
 * 컴포넌트는 PC·모바일 환경 모두를 고려하여 반응형 스타일을 적용하며, 가독성을 높이기 위해 행 호버 스타일을 포함합니다.
 */
export function PostTableList({ 
  posts, 
  onSelect, 
  onEdit, 
  onDelete, 
  currentUserId, 
  postAuthors 
}: PostTableListProps) {
  const handleRowSelect = useCallback((postId: number) => {
    if (!onSelect) {
      return
    }
    onSelect(postId)
  }, [onSelect])

  const tableHeader = useMemo(() => {
    const headerElement = (
      <div className="hidden md:grid md:grid-cols-[50px_88px_68px_1fr_120px_112px_68px_68px_60px] md:items-center md:px-3 md:py-1.5 text-[10px] font-medium text-gray-500 uppercase tracking-wide bg-gray-50 border border-gray-200 rounded-t-lg">
        <div>번호</div>
        <div className="text-center">말머리</div>
        <div className="text-center">이미지</div>
        <div>제목</div>
        <div className="text-center">글쓴이</div>
        <div className="text-center">작성일</div>
        <div className="text-center">조회</div>
        <div className="text-center">추천</div>
        <div className="text-center">액션</div>
      </div>
    )

    return headerElement
  }, [])

  const tableRows = useMemo(() => {
    return posts.map((post, index) => {
      const rowIndex = typeof post.order === 'number' ? post.order : index + 1
      const displayAuthor = buildAuthorLabel(post.authorName, post.anonymousIndex)
      const displayDate = formatPostDate(post.createdAt)
      const displayRecommend = post.recommendCount ?? 0
      const displayViews = post.viewCount ?? 0

      const renderCategoryBadge = () => {
        if (post.categoryLabel && post.categoryLabel.trim().length > 0) {
          return (
            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-blue-50 text-[11px] font-medium text-blue-600 border border-blue-100">
              {post.categoryLabel}
            </span>
          )
        }

        return <span className="text-xs text-gray-400">-</span>
      }

      // 게시글 소유자 확인
      const isOwner = currentUserId && postAuthors && postAuthors[post.postId] === currentUserId

      const desktopRow = (
        <div
          key={`${post.postId}-desktop`}
          role="row"
          tabIndex={0}
          className="hidden md:grid md:grid-cols-[50px_88px_68px_1fr_120px_112px_68px_68px_60px] md:items-center md:px-3 md:py-1.5 border-x border-b border-gray-200 bg-white hover:bg-blue-50/60 focus:bg-blue-50/60 transition-colors cursor-pointer"
          data-post-id={post.postId}
          data-list-index={rowIndex - 1}
          onClick={() => handleRowSelect(post.postId)}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleRowSelect(post.postId)
            }
          }}
        >
          <div className="text-xs text-gray-500 text-center">{rowIndex}</div>
          <div className="flex items-center justify-center">{renderCategoryBadge()}</div>
          <div className="flex items-center justify-center">
            {post.thumbnailUrl ? (
              <img
                src={post.thumbnailUrl}
                alt="게시글 썸네일"
                className="w-10 h-10 rounded object-cover border border-gray-200"
                loading="lazy"
              />
            ) : (
              <span className="text-xs text-gray-400">-</span>
            )}
          </div>
          <div className="pr-3 text-sm font-medium text-gray-900 truncate">
            {post.title || post.content || '제목 없음'}
          </div>
          <div className="text-xs text-gray-700 text-center">{displayAuthor}</div>
          <div className="text-xs text-gray-500 text-center">{displayDate}</div>
          <div className="text-xs text-gray-500 text-center">{displayViews.toLocaleString()}</div>
          <div className="text-xs text-gray-500 text-center">{displayRecommend.toLocaleString()}</div>
          <div className="flex items-center justify-center">
            <PostActionMenu
              postId={post.postId}
              isOwner={isOwner || false}
              onEdit={onEdit || (() => {})}
              onDelete={onDelete || (() => {})}
            />
          </div>
        </div>
      )

      const mobileRow = (
        <div
          key={`${post.postId}-mobile`}
          className="grid md:hidden gap-2 border border-gray-200 rounded-lg p-3 bg-white hover:border-blue-200 transition-colors cursor-pointer"
          data-post-id={post.postId}
          data-list-index={rowIndex - 1}
          onClick={() => handleRowSelect(post.postId)}
        >
          <div className="flex items-center gap-2.5">
            {post.thumbnailUrl ? (
              <img
                src={post.thumbnailUrl}
                alt="게시글 썸네일"
                className="w-12 h-12 rounded object-cover border border-gray-200"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-12 rounded border border-dashed border-gray-200 flex items-center justify-center text-[10px] text-gray-400">
                No Img
              </div>
            )}
            <div className="flex-1 min-w-0 flex items-center">
              <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                {post.title || post.content || '제목 없음'}
              </p>
            </div>
            <PostActionMenu
              postId={post.postId}
              isOwner={isOwner || false}
              onEdit={onEdit || (() => {})}
              onDelete={onDelete || (() => {})}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-gray-500">
            {post.categoryLabel && post.categoryLabel.trim().length > 0 ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-medium">
                {post.categoryLabel}
              </span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
            <span className="text-gray-600">{displayAuthor}</span>
            <span>{displayDate}</span>
            <span>조회 {displayViews.toLocaleString()}</span>
            <span>추천 {displayRecommend.toLocaleString()}</span>
          </div>
        </div>
      )

      const tableRow = (
        <React.Fragment key={post.postId}>
          {desktopRow}
          {mobileRow}
        </React.Fragment>
      )

      return tableRow
    })
  }, [handleRowSelect, posts])

  const tableWrapper = (
    <div className="w-full">
      {tableHeader}
      <div role="rowgroup" className="rounded-b-lg overflow-hidden">
        {tableRows}
      </div>
    </div>
  )

  return tableWrapper
}

