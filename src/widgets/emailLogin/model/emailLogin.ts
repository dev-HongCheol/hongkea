/**
 * Email login business logic and hooks
 * FSD-compliant model layer with React Query integration
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, loginWithEmailPassword, logout } from "../api/authApi";

// Query Keys
export const AUTH_QUERY_KEYS = {
  currentUser: ["auth", "currentUser"] as const,
  user: (id: string) => ["user", id] as const,
} as const;

/**
 * 이메일 로그인을 위한 React Query Mutation Hook
 * 로딩 상태, 에러 관리, 캐싱 등을 포함
 */
export const useEmailLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginWithEmailPassword,
    onSuccess: (data) => {
      // 로그인 성공 시 사용자 정보를 캐시에 저장
      queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, data.user);
      queryClient.setQueryData(AUTH_QUERY_KEYS.user(data.user.id), data.user);

      // 기타 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    onError: (error) => {
      console.error("로그인 실패:", error);
    },
    retry: 1, // 실패 시 1번 재시도
    retryDelay: 1000, // 1초 대기 후 재시도
  });
};

/**
 * 현재 사용자 정보 조회를 위한 React Query Hook
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.currentUser,
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    retry: false, // 인증 실패 시 재시도하지 않음
  });
};

/**
 * 로그아웃을 위한 React Query Mutation Hook
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // 모든 인증 관련 캐시 클리어
      queryClient.removeQueries({ queryKey: ["auth"] });
      queryClient.removeQueries({ queryKey: ["user"] });

      // 전체 캐시 무효화 (필요에 따라)
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error("로그아웃 실패:", error);
    },
  });
};
