import path from 'node:path';
import { ConfigSources, FileConfigSource } from '@backstage/config-loader';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import {
  mockCredentials,
  mockServices,
  startTestBackend,
} from '@backstage/backend-test-utils';
import request from 'supertest';
import { backendFeatures } from './features';

/**
 * Route access matrix for the backend.
 *
 * Starts the real plugin list (features.ts) with the committed
 * app-config.yaml, then calls one representative route per plugin, for every
 * state-changing method it serves, as an anonymous caller, a user and a
 * service. Backstage denies unauthenticated requests by default; a plugin
 * route only answers anonymous callers when the plugin declares an
 * `allow: 'unauthenticated'` policy, so this pins which plugins do.
 *
 * Every installed plugin must appear in EXPECTED: adding a plugin to
 * features.ts fails this test until its routes are classified here.
 */

type Level = 'public' | 'user';
type Probe = { method: string; path: string; level: Level; body?: object };

const EXPECTED: Record<string, Probe[]> = {
  app: [{ method: 'GET', path: '/api/app/.config-schema', level: 'public' }],
  proxy: [{ method: 'GET', path: '/api/proxy/unconfigured', level: 'user' }],
  scaffolder: [
    { method: 'GET', path: '/api/scaffolder/v2/actions', level: 'user' },
    {
      method: 'POST',
      path: '/api/scaffolder/v2/tasks',
      level: 'user',
      body: {},
    },
    {
      method: 'POST',
      path: '/api/scaffolder/v2/dry-run',
      level: 'user',
      body: {},
    },
    {
      method: 'POST',
      path: '/api/scaffolder/v2/tasks/x/cancel',
      level: 'user',
    },
  ],
  techdocs: [
    {
      method: 'GET',
      path: '/api/techdocs/metadata/entity/default/component/x',
      level: 'user',
    },
    {
      method: 'GET',
      path: '/api/techdocs/sync/default/component/x',
      level: 'user',
    },
  ],
  // Sign-in endpoints are public by design; the providers do their own checks.
  auth: [
    {
      method: 'GET',
      path: '/api/auth/.well-known/openid-configuration',
      level: 'public',
    },
  ],
  catalog: [
    { method: 'GET', path: '/api/catalog/entities', level: 'user' },
    {
      method: 'POST',
      path: '/api/catalog/locations',
      level: 'user',
      body: { type: 'url', target: 'https://example.test/x.yaml' },
    },
    { method: 'DELETE', path: '/api/catalog/entities/by-uid/x', level: 'user' },
    {
      method: 'POST',
      path: '/api/catalog/refresh',
      level: 'user',
      body: { entityRef: 'component:default/x' },
    },
    {
      method: 'POST',
      path: '/api/catalog/analyze-location',
      level: 'user',
      body: {},
    },
  ],
  permission: [
    {
      method: 'POST',
      path: '/api/permission/authorize',
      level: 'user',
      body: { items: [] },
    },
  ],
  search: [{ method: 'GET', path: '/api/search/query', level: 'user' }],
  kubernetes: [
    { method: 'GET', path: '/api/kubernetes/clusters', level: 'user' },
  ],
  'user-settings': [
    {
      method: 'PUT',
      path: '/api/user-settings/buckets/b/keys/k',
      level: 'user',
      body: { value: 1 },
    },
  ],
  notifications: [
    { method: 'GET', path: '/api/notifications', level: 'user' },
    {
      method: 'POST',
      path: '/api/notifications/update',
      level: 'user',
      body: { ids: [] },
    },
  ],
  // HTTP is only the WebSocket upgrade endpoint, which checks the token in
  // the upgrade handshake; a plain GET is not rejected by the auth layer.
  signals: [{ method: 'GET', path: '/api/signals', level: 'public' }],
  'mcp-actions': [
    { method: 'POST', path: '/api/mcp-actions/v1', level: 'user', body: {} },
  ],
};

const repoRoot = path.resolve(__dirname, '../../..');

async function devConfig(): Promise<Record<string, any>> {
  const source = FileConfigSource.create({
    path: path.join(repoRoot, 'app-config.yaml'),
    watch: false,
    substitutionFunc: async name => `test-${name}`,
  });
  const config = await ConfigSources.toConfig(source);
  try {
    return config.get() as Record<string, any>;
  } finally {
    config.close();
  }
}

describe('backend route access matrix', () => {
  jest.setTimeout(120_000);

  let server: Parameters<typeof request>[0];
  let installed: string[] = [];
  let stop: () => Promise<void>;

  beforeAll(async () => {
    const data = await devConfig();
    // Same config the developer runs, with the catalog emptied so no file
    // locations are read and processing stays idle.
    data.catalog = { ...data.catalog, locations: [] };

    const pluginLister = createBackendPlugin({
      pluginId: 'route-access-audit',
      register(env) {
        env.registerInit({
          deps: { metadata: coreServices.rootInstanceMetadata },
          async init({ metadata }) {
            installed = (await metadata.getInstalledPlugins()).map(
              p => p.pluginId,
            );
          },
        });
      },
    });

    const backend = await startTestBackend({
      features: [
        ...backendFeatures,
        pluginLister,
        mockServices.rootConfig.factory({ data }),
        // Requests without credentials stay anonymous (the mock default is a
        // signed-in user).
        mockServices.httpAuth.factory({
          defaultCredentials: mockCredentials.none(),
        }),
      ],
    });
    server = backend.server;
    stop = () => backend.stop();
  });

  afterAll(async () => {
    await stop?.();
  });

  it('classifies every installed plugin', () => {
    const plugins = installed.filter(id => id !== 'route-access-audit').sort();
    expect(plugins).toEqual(Object.keys(EXPECTED).sort());
  });

  const probes = Object.entries(EXPECTED).flatMap(([pluginId, list]) =>
    list.map(probe => ({ pluginId, ...probe })),
  );

  it.each(probes)(
    '$method $path ($level)',
    async ({ method, path: route, level, body }) => {
      const call = (authorization?: string) => {
        let req =
          request(server)[
            method.toLowerCase() as 'get' | 'post' | 'put' | 'delete'
          ](route);
        if (authorization) req = req.set('Authorization', authorization);
        return body ? req.send(body) : req;
      };

      const anonymous = await call();
      const user = await call(mockCredentials.user.header());
      const service = await call(mockCredentials.service.header());

      // Anonymous callers are rejected by the auth layer exactly when the
      // route is classified as user-level.
      expect(anonymous.status === 401).toBe(level === 'user');
      // Authenticated callers get past the auth layer (any non-401 answer).
      expect(user.status).not.toBe(401);
      expect(service.status).not.toBe(401);
    },
  );
});
