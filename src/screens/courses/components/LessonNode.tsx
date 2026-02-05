import React, { useCallback, memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import Svg, { Circle, G } from 'react-native-svg';
import { Lock, Star, Check, Sparkles } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import * as Haptics from 'expo-haptics';

type LessonStatus = 'locked' | 'available' | 'current' | 'completed';

interface LessonNodeProps {
  status: LessonStatus;
  progress?: number;
  lessonNumber: number;
  title?: string;
  onPress?: () => void;
  delay?: number;
  size?: 'small' | 'medium' | 'large';
}

// Duolingo-inspired color scheme
const COLORS = {
  locked: {
    face: '#E5E5E5',
    side: '#CACACA',
    shadow: 'rgba(0, 0, 0, 0.15)',
    icon: '#AFAFAF',
  },
  available: {
    face: '#8B5CF6',
    side: '#7C3AED',
    shadow: 'rgba(124, 58, 237, 0.4)',
    icon: '#FFFFFF',
  },
  current: {
    face: '#8B5CF6',
    side: '#7C3AED',
    shadow: 'rgba(124, 58, 237, 0.4)',
    icon: '#FFFFFF',
    ring: '#FCD34D',
    ringTrack: 'rgba(252, 211, 77, 0.3)',
  },
  completed: {
    face: '#10B981',
    side: '#059669',
    shadow: 'rgba(5, 150, 105, 0.4)',
    icon: '#FFFFFF',
  },
};

const SIZES = {
  small: { node: 60, depth: 6, ring: 76, stroke: 5, icon: 24 },
  medium: { node: 72, depth: 8, ring: 92, stroke: 6, icon: 30 },
  large: { node: 84, depth: 10, ring: 108, stroke: 7, icon: 36 },
};

const LessonNodeComponent: React.FC<LessonNodeProps> = ({
  status,
  progress = 0,
  lessonNumber,
  title,
  onPress,
  delay = 0,
  size = 'medium',
}) => {
  const colors = COLORS[status];
  const dimensions = SIZES[size];
  const isInteractive = status !== 'locked';

  // Calculate total height for proper layout (Apple HIG: explicit dimensions)
  const totalHeight = status === 'current' ? dimensions.ring : dimensions.node + dimensions.depth;
  const totalWidth = status === 'current' ? dimensions.ring : dimensions.node;

  const circumference = 2 * Math.PI * ((dimensions.ring - dimensions.stroke) / 2);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Accessibility labels based on status (Rule 07)
  const getAccessibilityLabel = (): string => {
    const baseLabel = `Lektion ${lessonNumber}`;
    switch (status) {
      case 'locked':
        return `${baseLabel}, låst`;
      case 'completed':
        return `${baseLabel}, slutförd`;
      case 'current':
        return `${baseLabel}, pågående, ${progress}% slutförd`;
      case 'available':
        return `${baseLabel}, tillgänglig`;
      default:
        return baseLabel;
    }
  };

  const getAccessibilityHint = (): string => {
    if (status === 'locked') return 'Slutför föregående lektion för att låsa upp';
    if (status === 'completed') return 'Tryck för att öva igen';
    return 'Tryck för att starta lektionen';
  };

  // useCallback for performance (Rule 10)
  const handlePress = useCallback(() => {
    if (isInteractive && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  }, [isInteractive, onPress]);

  const renderIcon = () => {
    const iconSize = dimensions.icon;

    switch (status) {
      case 'locked':
        return <Lock size={iconSize} color={colors.icon} />;
      case 'completed':
        return <Check size={iconSize} color={colors.icon} strokeWidth={3} />;
      case 'current':
        return <Star size={iconSize} color={colors.icon} fill={colors.icon} />;
      case 'available':
        return <Sparkles size={iconSize} color={colors.icon} />;
      default:
        return <Text style={styles.numberText}>{lessonNumber}</Text>;
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING_CONFIGS.bouncy, delay }}
      style={[
        styles.container,
        {
          // CRITICAL: Explicit dimensions for iOS layout
          width: totalWidth,
          height: totalHeight,
        },
      ]}
    >
      {/* Progress Ring for Current Lesson */}
      {status === 'current' && (
        <View style={[styles.ringContainer, { width: dimensions.ring, height: dimensions.ring }]}>
          <Svg width={dimensions.ring} height={dimensions.ring}>
            <G rotation="-90" origin={`${dimensions.ring / 2}, ${dimensions.ring / 2}`}>
              <Circle
                cx={dimensions.ring / 2}
                cy={dimensions.ring / 2}
                r={(dimensions.ring - dimensions.stroke) / 2}
                stroke={COLORS.current.ringTrack}
                strokeWidth={dimensions.stroke}
                fill="transparent"
              />
              <Circle
                cx={dimensions.ring / 2}
                cy={dimensions.ring / 2}
                r={(dimensions.ring - dimensions.stroke) / 2}
                stroke={COLORS.current.ring}
                strokeWidth={dimensions.stroke}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </G>
          </Svg>
        </View>
      )}

      {/* 3D Button - Duolingo style */}
      <Pressable
        onPress={handlePress}
        disabled={!isInteractive}
        style={styles.pressable}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={getAccessibilityLabel()}
        accessibilityHint={getAccessibilityHint()}
        accessibilityState={{
          disabled: !isInteractive,
          selected: status === 'current',
        }}
      >
        {({ pressed }) => (
          <View
            style={[
              styles.button3D,
              {
                width: dimensions.node,
                height: dimensions.node + dimensions.depth,
              },
            ]}
          >
            {/* Bottom layer - 3D depth */}
            <View
              style={[
                styles.buttonBottom,
                {
                  width: dimensions.node,
                  height: dimensions.node,
                  borderRadius: dimensions.node / 2,
                  backgroundColor: colors.side,
                  transform: [
                    {
                      translateY:
                        pressed && isInteractive ? dimensions.depth / 2 : dimensions.depth,
                    },
                  ],
                },
              ]}
            />

            {/* Top layer - button face */}
            <View
              style={[
                styles.buttonFace,
                {
                  width: dimensions.node,
                  height: dimensions.node,
                  borderRadius: dimensions.node / 2,
                  backgroundColor: colors.face,
                  transform: [{ translateY: pressed && isInteractive ? dimensions.depth / 2 : 0 }],
                },
              ]}
            >
              {renderIcon()}
            </View>
          </View>
        )}
      </Pressable>
      {title && (
        <Text style={styles.lessonTitle}>
          {title}
        </Text>
      )}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    // Apple HIG: Use flexbox with explicit dimensions
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    // Ensures proper touch target (Apple HIG: min 44x44 points)
  },
  button3D: {
    // Container for 3D effect layers
    position: 'relative',
  },
  buttonBottom: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  buttonFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    // Android
    elevation: 4,
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  lessonTitle: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    width: 180,
  },
});

// Memoized export for performance (Rule 10)
export const LessonNode = memo(LessonNodeComponent);
