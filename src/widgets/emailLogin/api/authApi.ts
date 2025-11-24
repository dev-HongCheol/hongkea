/**
 * Authentication API layer
 * Handles Supabase auth operations and user data fetching
 */

import { supabase } from "@/shared/lib";
import {
  LoginFormData,
  LoginResponse,
  loginFormSchema,
  loginResponseSchema,
} from "../model/types";

/**
 * 이메일/비밀번호로 로그인하는 API 함수
 * @param formData - 로그인 폼 데이터 (email, password)
 * @returns 로그인 응답 데이터 (user, session)
 */
export const loginWithEmailPassword = async (
  formData: LoginFormData,
): Promise<LoginResponse> => {
  // 1. 폼 데이터 유효성 검증
  const validatedData = loginFormSchema.parse(formData);

  try {
    // 2. Supabase Auth 로그인 시도
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

    if (authError) {
      console.log("🚀 ~ loginWithEmailPassword ~ authError:", authError);
      throw new Error(getLoginErrorMessage(authError.message));
    }

    if (!authData.user || !authData.session) {
      throw new Error("로그인에 실패했습니다");
    }

    // 3. 커스텀 유저 정보 조회 (hk_users 테이블)
    const { data: userData, error: userError } = await supabase
      .from("hk_users")
      .select("first_name, last_name, phone")
      .eq("id", authData.user.id)
      .single();

    if (userError) {
      console.warn("유저 프로필 정보를 가져오는데 실패했습니다:", userError);
    }

    // 4. 응답 데이터 구성 및 검증
    const response: LoginResponse = {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        first_name: userData?.first_name || null,
        last_name: userData?.last_name || null,
        phone: userData?.phone || null,
      },
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
      },
    };

    return loginResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("로그인 중 오류가 발생했습니다");
  }
};

/**
 * 현재 로그인된 사용자 정보 조회
 * @returns 사용자 정보 또는 null
 */
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // 커스텀 유저 정보도 함께 조회
  const { data: userData } = await supabase
    .from("hk_users")
    .select("first_name, last_name, phone")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email!,
    first_name: userData?.first_name || null,
    last_name: userData?.last_name || null,
    phone: userData?.phone || null,
  };
};

/**
 * 로그아웃 처리
 */
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error("로그아웃에 실패했습니다");
  }
};

/**
 * 에러 메시지를 사용자 친화적으로 변환하는 함수
 * @param errorMessage - Supabase 에러 메시지
 * @returns 사용자 친화적 에러 메시지
 */
const getLoginErrorMessage = (errorMessage: string): string => {
  if (errorMessage.includes("Invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다";
  }
  if (errorMessage.includes("Email not confirmed")) {
    return "이메일 인증이 필요합니다";
  }
  if (errorMessage.includes("Too many requests")) {
    return "너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요";
  }
  return "로그인에 실패했습니다";
};
