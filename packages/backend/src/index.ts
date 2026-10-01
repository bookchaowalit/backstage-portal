/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import { createBackend } from '@backstage/backend-defaults';
import { backendFeatures } from './features';

const backend = createBackend();

// The plugin and module list lives in features.ts (shared with the route
// access test).
for (const feature of backendFeatures) {
  backend.add(feature);
}

backend.start();
