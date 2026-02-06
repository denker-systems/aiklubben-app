import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { MotiView } from 'moti';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useTheme } from '@/contexts/ThemeContext';
import { getUiColors } from '@/config/design';
import { useLanguage } from '@/contexts/LanguageContext';
import { brandColors } from '@/config/theme';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH - 40) * (9 / 16); // 16:9 aspect ratio

interface VideoStepProps {
  content: {
    title: string;
    description?: string;
    video_url: string;
    thumbnail_url?: string;
  };
  onContinue: () => void;
}

const VideoStepComponent: React.FC<VideoStepProps> = ({ content, onContinue }) => {
  const { isDark, colors } = useTheme();
  const ui = getUiColors(isDark);
  const { t, ti } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = React.useRef<Video>(null);

  // Enable continue after video is watched (at least 80%)
  const handlePlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;

      setIsPlaying(status.isPlaying);

      if (status.durationMillis && status.positionMillis) {
        const progressPercent = (status.positionMillis / status.durationMillis) * 100;
        setProgress(progressPercent);

        // Enable continue after watching 80% of video
        if (progressPercent >= 80 && !hasWatched) {
          setHasWatched(true);
          onContinue();
        }
      }
    },
    [hasWatched, onContinue],
  );

  const togglePlay = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPlaying) {
      await videoRef.current?.pauseAsync();
    } else {
      await videoRef.current?.playAsync();
    }
  }, [isPlaying]);

  const toggleMute = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted(!isMuted);
    await videoRef.current?.setIsMutedAsync(!isMuted);
  }, [isMuted]);

  const restartVideo = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await videoRef.current?.setPositionAsync(0);
    await videoRef.current?.playAsync();
  }, []);

  return (
    <MotiView
      style={styles.container}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={SPRING_CONFIGS.smooth}
    >
      {/* Title */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ ...SPRING_CONFIGS.smooth, delay: 100 }}
      >
        <Text variant="h2" style={styles.title} accessibilityRole="header">
          {content.title}
        </Text>
        {content.description && (
          <Text variant="body" style={styles.description}>
            {content.description}
          </Text>
        )}
      </MotiView>

      {/* Video Player */}
      <MotiView
        style={styles.videoContainer}
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING_CONFIGS.smooth, delay: 200 }}
      >
        <Video
          ref={videoRef}
          source={{ uri: content.video_url }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          posterSource={content.thumbnail_url ? { uri: content.thumbnail_url } : undefined}
          usePoster={!!content.thumbnail_url}
        />

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarTrack}>
            <MotiView
              style={styles.progressBarFill}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'timing', duration: 100 }}
            />
          </View>
        </View>

        {/* Video Controls Overlay */}
        <View style={styles.controlsOverlay}>
          {/* Center Play/Pause */}
          <Pressable
            onPress={togglePlay}
            style={styles.playButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? t.steps.pauseVideo : t.steps.playVideo}
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.9)', 'rgba(99, 102, 241, 0.9)']}
              style={styles.playButtonGradient}
            >
              {isPlaying ? (
                <Pause size={32} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
              )}
            </LinearGradient>
          </Pressable>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <Pressable
              onPress={restartVideo}
              style={styles.controlButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t.steps.restartVideo}
            >
              <RotateCcw size={20} color="#FFFFFF" />
            </Pressable>

            <Pressable
              onPress={toggleMute}
              style={styles.controlButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={isMuted ? t.steps.unmute : t.steps.mute}
            >
              {isMuted ? (
                <VolumeX size={20} color="#FFFFFF" />
              ) : (
                <Volume2 size={20} color="#FFFFFF" />
              )}
            </Pressable>
          </View>
        </View>
      </MotiView>

      {/* Watch indicator */}
      <MotiView
        style={styles.watchIndicator}
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SPRING_CONFIGS.smooth, delay: 400 }}
      >
        <Text variant="caption" style={styles.watchText}>
          {hasWatched
            ? t.steps.videoWatched
            : ti(t.steps.videoWatch, { progress: Math.round(progress) })}
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
  title: {
    // color from Text component
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
  },
  description: {
    // color from Text component
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  videoContainer: {
    width: '100%',
    height: VIDEO_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: brandColors.purple,
    borderRadius: 2,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 20,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchIndicator: {
    alignItems: 'center',
    paddingTop: 8,
  },
  watchText: {
    // color from Text component
    fontSize: 14,
  },
});

// Memoized export for performance (Rule 10)
export const VideoStep = memo(VideoStepComponent);
