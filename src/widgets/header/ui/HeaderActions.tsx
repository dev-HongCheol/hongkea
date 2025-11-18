"use client";

import { AUTH_ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui";
import { Heart, Search, ShoppingCart, User } from "lucide-react";

/**
 * Client component for header interactive buttons
 * Handles user interactions like search and authentication
 */
const HeaderActions = () => {
  /**
   * Handle search button click
   */
  const handleSearchClick = () => {
    // TODO: 검색 모달 또는 검색 페이지로 이동
    console.log("Search clicked");
  };

  /**
   * Handle user menu button click
   */
  const handleUserClick = () => {
    // TODO: 로그인 체크 후 사용자 메뉴 또는 로그인 페이지로 이동
    window.location.href = AUTH_ROUTES.LOGIN.url;
  };

  return (
    <div className="flex gap-2">
      {/* TODO: 로그인 체크 구현 필요 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleUserClick}
        title="마이페이지"
      >
        <User className="size-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSearchClick}
        title="검색"
      >
        <Search className="size-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSearchClick}
        title="위시리스트"
      >
        <Heart className="size-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSearchClick}
        title="장바구니"
      >
        <ShoppingCart className="size-6" />
      </Button>
    </div>
  );
};

export default HeaderActions;
