/**
 * Site-wide route configuration
 * Centralized routing information used for navigation, meta tags, and SEO
 * Pure data structure - no React components for SSR compatibility
 */

/**
 * Route metadata for SEO and page information
 */
export interface RouteMeta {
  /** Page title for meta tags */
  title: string;
  /** Page description for meta tags */
  description: string;
  /** Keywords for SEO (optional) */
  keywords?: string[];
  /** Open Graph image URL (optional) */
  ogImage?: string;
}

/**
 * Base route configuration
 */
export interface RouteConfig {
  /** Display title for navigation */
  label: string;
  /** Route path/URL */
  url: string;
  /** Route description */
  description?: string;
  /** Meta information for SEO */
  meta?: RouteMeta;
  /** Child routes (optional) */
  children?: readonly RouteConfig[];
}

/**
 * Main navigation routes configuration
 */
export const ROUTES = {
  /** Home page */
  HOME: {
    label: "Home",
    url: "/",
    meta: {
      title: "홍케아 - 가구 쇼핑몰",
      description: "품질 좋은 가구를 합리적인 가격에 만나보세요",
    },
  },

  /** Product related routes */
  PRODUCTS: {
    label: "Products",
    url: "/products",
    meta: {
      title: "제품 | 홍케아",
      description: "다양한 카테고리의 가구 제품을 둘러보세요",
    },
    children: [
      {
        label: "Dining",
        url: "/products/dining",
        description: "식탁, 의자 등 다이닝 가구",
        meta: {
          title: "다이닝 가구 | 홍케아",
          description: "식탁, 식탁 의자 등 다이닝룸을 위한 가구",
        },
      },
      {
        label: "Living",
        url: "/products/living",
        description: "소파, 테이블 등 거실 가구",
        meta: {
          title: "리빙 가구 | 홍케아",
          description: "소파, 거실 테이블 등 거실을 위한 가구",
        },
      },
      {
        label: "Bedroom",
        url: "/products/bedroom",
        description: "침대, 수납장 등 침실 가구",
        meta: {
          title: "침실 가구 | 홍케아",
          description: "침대, 옷장, 협탁 등 침실을 위한 가구",
        },
      },
    ],
  },

  /** About */
  ABOUT: {
    label: "About",
    url: "/about",
    meta: {
      title: "소개 | 홍케아",
      description: "홍케아를 소개합니다.",
    },
  },

  /** Contact page */
  CONTACT: {
    label: "Contact",
    url: "/contact",
    meta: {
      title: "문의하기 | 홍케아",
      description: "애로사항을 문의하세요.",
    },
  },

  HELP: {
    label: "Help",
    url: "#",
    children: [
      {
        label: "Payment Options",
        url: "/help/payment-options",
        description: "결제방법 설정",
        meta: {
          title: "결제방법 선택 | 홍케아",
          description: "다양한 결제 방법을 선택하세요.",
        },
      },
      {
        label: "Returns",
        url: "/help/returns",
        description: "반품",
        meta: {
          title: "반품 | 홍케아",
          description: "반품을 도와드리겠습니다.",
        },
      },
      {
        label: "Privacy Policies",
        url: "/help/privacy-policies",
        description: "개인정보 처리방침",
        meta: {
          title: "개인정보 처리방침 | 홍케아",
          description: "사용자 개인정보 수집·저장·사용·공유·보호 정책",
        },
      },
    ],
  },
} as const;

/**
 * Authentication routes configuration
 */
export const AUTH_ROUTES = {
  LOGIN: {
    label: "Login",
    url: "/auth/login",
    meta: {
      title: "로그인 | 홍케아",
      description: "홍케아 로그인",
    },
  },
  SIGNUP: {
    label: "Sign up",
    url: "/auth/signup",
    meta: {
      title: "회원가입 | 홍케아",
      description: "홍케아 회원가입",
    },
  },
} as const;

/**
 * Admin routes configuration
 */
export const ADMIN_ROUTES = {
  CATEGORY: {
    label: "Category",
    url: "/admin/category",
    description: "카테고리 관리",
  },
  BRAND: {
    label: "Brand",
    url: "/admin/brand",
    description: "브랜드 관리",
  },
  PRODUCTS: {
    label: "Products",
    url: "/admin/products",
    description: "제품 관리",
  },
} as const;

/**
 * Navigation menu items for Header component
 * Transforms route configuration into navigation menu format
 */
export const getNavigationMenu = () => [
  ROUTES.HOME,
  {
    ...ROUTES.PRODUCTS,
    items: ROUTES.PRODUCTS.children,
  },
  ROUTES.ABOUT,
  ROUTES.CONTACT,
];

export const getFooterMenu = () => ({
  Link: [ROUTES.HOME, ROUTES.PRODUCTS, ROUTES.ABOUT, ROUTES.CONTACT],
  Help: [...ROUTES.HELP.children],
});

/**
 * Helper function to get route meta information
 * @param route - Route configuration object
 * @returns Meta information for the route
 */
export const getRouteMeta = (route: RouteConfig): RouteMeta | undefined => {
  return route.meta;
};

/**
 * Helper function to generate breadcrumb from route path
 * @param pathname - Current pathname
 * @returns Array of breadcrumb items
 */
export const getBreadcrumbs = (pathname: string): RouteConfig[] => {
  const breadcrumbs: RouteConfig[] = [];
  const segments = pathname.split("/").filter(Boolean);

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const route = findRouteByPath(currentPath);
    if (route) {
      breadcrumbs.push(route);
    }
  }

  return breadcrumbs;
};

/**
 * Helper function to find route by path
 * @param path - Route path to search for
 * @returns Matching route configuration or undefined
 */
export const findRouteByPath = (path: string): RouteConfig | undefined => {
  const searchInRoute = (route: RouteConfig): RouteConfig | undefined => {
    if (route.url === path) return route;
    if (route.children) {
      for (const child of route.children) {
        const found = searchInRoute(child);
        if (found) return found;
      }
    }
    return undefined;
  };

  for (const route of Object.values(ROUTES)) {
    const found = searchInRoute(route);
    if (found) return found;
  }

  return undefined;
};
