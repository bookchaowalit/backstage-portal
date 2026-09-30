import { githubAuthApiRef } from '@backstage/core-plugin-api';
import type { IdentityProviders } from '@backstage/core-components';

export const githubProvider = {
  id: 'github-auth-provider',
  title: 'GitHub',
  message: 'Sign in using GitHub',
  apiRef: githubAuthApiRef,
};

/**
 * Sign-in options for an `auth.environment` value.
 *
 * The backend guest provider refuses to authenticate outside development, so
 * production only offers GitHub. Development keeps guest first for a
 * zero-setup local portal and offers GitHub when it is configured.
 */
export function signInProviders(environment?: string): IdentityProviders {
  if ((environment ?? 'development') === 'development') {
    return ['guest', githubProvider];
  }
  return [githubProvider];
}
