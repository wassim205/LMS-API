process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Use local mongod if available (set by globalSetup or CI env)
if (!process.env.MONGOMS_SYSTEM_BINARY) {
  try {
    const { execSync } = require('child_process');
    const result = execSync(
      process.platform === 'win32' ? 'where.exe mongod' : 'which mongod',
      { encoding: 'utf-8', timeout: 5000 },
    );
    const path = result.trim().split(/\r?\n/)[0];
    if (path) process.env.MONGOMS_SYSTEM_BINARY = path;
  } catch {
    // fall back to download
    process.env.MONGOMS_VERSION = process.env.MONGOMS_VERSION || '7.0.14';
  }
}

jest.setTimeout(120000);
