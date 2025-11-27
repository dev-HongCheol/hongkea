/**
 * Admin Products Page
 * 제품 관리 페이지
 */

"use client";

import React from "react";
import { AdminProductsView } from "@/views/products/AdminProductsView";
import { Toaster } from "sonner";

export default function AdminProductsPage() {
  return (
    <>
      <AdminProductsView />
      <Toaster richColors position="top-right" />
    </>
  );
}