import { SignInPage } from '@backstage/core-components';
import {
  configApiRef,
  type SignInPageProps,
  useApi,
} from '@backstage/core-plugin-api';
import { signInProviders } from './providers';

export function SoloSignInPage(props: SignInPageProps) {
  const config = useApi(configApiRef);
  const environment = config.getOptionalString('auth.environment');
  return (
    <SignInPage
      {...props}
      title="Solo Empire"
      providers={signInProviders(environment)}
    />
  );
}
