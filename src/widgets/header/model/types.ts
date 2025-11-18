import { type RouteConfig } from "@/shared/config/routes";

/**
 * Extended MenuItem interface for internal use
 * Combines RouteConfig with items property for navigation
 */
export interface MenuItem extends RouteConfig {
  items?: readonly RouteConfig[];
}
