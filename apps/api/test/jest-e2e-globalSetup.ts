import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Jest globalSetup – runs BEFORE any test suite and is NOT subject to
 * per-test / per-hook timeouts.
 *
 * We use it to ensure the MongoDB binary is ready so that
 * `MongoMemoryServer.create()` inside each test's `beforeAll`
 * completes almost instantly.
 */
export default async function globalSetup() {
  // Use locally installed mongod if available (skip 600MB download)
  process.env.MONGOMS_SYSTEM_BINARY =
    process.env.MONGOMS_SYSTEM_BINARY || findSystemMongod();

  console.log(
    `\n[globalSetup] Using mongod: ${process.env.MONGOMS_SYSTEM_BINARY || 'download'}`,
  );

  const server = await MongoMemoryServer.create();
  await server.stop();
  console.log('[globalSetup] MongoDB binary ready.\n');
}

function findSystemMongod(): string | undefined {
  try {
    const { execSync } = require('child_process');
    const result = execSync(
      process.platform === 'win32' ? 'where.exe mongod' : 'which mongod',
      { encoding: 'utf-8', timeout: 5000 },
    );
    const path = result.trim().split(/\r?\n/)[0];
    if (path) return path;
  } catch {
    // mongod not in PATH – fall back to MMS download
  }
  return undefined;
}
