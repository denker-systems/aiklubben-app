import React, { memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, BookOpen } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';

interface UnitHeaderProps {
  title: string;
  subtitle?: string;
  lessonCount: number;
  completedCount: number;
  gradientColors?: readonly [string, string, ...string[]];
  onBack?: () => void;
}

const UnitHeaderComponent: React.FC<UnitHeaderProps> = ({
  title,
  subtitle,
  lessonCount,
  completedCount,
  gradientColors = ['#8B5CF6', '#6366F1'],
  onBack,
}) => {
  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={SPRING_CONFIGS.smooth}
        style={styles.content}
      >
        {/* Back Button - Apple HIG: 44x44 touch target */}
        {onBack && (
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Gå tillbaka"
            accessibilityHint="Navigerar tillbaka till kurslistan"
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </Pressable>
        )}

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text variant="h2" style={styles.title}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="body" style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Progress Badge */}
        <View
          style={styles.progressBadge}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`${completedCount} av ${lessonCount} lektioner slutförda`}
        >
          <BookOpen size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.progressText}>
            {completedCount}/{lessonCount}
          </Text>
        </View>
      </MotiView>

      {/* Decorative Wave */}
      <View style={styles.wave}>
        <View style={styles.waveInner} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titleSection: {
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 16,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  progressText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    overflow: 'hidden',
  },
  waveInner: {
    position: 'absolute',
    bottom: -10,
    left: -20,
    right: -20,
    height: 40,
    backgroundColor: '#0C0A17',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
});

// Memoized export for performance (Rule 10)
export const UnitHeader = memo(UnitHeaderComponent);
