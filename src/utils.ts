/**
 * Utility functions for working with CardSight AI SDK responses
 */

import type { CardDetection, IdentifyResult, DetectedCard } from './types.js';

/**
 * Get the highest confidence detection from an identification result
 * @param result - The identification result
 * @returns The detection with the highest confidence, or undefined if no detections
 */
export function getHighestConfidenceDetection(
  result: IdentifyResult
): CardDetection | undefined {
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
  if (!result.detections) return [];

  const confidenceOrder = { High: 3, Medium: 2, Low: 1 };
  const minScore = confidenceOrder[minConfidence] || 0;

  return result.detections.filter(detection => {
    const score = confidenceOrder[detection.confidence] || 0;
    return score >= minScore;
  });
}

/**
 * Get all detected cards (excluding detections without card data)
 * @param result - The identification result
 * @returns Array of detected cards
 */
export function getDetectedCards(result: IdentifyResult): DetectedCard[] {
  if (!result.detections) return [];

  return result.detections
    .filter(detection => detection.card !== undefined)
    .map(detection => detection.card!);
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

  if (!result.detections) return counts;

  result.detections.forEach(detection => {
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
  const parts = [card.year, card.manufacturer, card.releaseName];
  if (card.setName) parts.push(card.setName);
  parts.push(card.name);
  if (card.number) parts.push(`#${card.number}`);

  return parts.join(' ');
}

/**
 * Check if a detection is a parallel variant
 * @param detection - The card detection
 * @returns True if the detected card is a parallel variant
 */
export function hasParallel(detection: CardDetection): boolean {
  return Boolean(detection.card?.parallel);
}

/**
 * Get parallel information from a detection
 * @param detection - The card detection
 * @returns Parallel information if available, undefined otherwise
 */
export function getParallelInfo(detection: CardDetection) {
  return detection.card?.parallel;
}

/**
 * Check if a detection is a numbered parallel (limited print run)
 * @param detection - The card detection
 * @returns True if the card is a numbered parallel (has numberedTo value)
 */
export function isNumberedParallel(detection: CardDetection): boolean {
  return Boolean(detection.card?.parallel?.numberedTo);
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
  const parallel = detection.card?.parallel;
  if (!parallel) return '';

  const parts = [parallel.name];
  if (parallel.numberedTo) {
    parts.push(`/${parallel.numberedTo}`);
  }

  return parts.join(' ');
}