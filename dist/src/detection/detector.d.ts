import { Detection } from '../types.js';
/**
 * Uses the 'compromise' NLP library to detect unstructured entities.
 * Includes precise character offsets for every occurrence.
 */
export declare function detectWithNLP(text: string): Detection[];
/**
 * The main detection entry point. Runs both Regex and NLP engines.
 * Results are merged and sorted in REVERSE order of position.
 */
export declare function detect(text: string): Detection[];
//# sourceMappingURL=detector.d.ts.map