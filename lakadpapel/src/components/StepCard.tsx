import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RoadmapStep } from '../context/types';
import BranchCard from './BranchCard';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme';

interface StepCardProps {
  step: RoadmapStep;
  stepNumber: number;
  onMarkDone: () => void;
}

const StepCard = React.memo(function StepCard({ step, stepNumber, onMarkDone }: StepCardProps) {
  const { colors: themeColors, isDarkMode } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={[styles.stepBadge, { backgroundColor: isDarkMode ? '#404040' : colors.gray900 }]}>
          <Text style={styles.stepNumber}>{stepNumber}</Text>
        </View>
        <Text style={[styles.docLabel, { color: themeColors.text }]}>{step.document.label}</Text>
      </View>

      {/* Fees & Typical Days Info */}
      <View style={styles.infoSection}>
        <Text style={[styles.infoText, { color: themeColors.subText }]}>{t.fee}: {step.document.fees}</Text>
        <Text style={[styles.infoText, { marginTop: 2, color: themeColors.subText }]}>
          {t.processTime}: {step.document.typicalDays}
        </Text>
      </View>

      {/* Nearest Branch Card */}
      <View style={styles.branchSection}>
        <BranchCard branch={step.nearestBranch} agencyType={step.document.agency} />
      </View>

      {/* Mark As Done Button */}
      <TouchableOpacity
        activeOpacity={step.isDone ? 1 : 0.7}
        onPress={step.isDone ? undefined : onMarkDone}
        disabled={step.isDone}
        style={[styles.button, step.isDone ? styles.buttonDone : styles.buttonActive]}
      >
        <Text style={styles.buttonText}>
          {step.isDone ? t.alreadyHave : t.markAsDone}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

export default StepCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: colors.white,
  },
  docLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 12,
    flex: 1,
  },
  infoSection: {
    marginTop: 4,
    marginLeft: 40,
  },
  infoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  branchSection: {
    marginLeft: 40,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: colors.blue600,
  },
  buttonDone: {
    backgroundColor: colors.green600,
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: colors.white,
  },
});
