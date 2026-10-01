import { githubProvider, signInProviders } from './providers';

describe('signInProviders', () => {
  it('offers guest and GitHub in development (the default)', () => {
    expect(signInProviders()).toEqual(['guest', githubProvider]);
    expect(signInProviders('development')).toEqual(['guest', githubProvider]);
  });

  it('never offers guest in production', () => {
    expect(signInProviders('production')).toEqual([githubProvider]);
    expect(signInProviders('production')).not.toContain('guest');
  });

  it('uses the GitHub provider id the backend module registers', () => {
    expect(githubProvider.id).toBe('github-auth-provider');
    expect(githubProvider.apiRef.id).toBe('core.auth.github');
  });
});
