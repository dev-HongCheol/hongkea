/**
 * Common entity utility types for FSD architecture
 * Provides standardized type transformations for database entities
 */

// Remove auto-managed fields from database entities
export type OmitAutoFields<T> = Omit<T, 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>

// Remove ID and auto-managed fields for creation
export type OmitIdAndAutoFields<T> = Omit<T, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>

// Standard entity type transformations
export type EntityView<T> = OmitAutoFields<T>
export type EntityCreate<T> = OmitIdAndAutoFields<T>
export type EntityUpdate<T> = Partial<EntityCreate<T>>

// Require ID field
export type RequireId<T> = T & { id: string }