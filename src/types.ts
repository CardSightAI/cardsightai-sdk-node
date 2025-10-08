/**
 * Type definitions and utilities for CardSightAI SDK
 */

import type { paths, components } from './generated/types.js';

// Extract operation types for easier use
export type Operations = keyof paths;

// Health check types
export type HealthResponse =
  paths['/health']['get']['responses']['200']['content']['application/json'];
export type AuthHealthResponse =
  paths['/health/auth']['get']['responses']['200']['content']['application/json'];

// Helper type to extract response data
type GetResponseData<
  Path extends keyof paths,
  Method extends keyof paths[Path]
> = paths[Path][Method] extends {
  responses: {
    200: {
      content: {
        'application/json': infer Data;
      };
    };
  };
}
  ? Data
  : never;

// Helper type to extract request body
type GetRequestBody<
  Path extends keyof paths,
  Method extends keyof paths[Path]
> = paths[Path][Method] extends {
  requestBody: {
    content: {
      'application/json': infer Body;
    };
  };
}
  ? Body
  : never;

// Helper type to extract query parameters
type GetQueryParams<
  Path extends keyof paths,
  Method extends keyof paths[Path]
> = paths[Path][Method] extends {
  parameters: {
    query?: infer Query;
  };
}
  ? Query
  : never;

// Export helper types
export type { GetResponseData, GetRequestBody, GetQueryParams };

// Common response types (once we parse the full schema)
export type Card = components['schemas']['Card'] extends object
  ? components['schemas']['Card']
  : any;
export type Set = components['schemas']['Set'] extends object ? components['schemas']['Set'] : any;
export type Collection = components['schemas']['Collection'] extends object
  ? components['schemas']['Collection']
  : any;
export type Manufacturer = components['schemas']['Manufacturer'] extends object
  ? components['schemas']['Manufacturer']
  : any;
export type Release = components['schemas']['Release'] extends object
  ? components['schemas']['Release']
  : any;

// Pagination types
export interface PaginationParams {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Filter types
export interface CardFilterParams extends PaginationParams {
  year?: number;
  manufacturer?: string;
  set?: string;
  player?: string;
  team?: string;
  parallel?: string;
  attributes?: string[];
}

// Image upload types
export type ImageUpload = Blob | File | Buffer | ArrayBuffer | Uint8Array;

// API Response wrapper type
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
  ok: boolean;
}

// Collection operation types
export interface CreateCollectionData {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface AddCardToCollectionData {
  cardId: string;
  quantity?: number;
  condition?: string;
  notes?: string;
  purchasePrice?: number;
  purchaseDate?: string;
}

// Feedback types
export interface GeneralFeedback {
  type: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  email?: string;
}

export interface CardFeedback {
  type: 'incorrect' | 'missing' | 'duplicate' | 'other';
  description: string;
  suggestedCorrection?: string;
}

// AI Query types
export interface AIQueryRequest {
  question: string;
  context?: string;
  maxResults?: number;
}

// Export all generated types
export type { paths, components } from './generated/types.js';
