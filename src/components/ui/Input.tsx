import React from 'react';
import { View, TextInput as RNTextInput, StyleSheet, ViewStyle, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  style?: ViewStyle;
  multiline?: boolean;
  numberOfLines?: number;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  style,
  multiline = false,
  numberOfLines = 1,
}: InputProps) {
  const { isDark, colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text>}
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? colors.surface : '#F3F4F6',
            color: colors.text.primary,
            borderColor: error ? colors.error : colors.border.default,
            height: multiline ? 'auto' : 56,
            minHeight: multiline ? 100 : 56,
            paddingTop: multiline ? 16 : 0,
          },
        ]}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    // color set dynamically
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
