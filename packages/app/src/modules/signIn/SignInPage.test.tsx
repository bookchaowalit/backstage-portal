import { renderInTestApp } from '@backstage/frontend-test-utils';
import { screen } from '@testing-library/react';
import { SoloSignInPage } from './SignInPage';

function renderFor(environment: string) {
  return renderInTestApp(<SoloSignInPage onSignInSuccess={jest.fn()} />, {
    config: {
      app: { title: 'Test', baseUrl: 'http://localhost:3000' },
      backend: { baseUrl: 'http://localhost:7007' },
      auth: { environment },
    },
  });
}

describe('SoloSignInPage', () => {
  it('offers guest and GitHub sign-in in development', async () => {
    renderFor('development');
    expect(await screen.findByText('Guest')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('offers only GitHub sign-in in production', async () => {
    renderFor('production');
    expect(await screen.findByText('GitHub')).toBeInTheDocument();
    expect(screen.queryByText('Guest')).not.toBeInTheDocument();
  });
});
