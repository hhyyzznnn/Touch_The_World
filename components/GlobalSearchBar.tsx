"use client";

import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useEffect, useRef } from "react";

interface SearchHistory {
  query: string;
  timestamp: number;
}

interface PopularSearch {
  query: string;
  count: number;
}

export function GlobalSearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 검색 기록 및 인기 검색어 불러오기
  useEffect(() => {
    const history = localStorage.getItem("searchHistory");
    if (history) {
      try {
        const parsed = JSON.parse(history);
        setSearchHistory(parsed.slice(0, 5)); // 최근 5개만 표시
      } catch (error) {
        console.error("검색 기록 불러오기 실패:", error);
      }
    }

    const popular = localStorage.getItem("popularSearches");
    if (popular) {
      try {
        const parsed = JSON.parse(popular);
        setPopularSearches(parsed.slice(0, 5)); // 상위 5개만 표시
      } catch (error) {
        console.error("인기 검색어 불러오기 실패:", error);
      }
    }
  }, []);

  // 검색어 입력 시 자동완성 제안 생성
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const historyQueries = searchHistory
        .map((h) => h.query)
        .filter((q) => q.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 3);
      
      const popularQueries = popularSearches
        .map((p) => p.query)
        .filter((q) => q.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 2);

      setSuggestions([...new Set([...historyQueries, ...popularQueries])]);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, searchHistory, popularSearches]);

  // 외부 클릭 시 제안 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveSearchHistory = (query: string) => {
    const history = localStorage.getItem("searchHistory");
    const parsed: SearchHistory[] = history ? JSON.parse(history) : [];
    
    // 중복 제거 및 최신순 정렬
    const updated = [
      { query, timestamp: Date.now() },
      ...parsed.filter((h) => h.query !== query),
    ].slice(0, 20); // 최대 20개만 저장

    localStorage.setItem("searchHistory", JSON.stringify(updated));
    setSearchHistory(updated.slice(0, 5));
  };

  const updatePopularSearches = (query: string) => {
    const popular = localStorage.getItem("popularSearches");
    const parsed: PopularSearch[] = popular ? JSON.parse(popular) : [];
    
    const existing = parsed.find((p) => p.query === query);
    if (existing) {
      existing.count += 1;
    } else {
      parsed.push({ query, count: 1 });
    }

    // 검색 횟수순 정렬
    const sorted = parsed.sort((a, b) => b.count - a.count).slice(0, 10);
    localStorage.setItem("popularSearches", JSON.stringify(sorted));
    setPopularSearches(sorted.slice(0, 5));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      saveSearchHistory(trimmedQuery);
      updatePopularSearches(trimmedQuery);
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    saveSearchHistory(suggestion);
    updatePopularSearches(suggestion);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const handleClear = () => {
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const clearHistory = () => {
    localStorage.removeItem("searchHistory");
    setSearchHistory([]);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-gray" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (searchHistory.length > 0 || popularSearches.length > 0 || suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder="상품, 진행 내역, 학교 검색..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-text-dark text-sm"
            aria-label="검색어 입력"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-gray hover:text-text-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green-primary rounded"
              aria-label="검색어 지우기"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* 검색 제안 패널 */}
      {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0 || popularSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* 자동완성 제안 */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                제안
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm text-text-dark hover:bg-gray-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green-primary"
                >
                  <Search className="inline-block w-4 h-4 mr-2 text-text-gray" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* 최근 검색어 */}
          {searchHistory.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  최근 검색
                </div>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs text-text-gray hover:text-text-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green-primary rounded px-2 py-1"
                  aria-label="검색 기록 모두 삭제"
                >
                  모두 삭제
                </button>
              </div>
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(item.query)}
                  className="w-full text-left px-3 py-2 text-sm text-text-dark hover:bg-gray-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green-primary flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-text-gray" />
                    {item.query}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* 인기 검색어 */}
          {popularSearches.length > 0 && searchQuery.trim().length === 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                인기 검색어
              </div>
              {popularSearches.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(item.query)}
                  className="w-full text-left px-3 py-2 text-sm text-text-dark hover:bg-gray-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green-primary flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-brand-green-primary">
                      {index + 1}
                    </span>
                    {item.query}
                  </span>
                  <span className="text-xs text-text-gray">{item.count}회</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


