# Supabase Client Usage Guide

이 가이드는 프로젝트에서 Supabase 클라이언트를 올바르게 사용하는 방법을 설명합니다.

## 📁 파일 구조

```
src/shared/lib/supabase/
├── client.ts      # 브라우저/클라이언트 컴포넌트용
├── server.ts      # 서버 컴포넌트/API 라우트용  
├── index.ts       # 클라이언트 전용 배럴 파일
└── README.md      # 사용 가이드 (이 파일)
```

## 🎯 사용법

### 1. 클라이언트 컴포넌트에서 사용

```typescript
// ✅ 권장: shared/lib에서 import
import { supabase } from '@/shared/lib'
// 또는
import { createClient } from '@/shared/lib'

// ✅ 직접 import도 가능
import { supabase } from '@/shared/lib/supabase/client'
```

### 2. 서버 컴포넌트에서 사용

```typescript
// ✅ 반드시 직접 import (배럴 파일 사용 금지)
import { createClient } from '@/shared/lib/supabase/server'

// 사용법
export default async function ServerComponent() {
  const supabase = await createClient()
  const { data } = await supabase.from('hk_users').select('*')
  
  return <div>{/* 렌더링 */}</div>
}
```

### 3. API 라우트에서 사용

```typescript
// app/api/users/route.ts
import { createClient } from '@/shared/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from('hk_users').select('*')
  
  return Response.json(data)
}
```

### 4. Server Actions에서 사용

```typescript
// app/actions.ts
'use server'
import { createClient } from '@/shared/lib/supabase/server'

export async function updateUser(formData: FormData) {
  const supabase = await createClient()
  // 업데이트 로직
}
```

### 5. 관리자 권한이 필요한 서버 작업

```typescript
// 반드시 직접 import
import { createAdminClient } from '@/shared/lib/supabase/server'

export async function adminAction() {
  const supabase = createAdminClient() // RLS 우회
  // 관리자 전용 작업
}
```

## ⚠️ 중요한 주의사항

### ❌ 하지 말아야 할 것들

```typescript
// ❌ 서버에서 클라이언트 import 사용 금지
import { supabase } from '@/shared/lib' // 서버에서 금지!

// ❌ 클라이언트에서 서버 import 사용 금지  
import { createClient } from '@/shared/lib/supabase/server' // 클라이언트에서 금지!

// ❌ 배럴 파일에서 서버 함수 re-export 금지
export * from './server' // index.ts에서 금지!
```

### ✅ 올바른 패턴

```typescript
// ✅ 클라이언트 컴포넌트
'use client'
import { supabase } from '@/shared/lib'

// ✅ 서버 컴포넌트  
import { createClient } from '@/shared/lib/supabase/server'

// ✅ 환경별 분기
const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // 서버 환경에서는 동적 import 사용
    return import('@/shared/lib/supabase/server').then(m => m.createClient())
  }
  // 클라이언트 환경
  return import('@/shared/lib/supabase/client').then(m => m.supabase)
}
```

## 🔍 트러블슈팅

### Q: "cookies is not a function" 에러가 발생해요
A: 클라이언트 컴포넌트에서 서버 전용 함수를 import했을 가능성이 높습니다. `@/shared/lib/supabase/server`를 직접 import하지 말고 `@/shared/lib`를 사용하세요.

### Q: Hydration mismatch 에러가 발생해요
A: 서버/클라이언트에서 다른 Supabase 인스턴스를 사용하고 있을 수 있습니다. 위의 사용법을 정확히 따르세요.

### Q: RLS 정책을 우회하고 싶어요
A: `createAdminClient()`를 사용하세요. 단, 서버 환경에서만 사용 가능합니다.