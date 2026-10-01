import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';

/** Replaces the default guest-only sign-in page (`sign-in-page:app`). */
export const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => {
      const { SoloSignInPage } = await import('./SignInPage');
      return SoloSignInPage;
    },
  },
});

export const signInModule = createFrontendModule({
  pluginId: 'app',
  extensions: [signInPage],
});
