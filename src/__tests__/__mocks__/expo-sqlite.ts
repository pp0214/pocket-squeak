/**
 * Mock for expo-sqlite
 */
export const openDatabaseAsync = jest.fn(() =>
  Promise.resolve({
    execAsync: jest.fn(),
    runAsync: jest.fn(() => Promise.resolve({ lastInsertRowId: 1 })),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(() => Promise.resolve([])),
    closeAsync: jest.fn(),
  }),
);
