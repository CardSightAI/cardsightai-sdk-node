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

// Card Identification types
export type CardIdentificationResponse = GetResponseData<'/v1/identify/card', 'post'>;
export type CardIdentificationBySegmentResponse = GetResponseData<
  '/v1/identify/card/{segment}',
  'post'
>;

export interface CardDetection {
  confidence: 'High' | 'Medium' | 'Low';
  card: DetectedCard;
}

export interface DetectedCard {
  id?: string;
  segmentId?: string;
  releaseId?: string;
  setId?: string;
  year?: string;
  manufacturer?: string;
  releaseName?: string;
  setName?: string;
  name?: string;
  number?: string;
  parallel?: {
    id: string;
    name: string;
    description?: string;
    isPartial?: true;
    numberedTo?: number;
    cards?: string[];
  };
}

// Utility type for easier access to the identification result
export interface IdentifyResult {
  success: boolean;
  requestId: string;
  detections?: CardDetection[];
  processingTime?: number;
}

// Detailed parallel response from GET /v1/catalog/parallels/{id}
export type DetailedParallel = components['schemas']['DetailedParallelResponse'];

// Parallel variant information attached to cards in catalog responses
export interface CardParallel {
  /** Unique identifier for the parallel type (UUID) */
  id: string;
  /** Name of the parallel variant (e.g., "Gold Refractor", "Black Prizm") */
  name: string;
  /** Limited print run number for numbered parallels (e.g., 50 for /50) */
  numberedTo?: number;
}

// Export all generated types
export type { paths, components } from './generated/types.js';
