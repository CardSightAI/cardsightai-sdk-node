/**
 * Utility functions for working with CardSight AI SDK responses
 */

import type { CardDetection, IdentifyResult, DetectedCard, CardParallel } from './types.js';

/**
 * Get the highest confidence detection from an identification result
 * @param result - The identification result
 * @returns The detection with the highest confidence, or undefined if no detections
 */
export function getHighestConfidenceDetection(result: IdentifyResult): CardDetection | undefined {
  if (!result.detections || result.detections.length === 0) {
    return undefined;
  }

  // Sort by confidence (High > Medium > Low) and return first
  const confidenceOrder = { High: 3, Medium: 2, Low: 1 };
  const sorted = [...result.detections].sort((a, b) => {
    const aScore = confidenceOrder[a.confidence] || 0;
    const bScore = confidenceOrder[b.confidence] || 0;
    return bScore - aScore;
  });

  return sorted[0];
}

/**
 * Filter detections by confidence level
 * @param result - The identification result
 * @param minConfidence - Minimum confidence level to include
 * @returns Array of detections meeting the confidence threshold
 */
export function filterByConfidence(
  result: IdentifyResult,
  minConfidence: 'High' | 'Medium' | 'Low'
): CardDetection[] {
  if (!result.detections) {
    return [];
  }

  const confidenceOrder = { High: 3, Medium: 2, Low: 1 };
  const minScore = confidenceOrder[minConfidence] || 0;

  return result.detections.filter((detection) => {
    const score = confidenceOrder[detection.confidence] || 0;
    return score >= minScore;
  });
}

/**
 * Get all detected cards with exact matches (card has an id)
 * @param result - The identification result
 * @returns Array of detected cards with exact matches
 */
export function getDetectedCards(result: IdentifyResult): DetectedCard[] {
  if (!result.detections) {
    return [];
  }

  return result.detections
    .filter((detection) => detection.card.id !== undefined)
    .map((detection) => detection.card);
}

/**
 * Check if any cards were detected
 * @param result - The identification result
 * @returns True if at least one card was detected
 */
export function hasDetections(result: IdentifyResult): boolean {
  return Boolean(result.detections && result.detections.length > 0);
}

/**
 * Check if a detection is an exact card match (has a card id)
 * @param detection - The card detection
 * @returns True if the detection is an exact match
 */
export function isExactMatch(detection: CardDetection): boolean {
  return detection.card.id !== undefined;
}

/**
 * Check if a detection is a set-level match (no card id, but has set id)
 * @param detection - The card detection
 * @returns True if the detection is a set-level match
 */
export function isSetLevelMatch(detection: CardDetection): boolean {
  return detection.card.id === undefined && detection.card.setId !== undefined;
}

/**
 * Get all exact match detections from an identification result
 * @param result - The identification result
 * @returns Array of detections with exact card matches
 */
export function getExactMatches(result: IdentifyResult): CardDetection[] {
  if (!result.detections) {
    return [];
  }
  return result.detections.filter((detection) => detection.card.id !== undefined);
}

/**
 * Check if identification was successful
 * @param result - The identification result
 * @returns True if the identification was successful
 */
export function isSuccessful(result: IdentifyResult): boolean {
  return result.success === true;
}

/**
 * Get the first detection (typically highest confidence)
 * @param result - The identification result
 * @returns The first detection or undefined
 */
export function getFirstDetection(result: IdentifyResult): CardDetection | undefined {
  return result.detections?.[0];
}

/**
 * Count detections by confidence level
 * @param result - The identification result
 * @returns Object with counts for each confidence level
 */
export function countByConfidence(
  result: IdentifyResult
): Record<'High' | 'Medium' | 'Low', number> {
  const counts = { High: 0, Medium: 0, Low: 0 };

  if (!result.detections) {
    return counts;
  }

  result.detections.forEach((detection) => {
    if (detection.confidence in counts) {
      counts[detection.confidence]++;
    }
  });

  return counts;
}

/**
 * Format a detected card as a display string
 * @param card - The detected card
 * @returns Formatted string representation of the card
 */
export function formatCardDisplay(card: DetectedCard): string {
  const parts: string[] = [];
  if (card.year) {
    parts.push(card.year);
  }
  if (card.manufacturer) {
    parts.push(card.manufacturer);
  }
  if (card.releaseName) {
    parts.push(card.releaseName);
  }
  if (card.setName) {
    parts.push(card.setName);
  }
  if (card.name) {
    parts.push(card.name);
  }
  if (card.number) {
    parts.push(`#${card.number}`);
  }

  return parts.join(' ') || 'Unknown Card';
}

/**
 * Check if a detection is a parallel variant
 * @param detection - The card detection
 * @returns True if the detected card is a parallel variant
 */
export function hasParallel(detection: CardDetection): boolean {
  return Boolean(detection.card.parallel);
}

/**
 * Get parallel information from a detection
 * @param detection - The card detection
 * @returns Parallel information if available, undefined otherwise
 */
export function getParallelInfo(detection: CardDetection): DetectedCard['parallel'] {
  return detection.card.parallel;
}

/**
 * Check if a detection is a numbered parallel (limited print run)
 * @param detection - The card detection
 * @returns True if the card is a numbered parallel (has numberedTo value)
 */
export function isNumberedParallel(detection: CardDetection): boolean {
  return Boolean(detection.card.parallel?.numberedTo);
}

/**
 * Format parallel information as a display string
 * @param detection - The card detection
 * @returns Formatted string with parallel details, or empty string if not a parallel
 * @example
 * // "Gold Refractor /50"
 * // "Black Prizm"
 * // "Orange /25"
 */
export function formatParallelDisplay(detection: CardDetection): string {
  const parallel = detection.card.parallel;
  if (!parallel) {
    return '';
  }

  const parts = [parallel.name];
  if (parallel.numberedTo) {
    parts.push(`/${parallel.numberedTo}`);
  }

  return parts.join(' ');
}

// ============================================================================
// Card Parallel Utilities (for catalog cards with parallels array)
// ============================================================================

/**
 * Card-like object with optional parallels array (matches catalog card responses)
 */
interface CardWithParallels {
  parallels?: CardParallel[];
}

/**
 * Get all parallels for a card from catalog responses
 * @param card - A card object from catalog endpoints
 * @returns Array of parallel variants, or empty array if none
 */
export function getCardParallels(card: CardWithParallels): CardParallel[] {
  return card.parallels || [];
}

/**
 * Check if a card has any parallel variants available
 * @param card - A card object from catalog endpoints
 * @returns True if the card has at least one parallel variant
 */
export function hasCardParallels(card: CardWithParallels): boolean {
  return Boolean(card.parallels && card.parallels.length > 0);
}

/**
 * Find a specific parallel by name (case-insensitive)
 * @param card - A card object from catalog endpoints
 * @param name - The name of the parallel to find
 * @returns The matching parallel, or undefined if not found
 */
export function findParallelByName(
  card: CardWithParallels,
  name: string
): CardParallel | undefined {
  if (!card.parallels) {
    return undefined;
  }
  const lowerName = name.toLowerCase();
  return card.parallels.find((p) => p.name.toLowerCase() === lowerName);
}

/**
 * Get only numbered parallels (those with limited print runs)
 * @param card - A card object from catalog endpoints
 * @returns Array of numbered parallel variants
 */
export function getNumberedParallels(card: CardWithParallels): CardParallel[] {
  if (!card.parallels) {
    return [];
  }
  return card.parallels.filter((p) => p.numberedTo !== undefined);
}

/**
 * Format a card parallel for display
 * @param parallel - The parallel object
 * @returns Formatted string (e.g., "Gold Refractor /50" or "Black Prizm")
 */
export function formatCardParallel(parallel: CardParallel): string {
  if (parallel.numberedTo) {
    return `${parallel.name} /${parallel.numberedTo}`;
  }
  return parallel.name;
}
