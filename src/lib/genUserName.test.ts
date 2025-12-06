import { describe, it, expect } from 'vitest';
import { genUserName } from './genUserName';

describe('genUserName', () => {
  it('generates a truncated npub from a pubkey', () => {
    // Typical hex pubkey (64 characters)
    const pubkey = 'e4690a13290739da123aa17d553851dec4cdd0e9d89aa18de3741c446caf8761';
    const name = genUserName(pubkey);
    
    // Should return truncated npub format
    expect(name).toMatch(/^npub1.{4}\.\.\..{4}$/);
    expect(name.startsWith('npub1')).toBe(true);
    expect(name).toContain('...');
  });

  it('generates consistent names for the same pubkey', () => {
    const pubkey = 'e4690a13290739da123aa17d553851dec4cdd0e9d89aa18de3741c446caf8761';
    const name1 = genUserName(pubkey);
    const name2 = genUserName(pubkey);
    
    expect(name1).toEqual(name2);
  });

  it('generates different truncated npubs for different pubkeys', () => {
    const pubkey1 = 'e4690a13290739da123aa17d553851dec4cdd0e9d89aa18de3741c446caf8761';
    const pubkey2 = 'f4690a13290739da123aa17d553851dec4cdd0e9d89aa18de3741c446caf8762';
    
    const name1 = genUserName(pubkey1);
    const name2 = genUserName(pubkey2);
    
    expect(name1).not.toBe(name2);
  });
});