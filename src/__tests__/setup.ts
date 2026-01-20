/**
 * Jest setup file
 * Runs before each test file
 */

// Mock __DEV__ global
(global as unknown as { __DEV__: boolean }).__DEV__ = true;

// Silence console in tests unless explicitly needed
// Uncomment to enable console output in tests:
// global.console = console;
