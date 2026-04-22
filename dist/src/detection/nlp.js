// import nlp from 'compromise'; // Sometimes TS has issues with compromise default import
const nlp = require('compromise');
/**
 * Extracts entities (People, Organizations, Places) from a string.
 */
export function extractEntities(text) {
    const doc = nlp(text);
    const entities = [];
    // Extract People
    doc.people().json().forEach((p) => {
        entities.push({ text: p.text, type: 'PERSON' });
    });
    // Extract Organizations
    doc.organizations().json().forEach((o) => {
        entities.push({ text: o.text, type: 'ORG' });
    });
    // Extract Places/Locations
    doc.places().json().forEach((l) => {
        entities.push({ text: l.text, type: 'LOCATION' });
    });
    // Simple deduplication and filtering
    return entities
        .map(e => (Object.assign(Object.assign({}, e), { text: e.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim() })))
        .filter((e, index, self) => e.text.length > 1 &&
        self.findIndex(t => t.text === e.text) === index);
}
