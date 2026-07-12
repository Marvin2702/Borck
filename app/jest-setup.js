// Jest-Setup: AsyncStorage durch den offiziellen In-Memory-Mock ersetzen.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
