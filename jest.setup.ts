import '@testing-library/jest-native/extend-expect';

// AsyncStorage is a native module — mock it for the Jest (Node) environment.
// The official mock is maintained by the async-storage team and resets between tests.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
