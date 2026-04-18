// import nlp from 'compromise'; // Sometimes TS has issues with compromise default import
const nlp = require('compromise');

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
export function extractEntities(text: string): ExtractedEntity[] {
  const doc = nlp(text);
  const entities: ExtractedEntity[] = [];

  // Extract People
  doc.people().json().forEach((p: any) => {
    entities.push({ text: p.text, type: 'PERSON' });
  });

  // Extract Organizations
  doc.organizations().json().forEach((o: any) => {
    entities.push({ text: o.text, type: 'ORG' });
  });

  // Extract Places/Locations
  doc.places().json().forEach((l: any) => {
    entities.push({ text: l.text, type: 'LOCATION' });
  });

  // Simple deduplication and filtering
  return entities
    .map(e => ({
      ...e,
      text: e.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim()
    }))
    .filter((e, index, self) => 
      e.text.length > 1 && 
      self.findIndex(t => t.text === e.text) === index
    );
}
