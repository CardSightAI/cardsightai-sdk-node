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
  CardDetection,
  DetectedCard,
  IdentifyResult,
} from './types.js';

// Export utility functions for working with identification results
export {
  getHighestConfidenceDetection,
  filterByConfidence,
  getDetectedCards,
  hasDetections,
  isSuccessful,
  getFirstDetection,
  countByConfidence,
  formatCardDisplay,
} from './utils.js';

// Default export
import { CardSightAI } from './client.js';
export default CardSightAI;
