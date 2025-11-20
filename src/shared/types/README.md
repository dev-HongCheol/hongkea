# Database Types & Schemas

이 디렉토리는 Supabase 데이터베이스의 TypeScript 타입 정의와 Zod validation 스키마를 관리합니다.

## 파일 구조

```
src/shared/types/
├── database.types.ts              # Supabase에서 생성된 기본 타입 정의
├── database.schemas.ts            # Zod validation 스키마 (자동 생성)
├── database-json.types.ts         # JSON 컬럼의 구체적인 타입 정의
├── database-json.schemas.ts       # JSON 타입에 대한 Zod 스키마
├── fix-database-types.ts          # database.types.ts 자동 수정 스크립트
├── fix-database-schemas.ts        # database.schemas.ts 자동 수정 스크립트
└── README.md                      # 이 파일
```

## 사용법

### 1. 타입 생성 및 자동 수정

```bash
# 모든 타입 생성 및 자동 수정 (권장)
pnpm gen-types

# 개별 실행
supabase gen types typescript --project-id PROJECT_ID > src/shared/types/database.types.ts
supabase-to-zod --input src/shared/types/database.types.ts --output /src/shared/types/database.schemas.ts
tsx src/shared/types/fix-database-types.ts
tsx src/shared/types/fix-database-schemas.ts
```

### 2. JSON 컬럼 타입 정의

새로운 JSON 컬럼이 데이터베이스에 추가되면, 해당 타입을 `database-json.types.ts`와 `database-json.schemas.ts`에 추가해야 합니다.

#### 2-1. 타입 인터페이스 추가 (`database-json.types.ts`)

```typescript
// 새로운 JSON 타입 추가 예시
export interface NewJsonType {
  field1?: string;
  field2?: number[];
  nested?: {
    subField: boolean;
  };
}
```

#### 2-2. Zod 스키마 추가 (`database-json.schemas.ts`)

**⚠️ 중요**: 최신 Zod v3+ 사용 시 `z.record()` API가 변경되었습니다. 
[Zod Records 공식 문서](https://zod.dev/api?id=records)를 참고하여 올바른 문법을 사용하세요.

```typescript
// 최신 Zod record 사용법 (v3+)
export const newJsonTypeSchema: z.ZodSchema<NewJsonType> = z.object({
  field1: z.string().optional(),
  field2: z.array(z.number()).optional(),
  nested: z.object({
    subField: z.boolean(),
  }).optional(),
});

// 동적 키가 있는 객체의 경우 (예: ProductOptionCombinations)
export const dynamicObjectSchema = z.record(z.string(), z.union([z.string(), z.number()]));
// 이전 버전: z.record(z.union([z.string(), z.number()]))
```

#### 2-3. AI 도움 요청하기

JSON 타입 생성은 AI를 통해 하는 것을 권장합니다:

```
생성된 database.types.ts의 JSON 부분을 실제 타입으로 생성해서 database-json.types.ts에 추가해줘.
그리고 해당하는 Zod 스키마도 database-json.schemas.ts에 추가해줘.
최신 Zod v3+ record API (https://zod.dev/api?id=records)를 사용해서 만들어줘.
```

#### 2-4. JSON_SCHEMA_MAP 업데이트

새 스키마를 `database-json.schemas.ts`의 `JSON_SCHEMA_MAP`에 추가:

```typescript
export const JSON_SCHEMA_MAP = {
  // ... 기존 스키마들
  NewJsonType: newJsonTypeSchema,
} as const;
```

### 3. 자동 수정 설정

#### database.types.ts 수정 설정

`fix-database-types.ts`의 CONFIG 배열에서 설정:

```typescript
const CONFIG = [
  {
    tableName: "hk_admin_users",
    columns: [
      {
        name: "permissions",
        type: "AdminPermissions",
        importFrom: "./database-json.types",
      },
    ],
    operations: ["Row", "Insert", "Update"],
  },
];
```

#### database.schemas.ts 수정 설정

`fix-database-schemas.ts`의 SCHEMA_CONFIG 배열에서 설정:

```typescript
const SCHEMA_CONFIG = [
  {
    tableName: "hk_admin_users",
    columns: [
      {
        name: "permissions",
        schemaName: "adminPermissionsSchema",
        typeName: "AdminPermissions",
      },
    ],
  },
];
```

## 자동 수정 과정

### fix-database-types.ts

1. **Import 구문 추가**: 필요한 JSON 타입을 database-json.types.ts에서 import
2. **타입 교체**: `Json | null` → `AdminPermissions | null` 등으로 교체
3. **패턴 매칭**: Row, Insert, Update 타입에서 다양한 패턴을 매칭하여 교체

### fix-database-schemas.ts

1. **기존 인라인 스키마 정의 제거**: 중복 방지를 위해 기존 스키마 정의 제거
2. **Import 구문 업데이트**: database-json.schemas.ts에서 필요한 스키마들을 import
3. **스키마 교체**: `jsonSchema` → `adminPermissionsSchema` 등으로 구체적 스키마로 교체
4. **generic jsonSchema 정의 제거**: `export const jsonSchema: z.ZodSchema<Json> = z.lazy(...)` 완전 제거
5. **Json 타입 import 제거**: 더 이상 사용되지 않는 Json 타입 import 정리

## 타입 안전성

### Before (Generic)

```typescript
// 타입 안전성 없음
const user = {
  permissions: { products: "invalid" }, // 에러 감지 안됨
};
```

### After (Specific)

```typescript
// 타입 안전성 보장
const user: { permissions: AdminPermissions } = {
  permissions: { products: ["read"] }, // 올바른 타입
};
```

## Zod Validation

```typescript
import { adminPermissionsSchema } from "./database-json.schemas";

// 런타임 validation
const result = adminPermissionsSchema.safeParse({
  products: ["read", "write"],
  orders: ["read"],
});

if (result.success) {
  console.log(result.data); // 타입이 보장된 데이터
}
```

## 새로운 JSON 컬럼 추가하기

데이터베이스에 새로운 JSON 컬럼을 추가했을 때 따라야 할 단계별 가이드입니다.

### 단계 1: 타입 정의 추가

`database-json.types.ts`에 새로운 인터페이스 추가:

```typescript
// 예시: 새로운 사용자 프로필 설정 JSON 컬럼
export interface UserProfileSettings {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy?: {
    profile_visible: boolean;
    activity_tracking: boolean;
  };
}
```

### 단계 2: Zod 스키마 정의 추가

`database-json.schemas.ts`에 해당하는 Zod 스키마 추가:

```typescript
// ⚠️ 최신 Zod v3+ record API 사용 필수!
export const userProfileSettingsSchema: z.ZodSchema<UserProfileSettings> = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.string().optional(),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
  }).optional(),
  privacy: z.object({
    profile_visible: z.boolean(),
    activity_tracking: z.boolean(),
  }).optional(),
});
```

**JSON_SCHEMA_MAP에도 추가:**

```typescript
export const JSON_SCHEMA_MAP = {
  // ... 기존 스키마들
  UserProfileSettings: userProfileSettingsSchema,
} as const;
```

### 단계 3: 자동 수정 설정 추가

#### fix-database-types.ts CONFIG 업데이트:

```typescript
const CONFIG = [
  // ... 기존 설정들
  {
    tableName: "hk_users", // 해당 테이블명
    columns: [
      {
        name: "profile_settings", // 실제 컬럼명
        type: "UserProfileSettings", // 위에서 정의한 타입명
        importFrom: "./database-json.types",
      },
    ],
    operations: ["Row", "Insert", "Update"],
  },
];
```

#### fix-database-schemas.ts SCHEMA_CONFIG 업데이트:

```typescript
const SCHEMA_CONFIG = [
  // ... 기존 설정들
  {
    tableName: "hk_users",
    columns: [
      {
        name: "profile_settings",
        schemaName: "userProfileSettingsSchema", // 스키마명 (camelCase)
        typeName: "UserProfileSettings", // 타입명 (PascalCase)
      },
    ],
  },
];
```

### 단계 4: 타입 재생성 및 검증

```bash
# 모든 타입 재생성
pnpm gen-types

# 또는 개별 실행으로 단계별 확인
tsx src/shared/types/fix-database-types.ts
tsx src/shared/types/fix-database-schemas.ts
```

### 단계 5: AI 도움 요청 템플릿

복잡한 JSON 구조의 경우 AI에게 다음과 같이 요청하세요:

```
database.types.ts에서 hk_users 테이블의 profile_settings 컬럼이 Json 타입으로 되어 있는데, 
이것을 실제 사용할 구체적인 타입으로 만들어서 database-json.types.ts에 UserProfileSettings 인터페이스로 추가해줘.
그리고 해당하는 Zod 스키마도 database-json.schemas.ts에 userProfileSettingsSchema로 추가해줘.
최신 Zod v3+ record API (https://zod.dev/api?id=records)를 참고해서 만들어줘.
설정도 fix-database-types.ts와 fix-database-schemas.ts에 추가해줘.
```

## 주의사항

- **절대 수동 편집 금지**: `database.types.ts`와 `database.schemas.ts`는 자동 생성되므로 직접 수정하지 마세요
- **타입-스키마 동기화**: JSON 컬럼 타입 변경 시 `database-json.types.ts`와 `database-json.schemas.ts` 모두 업데이트해야 합니다
- **Zod 버전 호환성**: 최신 Zod v3+ 사용 시 `z.record()` API 변경사항에 주의하세요 ([문서 참조](https://zod.dev/api?id=records))
- **설정 파일 업데이트**: 새로운 JSON 컬럼 추가 시 반드시 `fix-database-types.ts`와 `fix-database-schemas.ts`의 CONFIG 설정도 업데이트해야 합니다
- **generic jsonSchema 제거됨**: 최신 버전에서는 generic `jsonSchema`가 완전히 제거되고 구체적인 타입별 스키마만 사용됩니다

## 트러블슈팅

### 자주 발생하는 문제들

1. **Zod record 오류**: `z.record(valueSchema)` → `z.record(z.string(), valueSchema)` 로 변경
2. **타입 불일치**: TypeScript 인터페이스와 Zod 스키마가 일치하는지 확인
3. **import 오류**: 새로운 타입/스키마 추가 후 import 구문이 올바른지 확인
4. **설정 누락**: CONFIG와 SCHEMA_CONFIG 양쪽 모두에 새로운 JSON 컬럼 설정 추가했는지 확인
