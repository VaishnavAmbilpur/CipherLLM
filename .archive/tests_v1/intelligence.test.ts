import { extractEntities } from '../src/detection/nlp';

describe('Phase 4: Intelligence Layer (NLP)', () => {
  
  test('extracts names of people', () => {
    const text = "Shared my plan with Mark Zuckerberg and Bill Gates.";
    const entities = extractEntities(text);
    
    const names = entities.filter(e => e.type === 'PERSON').map(e => e.text);
    expect(names).toContain('Mark Zuckerberg');
    expect(names).toContain('Bill Gates');
  });

  test('extracts organizations', () => {
    const text = "He works at Google and occasionally visits Microsoft.";
    const entities = extractEntities(text);
    
    const orgs = entities.filter(e => e.type === 'ORG').map(e => e.text);
    expect(orgs).toContain('Google');
    expect(orgs).toContain('Microsoft');
  });

  test('extracts locations', () => {
    const text = "Traveling from Mumbai to New York.";
    const entities = extractEntities(text);
    
    const locations = entities.filter(e => e.type === 'LOCATION').map(e => e.text);
    expect(locations).toContain('Mumbai');
    expect(locations).toContain('New York');
  });

  test('handles combined extraction', () => {
    const text = "John Doe from Microsoft went to London.";
    const entities = extractEntities(text);
    
    expect(entities).toContainEqual({ text: 'John Doe', type: 'PERSON' });
    expect(entities).toContainEqual({ text: 'Microsoft', type: 'ORG' });
    expect(entities).toContainEqual({ text: 'London', type: 'LOCATION' });
  });

});

