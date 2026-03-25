import '@testing-library/jest-native/extend-expect';

// AsyncStorage is a native module — mock it for the Jest (Node) environment.
// The official mock is maintained by the async-storage team and resets between tests.
/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
/* eslint-enable @typescript-eslint/no-require-imports */

// @expo/vector-icons depends on expo-asset (a native module unavailable in Node).
// Return a no-op component for every icon family so any test can import icons freely.
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
  MaterialIcons: () => null,
  FontAwesome: () => null,
  Feather: () => null,
}));
