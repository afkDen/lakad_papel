import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RoadmapStep } from '../context/types';
import BranchCard from './BranchCard';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, radii, spacing, typography, shadows } from '../theme';

interface StepCardProps {
  step: RoadmapStep;
  stepNumber: number;
  onMarkDone: () => void;
}

const StepCard = React.memo(function StepCard({ step, stepNumber, onMarkDone }: StepCardProps) {
  const { colors: themeColors, isDarkMode } = useTheme();
  const { language, t } = useLanguage();
  const [guideExpanded, setGuideExpanded] = React.useState(false);

  const isCompleted = step.isDone;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: themeColors.cardBackground,
          borderColor: isCompleted
            ? themeColors.border
            : (isDarkMode ? colors.primaryTerracottaDark : colors.primaryTerracotta),
          opacity: isCompleted ? 0.6 : 1,
        },
      ]}
    >
      {/* Top Header Row with Timeline Node */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.stepBadge,
            {
              backgroundColor: isCompleted
                ? colors.tertiaryGreen
                : (isDarkMode ? colors.primaryTerracottaDark : colors.primaryTerracotta),
            },
            !isCompleted && styles.activeRing,
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark-sharp" size={14} color={colors.white} />
          ) : (
            <Text style={styles.stepNumber}>{stepNumber}</Text>
          )}
        </View>
        <Text style={[styles.docLabel, { color: themeColors.text }]}>
          {step.document.label}
        </Text>
        {(!isCompleted) && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>
              {t.nextStep || 'ACTIVE'}
            </Text>
          </View>
        )}
      </View>

      {/* Fees & Typical Days Info */}
      <View style={styles.infoSection}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Ionicons
            name="cash-outline"
            size={14}
            color={themeColors.subText}
            style={{ marginRight: 6, marginTop: 1 }}
          />
          <Text style={[styles.infoText, { color: themeColors.subText, flex: 1 }]}>
            {t.fee}: {step.document.fees}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 }}>
          <Ionicons
            name="time-outline"
            size={14}
            color={themeColors.subText}
            style={{ marginRight: 6, marginTop: 1 }}
          />
          <Text style={[styles.infoText, { color: themeColors.subText, flex: 1 }]}>
            {t.processTime}: {step.document.typicalDays}
          </Text>
        </View>
      </View>

      {/* Collapsible Requirements & Guide (Phase 5) */}
      {(step.document.requirements || step.document.detailedSteps) && (
        <View style={styles.guideWrapper}>
          <TouchableOpacity
            style={[
              styles.guideHeader,
              {
                backgroundColor: isDarkMode ? '#1E1610' : colors.backgroundPaperLight,
                borderColor: isDarkMode ? colors.primaryTerracottaDark : colors.borderSubtle,
              }
            ]}
            activeOpacity={0.8}
            onPress={() => setGuideExpanded(!guideExpanded)}
          >
            <View style={styles.guideHeaderLabelRow}>
              <Ionicons
                name="library-outline"
                size={14}
                color={isDarkMode ? colors.primaryTerracottaDark : colors.primaryTerracotta}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.guideHeaderText, { color: themeColors.text }]}>
                {language === 'en' ? 'Requirements & Guide' : 'Requirements at Gabay'}
              </Text>
            </View>
            <Ionicons
              name={guideExpanded ? "chevron-up" : "chevron-down"}
              size={14}
              color={themeColors.subText}
            />
          </TouchableOpacity>

          {guideExpanded && (
            <View style={[styles.guideContent, { borderColor: themeColors.border }]}>
              {/* Requirements Sub-section */}
              {step.document.requirements && step.document.requirements.length > 0 && (
                <View style={{ marginBottom: spacing.sm }}>
                  <Text style={[styles.guideSectionTitle, { color: isDarkMode ? colors.secondaryTealDark : colors.secondaryTeal }]}>
                    {language === 'en' ? 'Requirements' : 'Mga Kakailanganin'}
                  </Text>
                  {step.document.requirements.map((req, idx) => (
                    <View key={`step-req-${idx}`} style={styles.guideBulletRow}>
                      <Text style={[styles.guideBulletDot, { color: isDarkMode ? colors.primaryTerracottaDark : colors.primaryTerracotta }]}>•</Text>
                      <Text style={[styles.guideBulletText, { color: themeColors.text }]}>{req}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Detailed Steps Sub-section */}
              {step.document.detailedSteps && step.document.detailedSteps.length > 0 && (
                <View>
                  <Text style={[styles.guideSectionTitle, { color: isDarkMode ? colors.secondaryTealDark : colors.secondaryTeal }]}>
                    {language === 'en' ? 'Steps' : 'Mga Hakbang'}
                  </Text>
                  {step.document.detailedSteps.map((stepItem, idx) => (
                    <View key={`step-step-${idx}`} style={styles.guideBulletRow}>
                      <Text style={[styles.guideBulletNumber, { color: isDarkMode ? colors.primaryTerracottaDark : colors.primaryTerracotta }]}>{idx + 1}.</Text>
                      <Text style={[styles.guideBulletText, { color: themeColors.text }]}>{stepItem}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Nearest Branch Card */}
      <View style={styles.branchSection}>
        <BranchCard branch={step.nearestBranch} agencyType={step.document.agency} />
      </View>

      {/* Mark As Done Button */}
      <TouchableOpacity
        activeOpacity={isCompleted ? 1 : 0.75}
        onPress={isCompleted ? undefined : onMarkDone}
        disabled={isCompleted}
        style={[
          styles.button,
          isCompleted ? styles.buttonDone : [styles.buttonActive, { backgroundColor: isDarkMode ? colors.primaryTerracottaDark : colors.primaryTerracotta }],
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: isCompleted
                ? colors.white
                : (isDarkMode ? colors.onPrimaryFixed : colors.white),
            },
          ]}
        >
          {isCompleted ? t.alreadyHave : (t.markAsDone || 'Mark as Completed')}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

export default StepCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    marginHorizontal: 20,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRing: {
    borderWidth: 3,
    borderColor: '#ffdcc3',
  },
  stepNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: colors.white,
  },
  docLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: colors.warningBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginLeft: 8,
  },
  activeBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: colors.primaryTerracotta,
  },
  infoSection: {
    marginTop: 6,
    marginLeft: 44,
  },
  infoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'justify',
    marginRight: 16,
  },
  branchSection: {
    marginLeft: 44,
    marginRight: 12,
  },
  button: {
    marginTop: 16,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonActive: {
    // Dynamic background set inline
  },
  buttonDone: {
    backgroundColor: colors.tertiaryGreen,
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
  },

  // Collapsible Guide Section styles
  guideWrapper: {
    marginLeft: 44,
    marginRight: 12,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  guideHeaderLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guideHeaderText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  guideContent: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
    padding: 10,
    backgroundColor: 'transparent',
    marginTop: -1,
  },
  guideSectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  guideBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  guideBulletDot: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 6,
    lineHeight: 14,
  },
  guideBulletNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    marginRight: 6,
    lineHeight: 14,
  },
  guideBulletText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'justify',
    marginRight: 8,
  },
});
