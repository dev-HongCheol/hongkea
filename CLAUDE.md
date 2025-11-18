# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an e-commerce website (쇼핑몰) built with Next.js 16, TypeScript, React, and Tailwind CSS. The project follows Feature-Sliced Design (FSD) architecture with SSR-first approach.

## Tech Stack

- **Frontend**: Next.js 16+ (App Router), TypeScript, React
- **Backend**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS, shadcn/ui
- **State Management**: TanStack Query

## Development Commands

```bash
# Development
pnpm dev                 # Start development server
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Run ESLint

# Database Types (when Supabase is integrated)
pnpm gen-types          # Generate Supabase types and auto-fix JSONB types
```

## Code Conventions

### TypeScript/React Rules

- All functions must have comments
- Add comments for branches/logic blocks over 10 lines
- Props type definitions are mandatory
- Use shadcn/ui components
- Apply SSR-first approach with Next.js App Router
- Follow FSD (Feature-Sliced Design) architecture
- Add file purpose description at the top of each file
- Add inline comments for all created types and interfaces

### File Structure

- Uses App Router (`src/app/`)
- TypeScript path mapping: `@/*` maps to `./src/*`
- FSD architecture patterns expected

### Database Schema Management (Future)

- All tables, columns, indexes, functions must have comments
- Keep `database/schema.sql` synchronized with database
- Auto-generate types with `pnpm gen-types`
- JSONB type modifications handled by `scripts/fix-database-types.ts`

### Performance Optimization Guidelines

- Create composite indexes based on query patterns
- Index frequently used columns in WHERE clauses
- Consider partitioning for large datasets
- Ensure data integrity with constraints

### Naming Conventions

- Tables: `hk_` prefix + plural form (`hk_companies`)
- Indexes: `idx_hk_table_column` format
- Constraints: `chk_table_rule` format

## Architecture Notes

The project is designed as a furniture e-commerce platform with planned features including:

- Product catalog with categories (Dining, Living, Bedroom)
- Shopping cart and checkout
- User authentication
- Admin dashboard
- Search and filtering
- Wishlist functionality

Development follows a phased approach starting with MVP (home page, product pages, cart, basic checkout) before expanding to advanced features.
