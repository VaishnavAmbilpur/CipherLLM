// src/detection/detector.ts — Combined PII Detection Orchestrator
import nlp from 'compromise';
import { detectWithRegex } from './regex.js';
/**
 * Uses the 'compromise' NLP library to detect unstructured entities.
 * Includes precise character offsets for every occurrence.
 */
export function detectWithNLP(text) {
    const entities = [];
    // Extend for specific Indian names (demonstration)
    const myLexicon = {
        'priya': 'Person',
        'sharma': 'LastName',
    };
    const doc = nlp(text, myLexicon);
    // Helper to extract entities with offsets using the correct compromise format
    const extract = (matches, type) => {
        // Calling .json({offset:true}) is required to get character positions
        const json = matches.json({ offset: true });
        json.forEach((match) => {
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
export function detect(text) {
    var _a, _b;
    const regexResults = detectWithRegex(text);
    const nlpResults = detectWithNLP(text);
    // Combine and sort by start position
    const rawResults = [...regexResults, ...nlpResults].sort((a, b) => { var _a, _b; return ((_a = a.start) !== null && _a !== void 0 ? _a : 0) - ((_b = b.start) !== null && _b !== void 0 ? _b : 0); });
    // Deduplicate overlaps — prioritize earlier/regex results
    const filtered = [];
    let lastEnd = -1;
    for (const d of rawResults) {
        const start = (_a = d.start) !== null && _a !== void 0 ? _a : 0;
        const end = (_b = d.end) !== null && _b !== void 0 ? _b : 0;
        if (start >= lastEnd) {
            filtered.push(d);
            lastEnd = end;
        }
    }
    return filtered.sort((a, b) => { var _a, _b; return ((_a = b.start) !== null && _a !== void 0 ? _a : 0) - ((_b = a.start) !== null && _b !== void 0 ? _b : 0); });
}
