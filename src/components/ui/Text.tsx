import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { textStyles, type TextVariant } from '@theme/typography';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
}

export function Text({ variant = 'body', style, ...props }: TextProps) {
  return <RNText style={[textStyles[variant], style]} {...props} />;
}
