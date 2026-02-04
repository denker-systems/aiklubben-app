import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';

interface ReflectionStepProps {
  content: {
    prompt: string;
    placeholder: string;
    min_words?: number;
  };
  onAnswer: (answer: string) => void;
}

export const ReflectionStep: React.FC<ReflectionStepProps> = ({ content, onAnswer }) => {
  const [text, setText] = useState('');

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minWords = content.min_words || 10;
  const isValid = wordCount >= minWords;

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (newText.trim()) {
      onAnswer(newText);
    }
  };

  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING_CONFIGS.smooth}
    >
      <Text variant="h3" style={styles.prompt}>
        {content.prompt}
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleTextChange}
          placeholder={content.placeholder}
          placeholderTextColor={uiColors.text.muted}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          autoCapitalize="sentences"
        />

        <View style={styles.footer}>
          <Text variant="caption" style={[styles.wordCount, isValid && styles.wordCountValid]}>
            {wordCount} / {minWords} ord
          </Text>
          {!isValid && (
            <Text variant="caption" style={styles.hint}>
              Skriv minst {minWords} ord
            </Text>
          )}
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text variant="caption" style={styles.infoText}>
          💡 Det finns inget rätt eller fel svar. Ta dig tid att reflektera över frågan.
        </Text>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
  },
  prompt: {
    color: uiColors.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: uiColors.card.background,
    borderWidth: 2,
    borderColor: uiColors.card.border,
    borderRadius: 16,
    padding: 16,
    color: uiColors.text.primary,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordCount: {
    color: uiColors.text.muted,
  },
  wordCountValid: {
    color: '#10B981',
    fontWeight: '600',
  },
  hint: {
    color: uiColors.text.muted,
  },
  infoBox: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  infoText: {
    color: uiColors.text.secondary,
    lineHeight: 20,
  },
});
