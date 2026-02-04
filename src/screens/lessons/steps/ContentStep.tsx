import React, { useEffect, memo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { BookOpen } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS, STAGGER_DELAYS } from '@/lib/animations';
import { uiColors } from '@/config/design';
import { brandColors } from '@/config/theme';

interface ContentStepProps {
  content: {
    title: string;
    body: string;
    image_url?: string;
    video_url?: string;
  };
  onContinue: () => void;
}

const ContentStepComponent: React.FC<ContentStepProps> = ({ content, onContinue }) => {
  // Auto-enable continue after content is shown
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 500);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING_CONFIGS.smooth}
    >
      {content.image_url ? (
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.fast }}
        >
          <Image
            source={{ uri: content.image_url }}
            style={styles.image}
            resizeMode="cover"
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel={`Illustration för ${content.title}`}
          />
        </MotiView>
      ) : (
        <MotiView
          style={styles.iconContainer}
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING_CONFIGS.bouncy}
        >
          <BookOpen size={48} color={brandColors.purple} />
        </MotiView>
      )}

      <View style={styles.content} accessible={true} accessibilityRole="text">
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal }}
        >
          <Text variant="h2" style={styles.title} accessibilityRole="header">
            {content.title}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.smooth, delay: STAGGER_DELAYS.normal * 2 }}
        >
          <Text variant="body" style={styles.body}>
            {content.body}
          </Text>
        </MotiView>
      </View>

      <MotiView
        style={styles.readIndicator}
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SPRING_CONFIGS.smooth, delay: 800 }}
      >
        <Text variant="caption" style={styles.readText}>
          📖 Läs och tryck på Fortsätt
        </Text>
      </MotiView>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    marginBottom: 8,
  },
  content: {
    gap: 16,
  },
  title: {
    color: uiColors.text.primary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  body: {
    color: uiColors.text.secondary,
    fontSize: 17,
    lineHeight: 28,
  },
  readIndicator: {
    alignItems: 'center',
    paddingTop: 16,
  },
  readText: {
    color: uiColors.text.muted,
    fontSize: 14,
  },
});

// Memoized export for performance (Rule 10)
export const ContentStep = memo(ContentStepComponent);
