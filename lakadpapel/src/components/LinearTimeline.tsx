import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RoadmapStep } from '../context/types';
import { colors, spacing, radii, typography, shadows } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface LinearTimelineProps {
  roadmap: RoadmapStep[];
  onMilestonePress?: (step: RoadmapStep) => void;
}

function PulsingOuterRing({ color }: { color: string }) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.45],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 0],
  });

  return (
    <Animated.View
      style={[
        styles.pulsingRing,
        {
          transform: [{ scale }],
          opacity,
          borderColor: color,
        },
      ]}
    />
  );
}

export default function LinearTimeline({ roadmap, onMilestonePress }: LinearTimelineProps) {
  const { colors: themeColors, isDarkMode } = useTheme();
  const { t } = useLanguage();

  if (roadmap.length === 0) return null;

  // Identify index of first active step (first step that is not completed)
  const activeIndex = roadmap.findIndex((step) => !step.isDone);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
      <Text style={[styles.sectionTitle, { color: themeColors.subText }]}>{t.documentJourneyMap}</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {roadmap.map((step, index) => {
          const isDone = step.isDone;
          const isActive = index === activeIndex;

          let badgeColor: string = isDarkMode ? '#404040' : colors.borderSubtle;
          let labelColor: string = themeColors.subText;
          let borderStyle: 'solid' | 'dashed' = 'dashed';

          if (isDone) {
            badgeColor = colors.tertiaryGreen;
            labelColor = colors.tertiaryGreen;
            borderStyle = 'solid';
          } else if (isActive) {
            badgeColor = themeColors.primary;
            labelColor = themeColors.primary;
          }

          // Truncate label for clean visual presentation
          const shortLabel = step.document.label.length > 15 
            ? `${step.document.label.slice(0, 13)}..` 
            : step.document.label;

          return (
            <View key={`milestone-${step.document.id}-${index}`} style={styles.milestoneWrapper}>
              {/* Milestone Indicator Row */}
              <View style={styles.indicatorRow}>
                {/* Connecting Line to next milestone (except last) */}
                {index < roadmap.length - 1 && (
                  <View
                    style={[
                      styles.connectorLine,
                      {
                        borderStyle,
                        borderColor: isDone ? colors.tertiaryGreen : themeColors.border,
                      },
                    ]}
                  />
                )}

                {/* Circular Badge Button */}
                <TouchableOpacity
                  style={[styles.badge, { backgroundColor: badgeColor }]}
                  activeOpacity={onMilestonePress ? 0.7 : 1}
                  onPress={() => onMilestonePress && onMilestonePress(step)}
                >
                  {/* Pulsing ring for the next available/active step */}
                  {isActive && <PulsingOuterRing color={themeColors.primary} />}

                  {isDone ? (
                    <Ionicons name="checkmark-sharp" size={16} color={colors.white} />
                  ) : (
                    <Text style={styles.badgeText}>{index + 1}</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Text Metadata */}
              <TouchableOpacity
                onPress={() => onMilestonePress && onMilestonePress(step)}
                activeOpacity={0.7}
                style={styles.labelCol}
              >
                <Text style={[styles.agencyAbbr, { color: labelColor }]}>
                  {step.document.agency}
                </Text>
                <Text style={[
                  styles.milestoneLabel, 
                  { color: themeColors.subText },
                  isActive && [styles.milestoneLabelActive, { color: themeColors.text }]
                ]}>
                  {shortLabel}
                </Text>
                {isActive && (
                  <View style={[styles.activeTextBadge, { backgroundColor: themeColors.primary }]}>
                    <Text style={styles.activeText}>{t.nextStep}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radii.md,
    marginHorizontal: 24,
    marginVertical: 12,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  sectionTitle: {
    ...typography.sectionHeader,
    fontSize: 11,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    color: colors.gray500, // Fallback
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  milestoneWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minWidth: 125,
  },
  indicatorRow: {
    alignItems: 'center',
    position: 'relative',
    height: 36,
  },
  connectorLine: {
    position: 'absolute',
    left: 28,
    right: -100, // stretches to next node center
    top: 18,
    borderTopWidth: 2,
    height: 0,
    zIndex: 1,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    position: 'relative',
  },
  badgeText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  pulsingRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: radii.full,
    borderWidth: 2.5,
  },
  labelCol: {
    position: 'absolute',
    top: 42,
    left: -20,
    width: 76,
    alignItems: 'center',
  },
  agencyAbbr: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  milestoneLabel: {
    ...typography.caption,
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
  },
  milestoneLabelActive: {
    fontFamily: 'Inter_600SemiBold',
  },
  activeTextBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 4,
  },
  activeText: {
    color: colors.white,
    fontSize: 7,
    fontWeight: 'bold',
  },
});
