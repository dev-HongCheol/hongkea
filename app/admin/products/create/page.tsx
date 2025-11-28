/**
 * Admin Product Create Page
 * 관리자 제품 생성 페이지
 */

import { Metadata } from "next";
import { AdminProductCreateView } from "@/views/products/AdminProductCreateView";

export const metadata: Metadata = {
  title: "제품 등록 | 관리자",
  description: "새로운 제품을 등록하는 관리자 페이지입니다.",
};

export default function AdminProductCreatePage() {
  return <AdminProductCreateView />;
}