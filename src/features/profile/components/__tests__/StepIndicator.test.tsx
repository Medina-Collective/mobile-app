import React from 'react';
import { render } from '@testing-library/react-native';
import { StepIndicator } from '../StepIndicator';

describe('StepIndicator', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<StepIndicator currentStep={0} totalSteps={8} />);
    expect(toJSON()).not.toBeNull();
  });

  it('displays the correct step label for step 0', () => {
    const { getByText } = render(<StepIndicator currentStep={0} totalSteps={8} />);
    expect(getByText(/Identity/)).toBeTruthy();
  });

  it('displays the correct step label for step 1', () => {
    const { getByText } = render(<StepIndicator currentStep={1} totalSteps={8} />);
    expect(getByText(/How you operate/)).toBeTruthy();
  });

  it('displays the current step number and total', () => {
    const { getByText } = render(<StepIndicator currentStep={2} totalSteps={8} />);
    expect(getByText(/3 of 8/)).toBeTruthy();
  });

  it('shows the last step label correctly', () => {
    const { getByText } = render(<StepIndicator currentStep={7} totalSteps={8} />);
    expect(getByText(/Review/)).toBeTruthy();
  });

  it('renders with a custom totalSteps without crashing', () => {
    const { toJSON } = render(<StepIndicator currentStep={0} totalSteps={4} />);
    expect(toJSON()).not.toBeNull();
  });
});
