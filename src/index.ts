/**
 * CardSightAI Node.js SDK
 *
 * Official TypeScript/JavaScript SDK for the CardSightAI REST API
 */

// Main exports
export { CardSightAI, init, type CardSightAIConfig } from './client.js';
export { CardSightAIError, AuthenticationError } from './client.js';

// Re-export generated types for convenience
export type { paths, components } from './generated/types.js';

// Export identification types and utilities
export type {
  CardIdentificationResponse,
  CardIdentificationBySegmentResponse,
  CardDetectionResponse,
  CatalogSearchResponse,
  CardDetection,
  DetectedCard,
  IdentifyResult,
  DetailedParallel,
  CardParallel,
  SlabGradingDetail,
  SlabCompany,
  SlabGrade,
  SlabQualifier,
  SlabAutoGrade,
  ServerMessage,
  PricingResponse,
  PricingRecord,
  BulkPricingResponse,
  BulkPricingResult,
  MarketplaceResponse,
  MarketplaceRecord,
  // Field catalog types (v3.4.2)
  FieldValue,
  FieldValues,
  CardSuggestion,
  Field,
  FieldSummary,
  DetailedFieldResponse,
  PaginatedFieldsResponse,
  FieldsResponse,
  // Release calendar types (v3.4.2)
  ReleaseCalendarEntry,
  PaginatedReleaseCalendarResponse,
  ReleaseCalendarResponse
} from './types.js';

// Export utility functions for working with identification results
export {
  getHighestConfidenceDetection,
  filterByConfidence,
  getDetectedCards,
  hasDetections,
  isExactMatch,
  isSetLevelMatch,
  getExactMatches,
  isSuccessful,
  getFirstDetection,
  countByConfidence,
  formatCardDisplay,
  hasParallel,
  getParallelInfo,
  isNumberedParallel,
  formatParallelDisplay,
  // Grading/slab detection utilities
  hasGrading,
  getGradingInfo,
  formatGradingDisplay,
  // Card parallel utilities (for catalog cards with parallels array)
  getCardParallels,
  hasCardParallels,
  findParallelByName,
  getNumberedParallels,
  formatCardParallel,
  // Field / suggestion / numbered-card utilities (v3.4.2)
  hasFields,
  getFields,
  getFieldValue,
  formatFieldValues,
  hasSuggestions,
  getSuggestions,
  isNumberedCard,
  getNumberedTo
} from './utils.js';

// Default export
import { CardSightAI } from './client.js';
export default CardSightAI;
