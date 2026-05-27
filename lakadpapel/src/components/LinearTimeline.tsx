import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RoadmapStep } from '../context/types';
import { colors, spacing, radii, typography, shadows } from '../theme';

interface LinearTimelineProps {
  roadmap: RoadmapStep[];
  onMilestonePress?: (step: RoadmapStep) => void;
}

function PulsingOuterRing() {
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
        },
      ]}
    />
  );
}

export default function LinearTimeline({ roadmap, onMilestonePress }: LinearTimelineProps) {
  if (roadmap.length === 0) return null;

  // Identify index of first active step (first step that is not completed)
  const activeIndex = roadmap.findIndex((step) => !step.isDone);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Document Journey Map</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {roadmap.map((step, index) => {
          const isDone = step.isDone;
          const isActive = index === activeIndex;
          const isFuture = index > activeIndex;

          let badgeColor = colors.gray300;
          let labelColor = colors.gray500;
          let borderStyle: 'solid' | 'dashed' = 'dashed';

          if (isDone) {
            badgeColor = colors.green600;
            labelColor = colors.green600;
            borderStyle = 'solid';
          } else if (isActive) {
            badgeColor = colors.teal600;
            labelColor = colors.teal600;
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
                        borderColor: isDone ? colors.green600 : colors.gray200,
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
                  {isActive && <PulsingOuterRing />}

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
                <Text style={[styles.milestoneLabel, isActive && styles.milestoneLabelActive]}>
                  {shortLabel}
                </Text>
                {isActive && (
                  <View style={styles.activeTextBadge}>
                    <Text style={styles.activeText}>NEXT STEP</Text>
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
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
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
    borderColor: colors.teal600,
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
    color: colors.gray500,
    textAlign: 'center',
  },
  milestoneLabelActive: {
    color: colors.gray900,
    fontFamily: 'Inter_600SemiBold',
  },
  activeTextBadge: {
    backgroundColor: colors.teal600,
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
