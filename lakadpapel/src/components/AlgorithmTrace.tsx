import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TraceStep } from '../algorithms/topologicalSort';
import { REQUIREMENTS_GRAPH } from '../algorithms/requirementsGraph';
import { colors, spacing, radii, typography, shadows } from '../theme';

interface AlgorithmTraceProps {
  trace: TraceStep[];
  subgraphEmpty: boolean;
}

export default function AlgorithmTrace({ trace, subgraphEmpty }: AlgorithmTraceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimer = useRef<NodeJS.Timeout | null>(null);

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
      <View style={styles.emptyContainer}>
        <Ionicons name="git-network-outline" size={24} color={colors.gray400} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>
          Select an active target document to see Kahn's Algorithm trace.
        </Text>
      </View>
    );
  }

  const currentStep = trace[currentIndex];

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.headerTitleCol}>
          <Text style={styles.title}>Kahn's Algorithm Trace</Text>
          <Text style={styles.subtitle}>Educational DAA Walkthrough</Text>
        </View>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            Step {currentIndex + 1} of {trace.length}
          </Text>
        </View>
      </View>

      {/* Main step details card */}
      <View style={styles.detailsCard}>
        {/* Step Dequeued Node Banner */}
        <View style={styles.dequeuedBanner}>
          <View style={styles.circleNumber}>
            <Text style={styles.circleNumberText}>{currentIndex + 1}</Text>
          </View>
          <View style={styles.dequeuedInfo}>
            <Text style={styles.bannerLabel}>DEQUEUED NODE (IN-DEGREE 0)</Text>
            <Text style={styles.dequeuedNodeName}>{getDocLabel(currentStep.dequeued)}</Text>
          </View>
        </View>

        {/* Queue States */}
        <View style={styles.stateRow}>
          <View style={styles.stateCol}>
            <Text style={styles.stateLabel}>QUEUE BEFORE DEQUEUE</Text>
            {currentStep.queueBefore.length === 0 ? (
              <Text style={styles.emptyQueueText}>[ Empty ]</Text>
            ) : (
              <View style={styles.queueContainer}>
                {currentStep.queueBefore.map((id, index) => (
                  <View key={`before-${id}-${index}`} style={styles.queueItem}>
                    <Text style={styles.queueItemText}>{REQUIREMENTS_GRAPH[id]?.agency || id}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.stateCol}>
            <Text style={styles.stateLabel}>QUEUE AFTER DEQUEUE & DEC</Text>
            {currentStep.queueAfter.length === 0 ? (
              <Text style={styles.emptyQueueText}>[ Empty ]</Text>
            ) : (
              <View style={styles.queueContainer}>
                {currentStep.queueAfter.map((id, index) => (
                  <View key={`after-${id}-${index}`} style={[styles.queueItem, styles.queueItemNew]}>
                    <Text style={styles.queueItemText}>{REQUIREMENTS_GRAPH[id]?.agency || id}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* In-Degree Decrements list */}
        <View style={styles.decSection}>
          <Text style={styles.decTitle}>NEIGHBOR IN-DEGREE DECREMENTS</Text>
          {currentStep.inDegreeChanges.length === 0 ? (
            <Text style={styles.decEmptyText}>
              No outward dependency neighbors. No in-degree decrements.
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
                      color={isZero ? colors.teal600 : colors.gray500}
                      style={styles.decIcon}
                    />
                    <Text style={[styles.decNodeLabel, isZero && styles.decNodeZero]}>
                      {getDocLabel(change.node)}
                    </Text>
                    <View style={styles.decFormula}>
                      <Text style={styles.decFormulaText}>
                        in-deg: {change.from} → <Text style={isZero ? styles.zeroBold : styles.numBold}>{change.to}</Text>
                      </Text>
                      {isZero && (
                        <View style={styles.enqueuedBadge}>
                          <Text style={styles.enqueuedText}>ENQUEUED</Text>
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
          <Ionicons name="refresh-outline" size={20} color={colors.gray500} />
          <Text style={styles.controlBtnText}>Reset</Text>
        </TouchableOpacity>

        <View style={styles.centerStepper}>
          <TouchableOpacity
            style={[styles.stepperBtn, currentIndex === 0 && styles.stepperDisabled]}
            onPress={handleStepBack}
            disabled={currentIndex === 0}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={currentIndex === 0 ? colors.gray400 : colors.gray900} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playBtn} onPress={handlePlayPause} activeOpacity={0.8}>
            <Ionicons
              name={isPlaying ? "pause-outline" : "play-outline"}
              size={22}
              color={colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.stepperBtn, currentIndex === trace.length - 1 && styles.stepperDisabled]}
            onPress={handleStepForward}
            disabled={currentIndex === trace.length - 1}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={currentIndex === trace.length - 1 ? colors.gray400 : colors.gray900}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.rightSpacer}>
          {isPlaying && (
            <View style={styles.playingIndicator}>
              <View style={styles.greenPulseDot} />
              <Text style={styles.playingText}>RUNNING</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radii.md,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  emptyContainer: {
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderStyle: 'dashed',
    borderRadius: radii.md,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.secondary,
    textAlign: 'center',
    color: colors.gray500,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  headerTitleCol: {
    flex: 1,
  },
  title: {
    ...typography.smallSemibold,
    color: colors.gray900,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 10,
    color: colors.gray500,
  },
  stepBadge: {
    backgroundColor: colors.gray900,
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
    borderColor: colors.gray200,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  dequeuedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blueLight,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.blueBorder,
  },
  circleNumber: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.blue600,
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
    color: colors.blueText,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dequeuedNodeName: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Inter_600SemiBold',
    color: colors.gray900,
  },
  stateRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  stateCol: {
    flex: 1,
    padding: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.gray200,
  },
  stateLabel: {
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    color: colors.gray500,
    marginBottom: spacing.sm,
    letterSpacing: 0.25,
  },
  emptyQueueText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.gray400,
  },
  queueContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  queueItem: {
    backgroundColor: colors.gray200,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  queueItemNew: {
    backgroundColor: '#ccfbf1',
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  queueItemText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: colors.gray900,
  },
  decSection: {
    padding: spacing.md,
    backgroundColor: colors.gray50,
  },
  decTitle: {
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    color: colors.gray500,
    marginBottom: spacing.sm,
    letterSpacing: 0.25,
  },
  decEmptyText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.gray500,
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
    color: colors.gray900,
    flex: 1,
  },
  decNodeZero: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.teal600,
  },
  decFormula: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  decFormulaText: {
    fontSize: 10,
    color: colors.gray500,
  },
  numBold: {
    fontWeight: 'bold',
    color: colors.gray900,
  },
  zeroBold: {
    fontFamily: 'Inter_700Bold',
    color: colors.teal600,
  },
  enqueuedBadge: {
    backgroundColor: colors.teal600,
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
    color: colors.gray500,
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
    borderColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  stepperDisabled: {
    backgroundColor: colors.gray50,
    borderColor: colors.gray200,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.blue600,
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
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.green600,
    marginRight: 4,
  },
  playingText: {
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    color: colors.green600,
  },
});
