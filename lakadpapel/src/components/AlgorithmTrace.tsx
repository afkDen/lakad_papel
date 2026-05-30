import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TraceStep } from '../algorithms/topologicalSort';
import { REQUIREMENTS_GRAPH } from '../algorithms/requirementsGraph';
import { colors, spacing, radii, typography, shadows } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface AlgorithmTraceProps {
  trace: TraceStep[];
  subgraphEmpty: boolean;
}

export default function AlgorithmTrace({ trace, subgraphEmpty }: AlgorithmTraceProps) {
  const { colors: themeColors, isDarkMode } = useTheme();
  const { t } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimer = useRef<any>(null);

  // Reset indices when trace changes (e.g. target document changes)
  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
    if (playTimer.current) {
      clearInterval(playTimer.current);
    }
  }, [trace]);

  // Autoplay functionality
  useEffect(() => {
    if (isPlaying) {
      playTimer.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= trace.length - 1) {
            setIsPlaying(false);
            if (playTimer.current) clearInterval(playTimer.current);
            return prev;
          }
          return prev + 1;
        });
      }, 950); // Slightly adjusted from 800ms for readable pacing
    } else {
      if (playTimer.current) {
        clearInterval(playTimer.current);
      }
    }

    return () => {
      if (playTimer.current) clearInterval(playTimer.current);
    };
  }, [isPlaying, trace]);

  const handlePlayPause = () => {
    if (trace.length === 0) return;
    if (currentIndex >= trace.length - 1 && !isPlaying) {
      setCurrentIndex(0); // restart if at the end
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.min(trace.length - 1, prev + 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const getDocLabel = (id: string) => {
    return REQUIREMENTS_GRAPH[id]?.label || id;
  };

  if (subgraphEmpty || trace.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: isDarkMode ? '#1e1e1e' : colors.backgroundPaperLight, borderColor: themeColors.border }]}>
        <Ionicons name="git-network-outline" size={24} color={themeColors.subText} style={styles.emptyIcon} />
        <Text style={[styles.emptyText, { color: themeColors.subText }]}>
          {t.traceSelectActive}
        </Text>
      </View>
    );
  }

  const currentStep = trace[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
      {/* Header Info */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <View style={styles.headerTitleCol}>
          <Text style={[styles.title, { color: themeColors.text }]}>{t.algorithmTraceTitle}</Text>
          <Text style={[styles.subtitle, { color: themeColors.subText }]}>{t.algorithmTraceSub}</Text>
        </View>
        <View style={[styles.stepBadge, { backgroundColor: isDarkMode ? '#262626' : colors.gray900 }]}>
          <Text style={styles.stepBadgeText}>
            {t.stepWord} {currentIndex + 1} {t.ofWord} {trace.length}
          </Text>
        </View>
      </View>

      {/* Main step details card */}
      <View style={[styles.detailsCard, { borderColor: themeColors.border }]}>
        {/* Step Dequeued Node Banner */}
        <View style={[
          styles.dequeuedBanner, 
          { 
            backgroundColor: isDarkMode ? '#1e293b' : '#eff6ff', 
            borderBottomColor: isDarkMode ? '#334155' : '#bfdbfe' 
          }
        ]}>
          <View style={styles.circleNumber}>
            <Text style={styles.circleNumberText}>{currentIndex + 1}</Text>
          </View>
          <View style={styles.dequeuedInfo}>
            <Text style={[styles.bannerLabel, { color: isDarkMode ? '#93c5fd' : '#1e40af' }]}>
              {t.dequeuedNode}
            </Text>
            <Text style={[styles.dequeuedNodeName, { color: themeColors.text }]}>
              {getDocLabel(currentStep.dequeued)}
            </Text>
          </View>
        </View>

        {/* Queue States */}
        <View style={[styles.stateRow, { borderBottomColor: themeColors.border }]}>
          <View style={[styles.stateCol, { borderRightColor: themeColors.border }]}>
            <Text style={[styles.stateLabel, { color: themeColors.subText }]}>{t.queueBefore}</Text>
            {currentStep.queueBefore.length === 0 ? (
              <Text style={[styles.emptyQueueText, { color: themeColors.subText }]}>{t.emptyBrackets}</Text>
            ) : (
              <View style={styles.queueContainer}>
                {currentStep.queueBefore.map((id, index) => (
                  <View key={`before-${id}-${index}`} style={[styles.queueItem, { backgroundColor: isDarkMode ? '#404040' : colors.borderSubtle }]}>
                    <Text style={[styles.queueItemText, { color: themeColors.text }]}>
                      {REQUIREMENTS_GRAPH[id]?.agency || id}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.stateCol}>
            <Text style={[styles.stateLabel, { color: themeColors.subText }]}>{t.queueAfter}</Text>
            {currentStep.queueAfter.length === 0 ? (
              <Text style={[styles.emptyQueueText, { color: themeColors.subText }]}>{t.emptyBrackets}</Text>
            ) : (
              <View style={styles.queueContainer}>
                {currentStep.queueAfter.map((id, index) => (
                  <View 
                    key={`after-${id}-${index}`} 
                    style={[
                      styles.queueItem, 
                      styles.queueItemNew,
                      { 
                        backgroundColor: isDarkMode ? '#0d3c3c' : '#ccfbf1',
                        borderColor: isDarkMode ? '#115e59' : '#99f6e4'
                      }
                    ]}
                  >
                    <Text style={[styles.queueItemText, { color: isDarkMode ? '#5eead4' : colors.gray900 }]}>
                      {REQUIREMENTS_GRAPH[id]?.agency || id}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* In-Degree Decrements list */}
        <View style={[styles.decSection, { backgroundColor: isDarkMode ? '#171717' : colors.backgroundPaperLight }]}>
          <Text style={[styles.decTitle, { color: themeColors.subText }]}>{t.neighborDecrements}</Text>
          {currentStep.inDegreeChanges.length === 0 ? (
            <Text style={[styles.decEmptyText, { color: themeColors.subText }]}>
              {t.noOutwardDeps}
            </Text>
          ) : (
            <View style={styles.decList}>
              {currentStep.inDegreeChanges.map((change, index) => {
                const isZero = change.to === 0;
                return (
                  <View key={`dec-${change.node}-${index}`} style={styles.decItem}>
                    <Ionicons
                      name="arrow-down-circle-outline"
                      size={16}
                      color={isZero ? (isDarkMode ? colors.secondaryTealDark : colors.secondaryTeal) : themeColors.subText}
                      style={styles.decIcon}
                    />
                    <Text style={[
                      styles.decNodeLabel, 
                      { color: themeColors.text },
                      isZero && styles.decNodeZero
                    ]}>
                      {getDocLabel(change.node)}
                    </Text>
                    <View style={styles.decFormula}>
                      <Text style={[styles.decFormulaText, { color: themeColors.subText }]}>
                        in-deg: {change.from} → <Text style={isZero ? styles.zeroBold : [styles.numBold, { color: themeColors.text }]}>{change.to}</Text>
                      </Text>
                      {isZero && (
                        <View style={styles.enqueuedBadge}>
                          <Text style={styles.enqueuedText}>{t.enqueued}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* Control Bar Stepper */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={handleReset} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={20} color={themeColors.subText} />
          <Text style={[styles.controlBtnText, { color: themeColors.subText }]}>{t.reset}</Text>
        </TouchableOpacity>

        <View style={styles.centerStepper}>
          <TouchableOpacity
            style={[
              styles.stepperBtn, 
              { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border },
              currentIndex === 0 && [styles.stepperDisabled, { backgroundColor: isDarkMode ? '#262626' : colors.backgroundPaperLight }]
            ]}
            onPress={handleStepBack}
            disabled={currentIndex === 0}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={currentIndex === 0 ? colors.gray400 : (isDarkMode ? '#d4d4d4' : colors.gray900)} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playBtn} onPress={handlePlayPause} activeOpacity={0.8}>
            <Ionicons
              name={isPlaying ? "pause-outline" : "play-outline"}
              size={22}
              color={colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.stepperBtn, 
              { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border },
              currentIndex === trace.length - 1 && [styles.stepperDisabled, { backgroundColor: isDarkMode ? '#262626' : colors.backgroundPaperLight }]
            ]}
            onPress={handleStepForward}
            disabled={currentIndex === trace.length - 1}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={currentIndex === trace.length - 1 ? colors.gray400 : (isDarkMode ? '#d4d4d4' : colors.gray900)}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.rightSpacer}>
          {isPlaying && (
            <View style={[
              styles.playingIndicator,
              {
                backgroundColor: isDarkMode ? '#064e3b' : '#ecfdf5',
                borderColor: isDarkMode ? '#065f46' : '#a7f3d0'
              }
            ]}>
              <View style={styles.greenPulseDot} />
              <Text style={styles.playingText}>{t.running}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  emptyContainer: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radii.md,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.secondary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  headerTitleCol: {
    flex: 1,
  },
  title: {
    ...typography.smallSemibold,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 10,
  },
  stepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  stepBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  detailsCard: {
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  dequeuedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  circleNumber: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.primaryTerracotta,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  circleNumberText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  dequeuedInfo: {
    flex: 1,
  },
  bannerLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dequeuedNodeName: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  stateRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  stateCol: {
    flex: 1,
    padding: spacing.md,
    borderRightWidth: 1,
  },
  stateLabel: {
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing.sm,
    letterSpacing: 0.25,
  },
  emptyQueueText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  queueContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  queueItem: {
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  queueItemNew: {
    borderWidth: 1,
  },
  queueItemText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
  decSection: {
    padding: spacing.md,
  },
  decTitle: {
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing.sm,
    letterSpacing: 0.25,
  },
  decEmptyText: {
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 15,
  },
  decList: {
    gap: spacing.xs,
  },
  decItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  decIcon: {
    marginRight: 6,
  },
  decNodeLabel: {
    fontSize: 12,
    flex: 1,
  },
  decNodeZero: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.secondaryTeal,
  },
  decFormula: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  decFormulaText: {
    fontSize: 10,
  },
  numBold: {
    fontWeight: 'bold',
  },
  zeroBold: {
    fontFamily: 'Inter_700Bold',
    color: colors.secondaryTeal,
  },
  enqueuedBadge: {
    backgroundColor: colors.secondaryTeal,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radii.sm,
    marginLeft: 6,
  },
  enqueuedText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 38,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
  },
  controlBtnText: {
    ...typography.caption,
  },
  centerStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperDisabled: {},
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.primaryTerracotta,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  rightSpacer: {
    width: 65,
    alignItems: 'flex-end',
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.tertiaryGreen,
    marginRight: 4,
  },
  playingText: {
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    color: colors.tertiaryGreen,
  },
});
