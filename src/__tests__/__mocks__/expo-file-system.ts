/**
 * Mock for expo-file-system/legacy
 */
export const documentDirectory = "file:///mock/documents/";

export const EncodingType = {
  UTF8: "utf8",
  Base64: "base64",
};

export const writeAsStringAsync = jest.fn();
export const readAsStringAsync = jest.fn();
export const deleteAsync = jest.fn();
export const getInfoAsync = jest.fn(() => Promise.resolve({ exists: false }));
export const makeDirectoryAsync = jest.fn();
export const copyAsync = jest.fn();
export const readDirectoryAsync = jest.fn(() => Promise.resolve([]));
