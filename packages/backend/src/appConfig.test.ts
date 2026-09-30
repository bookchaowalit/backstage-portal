import fs from 'node:fs';
import path from 'node:path';
import { ConfigSources, FileConfigSource } from '@backstage/config-loader';

const repoRoot = path.resolve(__dirname, '../../..');
const backendDir = path.resolve(__dirname, '..');

/**
 * Load the committed config files with a recording substitution function so
 * the tests never read real environment values or secrets.
 */
async function loadConfig(files: string[]) {
  const substituted = new Set<string>();
  const source = ConfigSources.merge(
    files.map(file =>
      FileConfigSource.create({
        path: path.join(repoRoot, file),
        watch: false,
        substitutionFunc: async name => {
          substituted.add(name);
          return `test-${name}`;
        },
      }),
    ),
  );
  const config = await ConfigSources.toConfig(source);
  try {
    return { config: config.get(), substituted, reader: config };
  } finally {
    config.close();
  }
}

type Location = { type: string; target: string };

function fileLocations(locations: Location[] | undefined): Location[] {
  return (locations ?? []).filter(location => location.type === 'file');
}

describe('app-config', () => {
  it('local catalog file locations resolve from the backend package', async () => {
    const { reader } = await loadConfig(['app-config.yaml']);
    const locations = reader.getOptional<Location[]>('catalog.locations');
    const files = fileLocations(locations);
    expect(files.length).toBeGreaterThan(0);
    for (const location of files) {
      // `yarn start` runs the backend with packages/backend as cwd.
      expect(fs.existsSync(path.resolve(backendDir, location.target))).toBe(
        true,
      );
    }
  });

  it('production catalog file locations resolve from the image root', async () => {
    const { reader } = await loadConfig([
      'app-config.yaml',
      'app-config.production.yaml',
    ]);
    const files = fileLocations(
      reader.getOptional<Location[]>('catalog.locations'),
    );
    expect(files.length).toBeGreaterThan(0);
    for (const location of files) {
      // The Dockerfile copies `examples/` and the configs into /app, the cwd.
      expect(fs.existsSync(path.resolve(repoRoot, location.target))).toBe(true);
    }
  });

  it('production takes database and integration secrets only from env', async () => {
    const { reader, substituted } = await loadConfig([
      'app-config.yaml',
      'app-config.production.yaml',
    ]);
    expect(reader.getString('backend.database.client')).toBe('pg');
    expect(reader.getString('backend.database.connection.password')).toBe(
      'test-POSTGRES_PASSWORD',
    );
    for (const name of ['POSTGRES_PASSWORD', 'POSTGRES_USER', 'GITHUB_TOKEN']) {
      expect(substituted.has(name)).toBe(true);
    }
    for (const integration of reader.getOptionalConfigArray(
      'integrations.github',
    ) ?? []) {
      expect(integration.getOptionalString('token') ?? '').toMatch(/^test-/);
    }
  });

  it('keeps the committed config free of literal credentials', () => {
    const credentialPattern =
      /\b(gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/;
    for (const file of fs.readdirSync(repoRoot)) {
      if (!/^app-config.*\.ya?ml$/.test(file)) continue;
      const text = fs.readFileSync(path.join(repoRoot, file), 'utf8');
      expect(credentialPattern.test(text)).toBe(false);
    }
  });
});
