// src/detection/detector.ts — Combined PII Detection Orchestrator

import nlp from 'compromise';
import { detectWithRegex } from './regex.js';
import { Detection } from '../types.js';

/**
 * Uses the 'compromise' NLP library to detect unstructured entities.
 * Includes precise character offsets for every occurrence.
 */
export function detectWithNLP(text: string): Detection[] {
  const entities: Detection[] = [];
  
  // Extend for specific Indian names (demonstration)
  const myLexicon = {
    'priya': 'Person',
    'sharma': 'LastName',
  };
  const doc = nlp(text, myLexicon);

  // Helper to extract entities with offsets using the correct compromise format
  const extract = (matches: any, type: string) => {
    // Calling .json({offset:true}) is required to get character positions
    const json = matches.json({ offset: true });
    json.forEach((match: any) => {
      if (match.offset) {
        entities.push({
          original: match.text,
          type,
          start: match.offset.start,
          end: match.offset.start + match.offset.length
        });
      }
    });
  };

  extract(doc.people(), 'PERSON');
  extract(doc.organizations(), 'ORG');
  extract(doc.places(), 'LOCATION');

  return entities;
}

/**
 * The main detection entry point. Runs both Regex and NLP engines.
 * Results are merged and sorted in REVERSE order of position.
 */
export function detect(text: string): Detection[] {
  const regexResults = detectWithRegex(text);
  const nlpResults = detectWithNLP(text);

  // Combine and sort by start position
  const rawResults = [...regexResults, ...nlpResults].sort((a, b) => (a.start ?? 0) - (b.start ?? 0));

  // Deduplicate overlaps — prioritize earlier/regex results
  const filtered: Detection[] = [];
  let lastEnd = -1;

  for (const d of rawResults) {
    const start = d.start ?? 0;
    const end = d.end ?? 0;

    if (start >= lastEnd) {
      filtered.push(d);
      lastEnd = end;
    }
  }

  return filtered.sort((a, b) => (b.start ?? 0) - (a.start ?? 0));
}
