"use client";

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { ReactNode, useState } from "react";

/**
 * QueryClient 생성 함수 - Next.js 16 App Router 최적화
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 5분간 fresh 상태 유지
        staleTime: 5 * 60 * 1000,
        // 브라우저 포커스 시 자동 refetch 비활성화 (성능 향상)
        refetchOnWindowFocus: false,
        // 재연결 시 refetch 활성화 (네트워크 복구 시)
        refetchOnReconnect: true,
        // 에러 발생 시 3번까지 재시도
        retry: 3,
        // 재시도 간격 (지수 백오프)
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Suspense 지원
        throwOnError: false,
      },
      mutations: {
        // 뮤테이션 실패 시 1번 재시도
        retry: 1,
        // 에러 발생 시 전역 에러 핸들러로 전파
        throwOnError: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // 서버에서는 항상 새 인스턴스 생성
    return makeQueryClient();
  } else {
    // 브라우저에서는 싱글톤 패턴
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * React Query Provider for Next.js 16 App Router
 * - Streaming hydration 지원
 * - Server/Client hydration mismatch 방지
 * - DevTools 개발 환경에서만 활성화
 */
const QueryProvider = ({ children }: { children: ReactNode }) => {
  // useState를 사용하여 hydration mismatch 방지
  const [queryClient] = useState(() => getQueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>{children}</ReactQueryStreamedHydration>
      {/* DevTools는 개발 환경에서만 렌더링 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  );
};

export default QueryProvider;
