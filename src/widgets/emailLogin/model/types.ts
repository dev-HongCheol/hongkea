import { z } from "zod";

// 로그인 폼 스키마
export const loginFormSchema = z.object({
  email: z.string().email().min(1, "이메일을 입력해주세요."),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요.")
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
});

// 타입 추출
export type LoginFormData = z.infer<typeof loginFormSchema>;

// 로그인 응답 스키마
export const loginResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    // hk_users 테이블 필드들
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    phone: z.string().nullable(),
  }),
  session: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
  }),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
