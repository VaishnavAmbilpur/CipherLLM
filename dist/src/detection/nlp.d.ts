/**
 * NLP Intelligence Layer
 * Uses 'compromise' for local NER (Named Entity Recognition).
 */
export interface ExtractedEntity {
    text: string;
    type: string;
}
/**
 * Extracts entities (People, Organizations, Places) from a string.
 */
export declare function extractEntities(text: string): ExtractedEntity[];
//# sourceMappingURL=nlp.d.ts.map