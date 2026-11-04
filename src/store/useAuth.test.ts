import { beforeEach, describe, expect, it } from 'vitest';
import { useAuth } from './useAuth';

describe('Study Material Authentication (useAuth)', () => {
  beforeEach(() => {
    useAuth.getState().lock();
  });

  it('initializes locked by default', () => {
    expect(useAuth.getState().isAuthenticated).toBe(false);
  });

  it('rejects incorrect passcodes', () => {
    const success = useAuth.getState().unlock('wrong_code');
    expect(success).toBe(false);
    expect(useAuth.getState().isAuthenticated).toBe(false);
  });

  it('unlocks successfully with passcode 357', () => {
    const success = useAuth.getState().unlock('357');
    expect(success).toBe(true);
    expect(useAuth.getState().isAuthenticated).toBe(true);
  });

  it('tolerates whitespace around 357', () => {
    const success = useAuth.getState().unlock('  357  ');
    expect(success).toBe(true);
    expect(useAuth.getState().isAuthenticated).toBe(true);
  });

  it('relocks when lock is called', () => {
    useAuth.getState().unlock('357');
    expect(useAuth.getState().isAuthenticated).toBe(true);
    useAuth.getState().lock();
    expect(useAuth.getState().isAuthenticated).toBe(false);
  });
});
