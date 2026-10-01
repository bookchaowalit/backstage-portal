import type { BackendFeature } from '@backstage/backend-plugin-api';
import appBackend from '@backstage/plugin-app-backend';
import proxyBackend from '@backstage/plugin-proxy-backend';
import scaffolderBackend from '@backstage/plugin-scaffolder-backend';
import scaffolderBackendModuleGithub from '@backstage/plugin-scaffolder-backend-module-github';
import scaffolderBackendModuleNotifications from '@backstage/plugin-scaffolder-backend-module-notifications';
import techdocsBackend from '@backstage/plugin-techdocs-backend';
import authBackend from '@backstage/plugin-auth-backend';
import authBackendModuleGuestProvider from '@backstage/plugin-auth-backend-module-guest-provider';
import authBackendModuleGithubProvider from '@backstage/plugin-auth-backend-module-github-provider';
import catalogBackend from '@backstage/plugin-catalog-backend';
import catalogBackendModuleScaffolderEntityModel from '@backstage/plugin-catalog-backend-module-scaffolder-entity-model';
import catalogBackendModuleLogs from '@backstage/plugin-catalog-backend-module-logs';
import permissionBackend from '@backstage/plugin-permission-backend';
import permissionBackendModuleAllowAllPolicy from '@backstage/plugin-permission-backend-module-allow-all-policy';
import searchBackend from '@backstage/plugin-search-backend';
import searchBackendModulePg from '@backstage/plugin-search-backend-module-pg';
import searchBackendModuleCatalog from '@backstage/plugin-search-backend-module-catalog';
import searchBackendModuleTechdocs from '@backstage/plugin-search-backend-module-techdocs';
import kubernetesBackend from '@backstage/plugin-kubernetes-backend';
import userSettingsBackend from '@backstage/plugin-user-settings-backend';
import notificationsBackend from '@backstage/plugin-notifications-backend';
import signalsBackend from '@backstage/plugin-signals-backend';
import mcpActionsBackend from '@backstage/plugin-mcp-actions-backend';

/**
 * Every plugin and module the backend runs. index.ts adds them in order;
 * routeAccess.test.ts starts the same list so the route access matrix covers
 * the real deployment.
 */
export const backendFeatures: BackendFeature[] = [
  appBackend,
  proxyBackend,

  // scaffolder plugin
  scaffolderBackend,
  scaffolderBackendModuleGithub,
  scaffolderBackendModuleNotifications,

  // techdocs plugin
  techdocsBackend,

  // auth plugin
  authBackend,
  // See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
  authBackendModuleGuestProvider,
  // See https://backstage.io/docs/auth/guest/provider (development only; the
  // provider refuses to authenticate when NODE_ENV is not "development").
  authBackendModuleGithubProvider,
  // See https://backstage.io/docs/auth/github/provider (production sign-in; only
  // initialized when auth.providers.github is configured).

  // catalog plugin
  catalogBackend,
  catalogBackendModuleScaffolderEntityModel,

  // See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
  catalogBackendModuleLogs,

  // permission plugin
  permissionBackend,
  // See https://backstage.io/docs/permissions/getting-started for how to create your own permission policy
  permissionBackendModuleAllowAllPolicy,

  // search plugin
  searchBackend,

  // search engine
  // See https://backstage.io/docs/features/search/search-engines
  searchBackendModulePg,

  // search collators
  searchBackendModuleCatalog,
  searchBackendModuleTechdocs,

  // kubernetes plugin
  kubernetesBackend,

  // user settings plugin
  userSettingsBackend,

  // notifications and signals plugins
  notificationsBackend,
  signalsBackend,

  // mcp actions plugin
  mcpActionsBackend,
];
