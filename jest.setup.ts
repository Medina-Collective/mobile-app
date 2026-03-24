import '@testing-library/jest-native/extend-expect';

// AsyncStorage is a native module — mock it for the Jest (Node) environment.
// The official mock is maintained by the async-storage team and resets between tests.
/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
/* eslint-enable @typescript-eslint/no-require-imports */

// @expo/vector-icons uses expo-asset which is not available in the Jest (Node)
// environment. Mock the entire package globally so any component that imports
// Ionicons (or any other icon set) renders null without crashing.
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
  MaterialIcons: () => null,
  FontAwesome: () => null,
  Feather: () => null,
}));
