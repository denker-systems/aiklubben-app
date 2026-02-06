import React, { useEffect, useState, memo } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { Code2, Copy, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { brandColors } from '@/config/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import * as Haptics from 'expo-haptics';

// Screen dimensions available if needed

// Syntax highlighting color scheme (dark theme)
const SYNTAX_COLORS = {
  keyword: '#C792EA', // purple - for keywords like const, let, function
  string: '#C3E88D', // green - for strings
  number: '#F78C6C', // orange - for numbers
  comment: '#546E7A', // gray - for comments
  function: '#82AAFF', // blue - for function names
  variable: '#EEFFFF', // white - for variables
  operator: '#89DDFF', // cyan - for operators
  type: '#FFCB6B', // yellow - for types
};

interface CodeSnippetStepProps {
  content: {
    title: string;
    description?: string;
    code: string;
    language: 'javascript' | 'typescript' | 'python' | 'json' | 'sql';
    explanation?: string;
    runnable?: boolean;
  };
  onContinue: () => void;
}

// Simple syntax highlighter for common patterns
const highlightCode = (code: string, language: string): React.ReactNode[] => {
  const lines = code.split('\n');

  return lines.map((line, lineIndex) => {
    // Simple pattern matching for common syntax elements
    // highlightedLine reserved for future enhanced highlighting
    const elements: React.ReactNode[] = [];

    // Split by whitespace while preserving it
    const tokens = line.split(/(\s+)/);

    tokens.forEach((token, tokenIndex) => {
      let color = SYNTAX_COLORS.variable;
      let fontWeight: '400' | '600' = '400';

      // Keywords
      if (
        /^(const|let|var|function|return|if|else|for|while|import|export|from|class|async|await|try|catch|def|print|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE)$/.test(
          token,
        )
      ) {
        color = SYNTAX_COLORS.keyword;
        fontWeight = '600';
      }
      // Strings
      else if (/^["'`].*["'`]$/.test(token) || /^["'`]/.test(token)) {
        color = SYNTAX_COLORS.string;
      }
      // Numbers
      else if (/^\d+\.?\d*$/.test(token)) {
        color = SYNTAX_COLORS.number;
      }
      // Comments
      else if (token.startsWith('//') || token.startsWith('#')) {
        color = SYNTAX_COLORS.comment;
      }
      // Functions (followed by parenthesis in the original line)
      else if (/^[a-zA-Z_]\w*$/.test(token) && line.includes(`${token}(`)) {
        color = SYNTAX_COLORS.function;
      }
      // Types (PascalCase)
      else if (/^[A-Z][a-zA-Z]*$/.test(token)) {
        color = SYNTAX_COLORS.type;
      }
      // Operators
      else if (/^[=+\-*/<>!&|]+$/.test(token)) {
        color = SYNTAX_COLORS.operator;
      }

      elements.push(
        <Text key={`${lineIndex}-${tokenIndex}`} style={[styles.codeToken, { color, fontWeight }]}>
          {token}
        </Text>,
      );
    });

    return (
      <View key={lineIndex} style={styles.codeLine}>
        <Text style={styles.lineNumber}>{lineIndex + 1}</Text>
        <View style={styles.lineContent}>{elements}</View>
      </View>
    );
  });
};

const CodeSnippetStepComponent: React.FC<CodeSnippetStepProps> = ({ content, onContinue }) => {
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Auto-enable continue after content is shown
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 800);
    return () => clearTimeout(timer);
  }, [onContinue]);

  const handleCopy = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // Note: For full clipboard functionality, install expo-clipboard
  };

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
      json: 'JSON',
      sql: 'SQL',
    };
    return labels[lang] || lang;
  };

  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING_CONFIGS.smooth}
    >
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ ...SPRING_CONFIGS.smooth, delay: 100 }}
      >
        <View style={styles.header}>
          <LinearGradient colors={['#8B5CF6', '#6366f1']} style={styles.iconGradient}>
            <Code2 size={24} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.headerText}>
            <Text variant="h2" style={styles.title} accessibilityRole="header">
              {content.title}
            </Text>
            {content.description && (
              <Text variant="body" style={styles.description}>
                {content.description}
              </Text>
            )}
          </View>
        </View>
      </MotiView>

      {/* Code Block */}
      <MotiView
        style={styles.codeContainer}
        from={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING_CONFIGS.smooth, delay: 200 }}
      >
        {/* Code Header */}
        <View style={styles.codeHeader}>
          <View style={styles.languageBadge}>
            <Text style={styles.languageText}>{getLanguageLabel(content.language)}</Text>
          </View>
          <Pressable
            onPress={handleCopy}
            style={styles.copyButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={copied ? t.steps.codeCopied : t.steps.copyCode}
          >
            {copied ? (
              <Check size={18} color="#10B981" />
            ) : (
              <Copy size={18} color={colors.text.muted} />
            )}
            <Text style={[styles.copyText, { color: colors.text.muted }, copied && styles.copyTextSuccess]}>
              {copied ? t.steps.copied : t.steps.copy}
            </Text>
          </Pressable>
        </View>

        {/* Code Content */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.codeScroll}
          contentContainerStyle={styles.codeScrollContent}
        >
          <View style={styles.codeBlock}>{highlightCode(content.code, content.language)}</View>
        </ScrollView>
      </MotiView>

      {/* Explanation */}
      {content.explanation && (
        <MotiView
          style={styles.explanation}
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: 400 }}
        >
          <Text variant="caption" style={styles.explanationLabel}>
            {t.steps.explanation}
          </Text>
          <Text variant="body" style={[styles.explanationText, { color: colors.text.secondary }]}>
            {content.explanation}
          </Text>
        </MotiView>
      )}

      {/* Read indicator */}
      <MotiView
        style={styles.readIndicator}
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SPRING_CONFIGS.smooth, delay: 600 }}
      >
        <Text variant="caption" style={[styles.readText, { color: colors.text.muted }]}>
          {t.steps.studyCodeAndContinue}
        </Text>
      </MotiView>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    // color from Text component
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  description: {
    // color from Text component
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  codeContainer: {
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  languageBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  languageText: {
    color: brandColors.purple,
    fontSize: 12,
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  copyText: {
    // color set dynamically
    fontSize: 13,
  },
  copyTextSuccess: {
    color: '#10B981',
  },
  codeScroll: {
    maxHeight: 300,
  },
  codeScrollContent: {
    padding: 16,
  },
  codeBlock: {
    minWidth: '100%',
  },
  codeLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 24,
  },
  lineNumber: {
    width: 32,
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 13,
    fontFamily: 'monospace',
    textAlign: 'right',
    marginRight: 16,
  },
  lineContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  codeToken: {
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 22,
  },
  explanation: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  explanationLabel: {
    color: brandColors.purple,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  explanationText: {
    // color set dynamically
    fontSize: 15,
    lineHeight: 24,
  },
  readIndicator: {
    alignItems: 'center',
    paddingTop: 8,
  },
  readText: {
    // color from Text component
    fontSize: 14,
  },
});

// Memoized export for performance (Rule 10)
export const CodeSnippetStep = memo(CodeSnippetStepComponent);
