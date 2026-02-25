import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, StepIndicator } from '@/components/ui';
import { SPRING_CONFIGS } from '@/lib/animations';
import { brandColors } from '@/config/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { Locale } from '@/contexts/LanguageContext';
import type { ResolvedTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORAGE_KEY = '@aiklubben_has_started';
const TOTAL_STEPS = 4;

type Region = 'north_america' | 'south_america' | 'europe' | 'africa' | 'asia';

interface StartScreenProps {
  onComplete: () => void;
}

const REGIONS: { id: Region; emoji: string; labelKey: string }[] = [
  { id: 'north_america', emoji: '🌎', labelKey: 'regionNorthAmerica' },
  { id: 'south_america', emoji: '🌎', labelKey: 'regionSouthAmerica' },
  { id: 'europe', emoji: '🌍', labelKey: 'regionEurope' },
  { id: 'africa', emoji: '🌍', labelKey: 'regionAfrica' },
  { id: 'asia', emoji: '🌏', labelKey: 'regionAsia' },
];

const LANGUAGES: { id: Locale; emoji: string; labelKey: string }[] = [
  { id: 'sv', emoji: '🇸🇪', labelKey: 'langSwedish' },
  { id: 'en', emoji: '🇬🇧', labelKey: 'langEnglish' },
];

const THEMES: { id: ResolvedTheme; emoji: string; labelKey: string }[] = [
  { id: 'light', emoji: '☀️', labelKey: 'themeLight' },
  { id: 'dark', emoji: '🌙', labelKey: 'themeDark' },
];

export const StartScreen: React.FC<StartScreenProps> = ({ onComplete }) => {
  const insets = useSafeAreaInsets();
  const { t, setLocale } = useLanguage();
  const { isDark, colors, setTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedLang, setSelectedLang] = useState<Locale | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ResolvedTheme>('light');

  const goNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => s + 1);
  }, []);

  const handleRegionSelect = useCallback(
    (region: Region) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedRegion(region);
      if (region === 'europe' || region === 'south_america') {
        setSelectedLang('sv');
      } else {
        setSelectedLang('en');
      }
      setTimeout(goNext, 300);
    },
    [goNext],
  );

  const handleLangSelect = useCallback(
    (lang: Locale) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedLang(lang);
      setLocale(lang);
      setTimeout(goNext, 300);
    },
    [goNext, setLocale],
  );

  const handleThemeSelect = useCallback(
    (theme: ResolvedTheme) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedTheme(theme);
      setTheme(theme);
      setTimeout(goNext, 400);
    },
    [goNext, setTheme],
  );

  const handleGetStarted = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    onComplete();
  }, [onComplete]);

  // Dynamic colors based on current theme
  const bg = isDark
    ? [brandColors.deepDark, '#1a1040', brandColors.darkBg]
    : ['#F8F7FF', '#EDE9FE', '#F3F0FF'];
  const textColor = colors.text.primary;
  const subtextColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const selectedBg = isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)';

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <RegionStep
            t={t}
            selected={selectedRegion}
            onSelect={handleRegionSelect}
            textColor={textColor}
            cardBg={cardBg}
            cardBorder={cardBorder}
            selectedBg={selectedBg}
          />
        );
      case 1:
        return (
          <LanguageStep
            t={t}
            selected={selectedLang}
            onSelect={handleLangSelect}
            textColor={textColor}
            cardBg={cardBg}
            cardBorder={cardBorder}
            selectedBg={selectedBg}
          />
        );
      case 2:
        return (
          <ThemeStep
            t={t}
            selected={selectedTheme}
            onSelect={handleThemeSelect}
            textColor={textColor}
            cardBg={cardBg}
            cardBorder={cardBorder}
            selectedBg={selectedBg}
          />
        );
      case 3:
        return (
          <WelcomeStep
            t={t}
            onGetStarted={handleGetStarted}
            textColor={textColor}
            subtextColor={subtextColor}
          />
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={bg as [string, string, string]} style={styles.container}>
      <View
        style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}
      >
        <View style={styles.stepContent}>{renderStep()}</View>
        <StepIndicator
          total={TOTAL_STEPS}
          current={step}
          inactiveColor={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
        />
      </View>
    </LinearGradient>
  );
};

// --- Step Components ---

interface ThemedStepProps {
  t: any;
  textColor: string;
  cardBg: string;
  cardBorder: string;
  selectedBg: string;
}

const RegionStep: React.FC<
  ThemedStepProps & { selected: Region | null; onSelect: (r: Region) => void }
> = ({ t, selected, onSelect, textColor, cardBg, cardBorder, selectedBg }) => (
  <MotiView
    from={{ opacity: 0, translateY: 30 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={SPRING_CONFIGS.smooth}
    style={styles.stepInner}
  >
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING_CONFIGS.bouncy, delay: 100 }}
    >
      <Text style={styles.emoji}>🌐</Text>
    </MotiView>
    <Text variant="h1" weight="bold" style={[styles.title, { color: textColor }]}>
      {t.start.iAmFrom}
    </Text>
    <View style={styles.optionsGrid}>
      {REGIONS.map((region, index) => (
        <MotiView
          key={region.id}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.snappy, delay: 200 + index * 80 }}
        >
          <OptionCard
            emoji={region.emoji}
            label={(t.start as any)[region.labelKey]}
            selected={selected === region.id}
            onPress={() => onSelect(region.id)}
            textColor={textColor}
            cardBg={cardBg}
            cardBorder={cardBorder}
            selectedBg={selectedBg}
          />
        </MotiView>
      ))}
    </View>
  </MotiView>
);

const LanguageStep: React.FC<
  ThemedStepProps & { selected: Locale | null; onSelect: (l: Locale) => void }
> = ({ t, selected, onSelect, textColor, cardBg, cardBorder, selectedBg }) => (
  <MotiView
    from={{ opacity: 0, translateY: 30 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={SPRING_CONFIGS.smooth}
    style={styles.stepInner}
  >
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING_CONFIGS.bouncy, delay: 100 }}
    >
      <Text style={styles.emoji}>💬</Text>
    </MotiView>
    <Text variant="h1" weight="bold" style={[styles.title, { color: textColor }]}>
      {t.start.iSpeak}
    </Text>
    <View style={styles.langOptions}>
      {LANGUAGES.map((lang, index) => (
        <MotiView
          key={lang.id}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.snappy, delay: 200 + index * 100 }}
        >
          <OptionCard
            emoji={lang.emoji}
            label={(t.start as any)[lang.labelKey]}
            selected={selected === lang.id}
            onPress={() => onSelect(lang.id)}
            large
            textColor={textColor}
            cardBg={cardBg}
            cardBorder={cardBorder}
            selectedBg={selectedBg}
          />
        </MotiView>
      ))}
    </View>
  </MotiView>
);

const ThemeStep: React.FC<
  ThemedStepProps & { selected: ResolvedTheme; onSelect: (t: ResolvedTheme) => void }
> = ({ t, selected, onSelect, textColor, cardBg, cardBorder, selectedBg }) => (
  <MotiView
    from={{ opacity: 0, translateY: 30 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={SPRING_CONFIGS.smooth}
    style={styles.stepInner}
  >
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING_CONFIGS.bouncy, delay: 100 }}
    >
      <Text style={styles.emoji}>🎨</Text>
    </MotiView>
    <Text variant="h1" weight="bold" style={[styles.title, { color: textColor }]}>
      {t.start.chooseTheme}
    </Text>
    <View style={styles.langOptions}>
      {THEMES.map((theme, index) => (
        <MotiView
          key={theme.id}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ ...SPRING_CONFIGS.snappy, delay: 200 + index * 100 }}
        >
          <OptionCard
            emoji={theme.emoji}
            label={(t.start as any)[theme.labelKey]}
            selected={selected === theme.id}
            onPress={() => onSelect(theme.id)}
            large
            textColor={textColor}
            cardBg={cardBg}
            cardBorder={cardBorder}
            selectedBg={selectedBg}
          />
        </MotiView>
      ))}
    </View>
  </MotiView>
);

const WelcomeStep: React.FC<{
  t: any;
  onGetStarted: () => void;
  textColor: string;
  subtextColor: string;
}> = ({ t, onGetStarted, textColor, subtextColor }) => (
  <MotiView
    from={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={SPRING_CONFIGS.bouncy}
    style={styles.welcomeInner}
  >
    <MotiView
      from={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING_CONFIGS.celebratory, delay: 200 }}
    >
      <Text style={styles.welcomeEmoji}>🚀</Text>
    </MotiView>
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ ...SPRING_CONFIGS.smooth, delay: 400 }}
    >
      <Text variant="h1" weight="bold" style={[styles.welcomeTitle, { color: textColor }]}>
        {t.start.welcome}
      </Text>
    </MotiView>
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ ...SPRING_CONFIGS.smooth, delay: 550 }}
    >
      <Text variant="body" style={[styles.welcomeSubtitle, { color: subtextColor }]}>
        {t.start.welcomeSubtitle}
      </Text>
    </MotiView>
    <MotiView
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ ...SPRING_CONFIGS.smooth, delay: 700 }}
    >
      <View style={styles.ctaWrapper}>
        <Pressable onPress={onGetStarted}>
          <LinearGradient
            colors={[brandColors.purple, brandColors.darkPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaButton}
          >
            <Text variant="body-lg" weight="bold" style={styles.ctaText}>
              {t.start.getStarted}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </MotiView>
  </MotiView>
);

// --- Shared Option Card ---

interface OptionCardProps {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
  large?: boolean;
  textColor: string;
  cardBg: string;
  cardBorder: string;
  selectedBg: string;
}

const OptionCard: React.FC<OptionCardProps> = ({
  emoji,
  label,
  selected,
  onPress,
  large,
  textColor,
  cardBg,
  cardBorder,
  selectedBg,
}) => (
  <View
    style={[
      styles.optionCard,
      {
        backgroundColor: selected ? selectedBg : cardBg,
        borderColor: selected ? brandColors.purple : cardBorder,
      },
      large && styles.optionCardLarge,
    ]}
  >
    <Pressable onPress={onPress} style={styles.optionPressable}>
      <Text style={[styles.optionEmoji, large && styles.optionEmojiLarge]}>{emoji}</Text>
      <Text
        variant={large ? 'body-lg' : 'body'}
        weight="bold"
        style={[styles.optionLabel, { color: textColor }]}
      >
        {label}
      </Text>
    </Pressable>
  </View>
);

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepInner: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 28,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    width: '100%',
    maxWidth: SCREEN_WIDTH - 48,
  },
  langOptions: {
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    paddingHorizontal: 20,
  },
  optionCard: {
    borderRadius: 20,
    borderWidth: 2,
    width: (SCREEN_WIDTH - 48 - 14) / 2,
    overflow: 'hidden',
  },
  optionCardLarge: {
    width: '100%',
  },
  optionPressable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  optionEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  optionEmojiLarge: {
    fontSize: 44,
  },
  optionLabel: {
    textAlign: 'center',
  },
  welcomeInner: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  welcomeEmoji: {
    fontSize: 80,
    marginBottom: 24,
    textAlign: 'center',
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 30,
    lineHeight: 38,
  },
  welcomeSubtitle: {
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 20,
    fontSize: 17,
    lineHeight: 26,
  },
  ctaWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  ctaButton: {
    paddingVertical: 18,
    paddingHorizontal: 56,
    borderRadius: 20,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});
