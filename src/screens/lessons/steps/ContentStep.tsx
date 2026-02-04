import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { uiColors } from '@/config/design';

interface ContentStepProps {
  content: {
    title: string;
    body: string;
    image_url?: string;
    video_url?: string;
  };
  onContinue: () => void;
}

export const ContentStep: React.FC<ContentStepProps> = ({ content, onContinue }) => {
  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING_CONFIGS.smooth}
    >
      {content.image_url && (
        <Image source={{ uri: content.image_url }} style={styles.image} resizeMode="cover" />
      )}

      <View style={styles.content}>
        <Text variant="h2" style={styles.title}>
          {content.title}
        </Text>

        <Text variant="body" style={styles.body}>
          {content.body}
        </Text>
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  content: {
    gap: 16,
  },
  title: {
    color: uiColors.text.primary,
    marginBottom: 8,
  },
  body: {
    color: uiColors.text.secondary,
    lineHeight: 24,
  },
});
