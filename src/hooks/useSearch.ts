"use client"
import { useState, useEffect, useCallback, useRef } from 'react';

interface SearchResult {
  type: 'post' | 'user' | 'tag';
  id: string | number;
  title?: string;
  content?: string;
  authorName?: string;
  tagName?: string;
  relevanceScore?: number;
  matchedTerms?: string[];
}

interface SearchResponse {
  results: SearchResult[];
  totalElements: number;
  searchTime: number;
  suggestions?: string[];
}

interface TrendingSearch {
  query: string;
  searchCount: number;
  uniqueSearchers: number;
}

interface SearchSuggestion {
  query: string;
  recentQueries: string[];
  popularQueries: string[];
}

interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
}

interface UseSearchReturn {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  search: (query: string) => void;
  clearResults: () => void;
  getSuggestions: (query: string) => Promise<string[]>;
  getTrendingSearches: () => Promise<TrendingSearch[]>;
  resetError: () => void;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const { debounceMs = 300, minQueryLength = 2 } = options;
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (query: string) => {
    if (query.length < minQueryLength) {
      setResults([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        type: 'all', // post, user, tag 모두 검색
      });

      const response = await fetch(`/api/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `검색 실패: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      console.log('useSearch: 검색 성공', data);

      setResults(data.results);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // 요청이 취소된 경우
      }
      
      const errorMessage = err instanceof Error ? err.message : '검색 중 오류가 발생했습니다';
      console.error('useSearch: 에러 발생', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [minQueryLength]);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
    
    // 디바운싱
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);
  }, [performSearch, debounceMs]);

  const clearResults = useCallback(() => {
    setResults([]);
    setSearchQuery('');
    setError(null);
  }, []);

  const getSuggestions = useCallback(async (query: string): Promise<string[]> => {
    if (query.length < minQueryLength) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        q: query,
        type: 'suggestions',
      });

      const response = await fetch(`/api/search/suggestions?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        return [];
      }

      const data: SearchSuggestion = await response.json();
      return [
        ...data.recentQueries,
        ...data.popularQueries.filter(q => !data.recentQueries.includes(q))
      ].slice(0, 10); // 최대 10개 제안
    } catch (err) {
      console.error('useSearch: 검색 제안 조회 실패', err);
      return [];
    }
  }, [minQueryLength]);

  const getTrendingSearches = useCallback(async (): Promise<TrendingSearch[]> => {
    try {
      const response = await fetch('/api/search/trending', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        return [];
      }

      const data: TrendingSearch[] = await response.json();
      return data.slice(0, 10); // 상위 10개 트렌딩 검색어
    } catch (err) {
      console.error('useSearch: 트렌딩 검색어 조회 실패', err);
      return [];
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // 컴포넌트 언마운트 시 진행 중인 요청 취소 및 타이머 정리
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    results,
    loading,
    error,
    searchQuery,
    search,
    clearResults,
    getSuggestions,
    getTrendingSearches,
    resetError,
  };
}
