/**
 * Utility functions for working with CardSight AI SDK responses
 */

import type {
  CardDetection,
  IdentifyResult,
  DetectedCard,
  CardParallel,
  FieldValue,
  CardSuggestion,
  ParallelSuggestion
} from './types.js';

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

// ============================================================================
// Parallel Suggestion Utilities (v4.0.0, beta — CardDetails.parallelSuggestions)
// ============================================================================

/**
 * Check if a detection carries any parallel evidence (one or more parallel suggestions).
 * This is true for a single confirmed parallel as well as for several possible candidates —
 * inspect each entry's `confidence` to tell them apart.
 * @param detection - The card detection
 * @returns True if at least one parallel suggestion is present
 */
export function hasParallelSuggestions(detection: CardDetection): boolean {
  return Boolean(
    detection.card.parallelSuggestions && detection.card.parallelSuggestions.length > 0
  );
}

/**
 * Get all parallel suggestions from a detection, in the engine's ranking (best match first)
 * @param detection - The card detection
 * @returns Array of parallel suggestions, or empty array if none
 */
export function getParallelSuggestions(detection: CardDetection): ParallelSuggestion[] {
  return detection.card.parallelSuggestions || [];
}

/**
 * Get the best-match parallel suggestion (the first entry in the engine's ranking).
 * Ranking and per-entry `confidence` are independent: a later entry may carry a higher
 * confidence tier than the first. Use `filterParallelSuggestionsByConfidence()` when you
 * need to gate on confidence instead of rank.
 * @param detection - The card detection
 * @returns The top-ranked parallel suggestion, or undefined if none
 */
export function getBestParallelSuggestion(
  detection: CardDetection
): ParallelSuggestion | undefined {
  return detection.card.parallelSuggestions?.[0];
}

/**
 * Filter parallel suggestions by minimum confidence tier, preserving the engine's ranking.
 * Entries without a `confidence` value (not yet assessed) are excluded — a missing value
 * means "not assessed", not "Low".
 * @param detection - The card detection
 * @param minConfidence - Minimum confidence tier to include
 * @returns Array of parallel suggestions meeting the confidence threshold
 */
export function filterParallelSuggestionsByConfidence(
  detection: CardDetection,
  minConfidence: 'High' | 'Medium' | 'Low'
): ParallelSuggestion[] {
  const suggestions = detection.card.parallelSuggestions;
  if (!suggestions) {
    return [];
  }

  const confidenceOrder = { High: 3, Medium: 2, Low: 1 };
  const minScore = confidenceOrder[minConfidence] || 0;

  return suggestions.filter((suggestion) => {
    if (!suggestion.confidence) {
      return false;
    }
    const score = confidenceOrder[suggestion.confidence] || 0;
    return score >= minScore;
  });
}

/**
 * Format a parallel suggestion as a display string
 * @param suggestion - A parallel suggestion entry
 * @returns Formatted string with name, print run, and confidence tier when assessed
 * @example
 * // "Gold Refractor /50 - High confidence"
 * // "Black Prizm - Medium confidence"
 * // "Refractor"   (confidence not assessed)
 */
export function formatParallelSuggestion(suggestion: ParallelSuggestion): string {
  const parts = [suggestion.name];
  if (suggestion.numberedTo) {
    parts.push(`/${suggestion.numberedTo}`);
  }
  const label = parts.join(' ');
  return suggestion.confidence ? `${label} - ${suggestion.confidence} confidence` : label;
}

// ----------------------------------------------------------------------------
// Legacy single-parallel helpers. The API replaced `card.parallel` with the ranked
// `card.parallelSuggestions` array in v4.0.0; these now read the best-match entry.
// ----------------------------------------------------------------------------

/**
 * Check if a detection has parallel evidence.
 * @deprecated Reads `card.parallelSuggestions` (the API removed `card.parallel`). Returns true
 * for *any* parallel evidence, including lower-confidence candidates. Use
 * `hasParallelSuggestions()`, and check `getBestParallelSuggestion(detection)?.confidence`
 * if you only want confirmed parallels.
 * @param detection - The card detection
 * @returns True if at least one parallel suggestion is present
 */
export function hasParallel(detection: CardDetection): boolean {
  return hasParallelSuggestions(detection);
}

/**
 * Get the best-match parallel from a detection.
 * @deprecated Use `getBestParallelSuggestion()`. Returns the first entry of
 * `card.parallelSuggestions` (the API removed `card.parallel`).
 * @param detection - The card detection
 * @returns The top-ranked parallel suggestion, or undefined if none
 */
export function getParallelInfo(detection: CardDetection): ParallelSuggestion | undefined {
  return getBestParallelSuggestion(detection);
}

/**
 * Check if the best-match parallel is numbered (limited print run).
 * @deprecated Use `getBestParallelSuggestion(detection)?.numberedTo`. Reads the first entry
 * of `card.parallelSuggestions` (the API removed `card.parallel`).
 * @param detection - The card detection
 * @returns True if the best-match parallel has a numberedTo value
 */
export function isNumberedParallel(detection: CardDetection): boolean {
  return Boolean(getBestParallelSuggestion(detection)?.numberedTo);
}

/**
 * Format the best-match parallel as a display string (name and print run only).
 * @deprecated Use `formatParallelSuggestion(getBestParallelSuggestion(detection))`, which also
 * includes the confidence tier. Reads the first entry of `card.parallelSuggestions`.
 * @param detection - The card detection
 * @returns Formatted string with parallel details, or empty string if no parallel evidence
 * @example
 * // "Gold Refractor /50"
 * // "Black Prizm"
 * // "Orange /25"
 */
export function formatParallelDisplay(detection: CardDetection): string {
  const parallel = getBestParallelSuggestion(detection);
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
// Grading/Slab Detection Utilities
// ============================================================================

/**
 * Check if a detection includes grading/slab information
 * @param detection - The card detection
 * @returns True if grading data is present
 */
export function hasGrading(detection: CardDetection): boolean {
  return Boolean(detection.grading);
}

/**
 * Get grading information from a detection
 * @param detection - The card detection
 * @returns Grading info if available, undefined otherwise
 */
export function getGradingInfo(detection: CardDetection): CardDetection['grading'] {
  return detection.grading;
}

/**
 * Format grading information as a display string
 * @param detection - The card detection
 * @returns Formatted string (e.g., "PSA 10 GEM MINT - High confidence"), or empty string if no grading
 */
export function formatGradingDisplay(detection: CardDetection): string {
  if (!detection.grading) {
    return '';
  }

  const parts = [detection.grading.company.name];

  if (detection.grading.grade?.value) {
    parts.push(detection.grading.grade.value);
    if (detection.grading.grade.condition) {
      parts.push(detection.grading.grade.condition);
    }
  }

  return `${parts.join(' ')} - ${detection.grading.confidence} confidence`;
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

// ============================================================================
// Field Value Utilities (v3.4.2 — CardDetails.fields key/value metadata)
// ============================================================================

/**
 * Check if a detection includes key/value field properties
 * @param detection - The card detection
 * @returns True if the card has one or more field values
 */
export function hasFields(detection: CardDetection): boolean {
  return Boolean(detection.card.fields && detection.card.fields.length > 0);
}

/**
 * Get all field values from a detection
 * @param detection - The card detection
 * @returns Array of field values, or empty array if none
 */
export function getFields(detection: CardDetection): FieldValue[] {
  return detection.card.fields || [];
}

/**
 * Get a single field value by key (case-insensitive)
 * @param detection - The card detection
 * @param key - The field key to look up (e.g., "HP", "RARITY", "ARTIST")
 * @returns The field value string, or undefined if the key is not present
 */
export function getFieldValue(detection: CardDetection, key: string): string | undefined {
  if (!detection.card.fields) {
    return undefined;
  }
  const target = key.toLowerCase();
  return detection.card.fields.find((f) => f.key.toLowerCase() === target)?.value;
}

/**
 * Format fields as a display string
 * @param detection - The card detection
 * @param separator - String inserted between field entries (default: " · ")
 * @returns Formatted string (e.g., "HP: 120 · Rarity: Holo Rare"), or empty string if no fields
 */
export function formatFieldValues(detection: CardDetection, separator: string = ' · '): string {
  if (!detection.card.fields || detection.card.fields.length === 0) {
    return '';
  }
  return detection.card.fields.map((f) => `${f.key}: ${f.value}`).join(separator);
}

// ============================================================================
// Card Suggestion Utilities (v3.4.2 — alternative card matches)
// ============================================================================

/**
 * Check if a detection provides alternative card suggestions.
 * Suggestions are only returned for Medium/Low confidence detections (v4.0.0+).
 * @param detection - The card detection
 * @returns True if one or more suggestions are present
 */
export function hasSuggestions(detection: CardDetection): boolean {
  return Boolean(detection.card.suggestions && detection.card.suggestions.length > 0);
}

/**
 * Get alternative card suggestions from a detection, best match first.
 * Each entry is a full card record (same fields as `card`), so `formatCardDisplay()` works on it.
 * @param detection - The card detection
 * @returns Array of alternative card suggestions, or empty array if none
 */
export function getSuggestions(detection: CardDetection): CardSuggestion[] {
  return detection.card.suggestions || [];
}

// ============================================================================
// Numbered Card Utilities (v3.4.2 — CardDetails.numberedTo on base cards)
// ============================================================================

/**
 * Check if a detected card is numbered (has a print run, independent of parallels)
 * @param detection - The card detection
 * @returns True if the card itself has a numberedTo value
 */
export function isNumberedCard(detection: CardDetection): boolean {
  return typeof detection.card.numberedTo === 'number';
}

/**
 * Get the print run for a numbered card
 * @param detection - The card detection
 * @returns The print run number, or undefined if the card is not numbered
 */
export function getNumberedTo(detection: CardDetection): number | undefined {
  return detection.card.numberedTo;
}
