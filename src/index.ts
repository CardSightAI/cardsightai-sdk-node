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
  CardDetection,
  DetectedCard,
  IdentifyResult,
  DetailedParallel,
  CardParallel
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
  // Card parallel utilities (for catalog cards with parallels array)
  getCardParallels,
  hasCardParallels,
  findParallelByName,
  getNumberedParallels,
  formatCardParallel
} from './utils.js';

// Default export
import { CardSightAI } from './client.js';
export default CardSightAI;
