import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DocumentNode } from '../context/types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, radii, spacing, shadows } from '../theme';

interface DocumentCardProps {
  document: DocumentNode;
  isChecked: boolean;
  onToggle: () => void;
  isDisabled?: boolean;
  possessed?: boolean;
}

const DocumentCard = React.memo(function DocumentCard({
  document,
  isChecked,
  onToggle,
  isDisabled = false,
  possessed = false,
}: DocumentCardProps) {
  const { colors: themeColors, isDarkMode } = useTheme();
  const { language } = useLanguage();

  // Helper for dynamic left icon and background color
  const getIconConfig = () => {
    if (isChecked || possessed) {
      return {
        bg: isDarkMode ? 'rgba(0, 107, 44, 0.2)' : 'rgba(0, 107, 44, 0.1)',
        icon: 'checkmark-circle-sharp' as const,
        color: colors.tertiaryGreen,
      };
    }
    if (isDisabled) {
      return {
        bg: isDarkMode ? '#27272A' : '#F3F4F6',
        icon: 'lock-closed-sharp' as const,
        color: isDarkMode ? '#71717A' : '#9CA3AF',
      };
    }
    return {
      bg: isDarkMode ? 'rgba(0, 103, 128, 0.2)' : 'rgba(0, 103, 128, 0.1)',
      icon: 'document-text-sharp' as const,
      color: isDarkMode ? colors.secondaryTealDark : colors.secondaryTeal,
    };
  };

  // Helper for status text
  const getStatusText = () => {
    if (isChecked || possessed) {
      return language === 'en' ? 'Verified & Owned' : 'Handa na at Beripikado';
    }
    if (isDisabled) {
      return language === 'en' ? 'Locked (Requires prerequisites)' : 'Naka-lock (May prerequisite)';
    }
    return language === 'en' ? 'Application required' : 'Kailangan ng aplikasyon';
  };

  const iconConfig = getIconConfig();

  return (
    <TouchableOpacity
      activeOpacity={isDisabled ? 0.6 : 0.8}
      onPress={isDisabled ? undefined : onToggle}
      disabled={isDisabled}
      style={[
        styles.card,
        {
          backgroundColor: themeColors.cardBackground,
          borderColor: isChecked || possessed
            ? colors.tertiaryGreen
            : (isDisabled ? themeColors.border : themeColors.border),
          opacity: isDisabled ? 0.65 : 1,
        },
      ]}
    >
      {/* Left Icon circle */}
      <View style={[styles.iconCircle, { backgroundColor: iconConfig.bg }]}>
        <Ionicons name={iconConfig.icon} size={20} color={iconConfig.color} />
      </View>

      {/* Center Details */}
      <View style={styles.textContainer}>
        <Text
          numberOfLines={2}
          style={[
            styles.label,
            { color: themeColors.text },
            (isChecked || possessed) && styles.textCrossed,
          ]}
        >
          {document.label}
        </Text>
        {isChecked || possessed ? (
          <View style={{ flexDirection: 'row', marginTop: 6 }}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isDarkMode ? 'rgba(0, 107, 44, 0.2)' : 'rgba(0, 107, 44, 0.12)',
                  marginLeft: 0,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: colors.tertiaryGreen, fontSize: 10, fontFamily: 'Inter_700Bold' },
                ]}
              >
                {language === 'en' ? '✓ Verified & Owned' : '✓ Beripikado at Taglay'}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.statusSub, { color: themeColors.subText }]}>
            {getStatusText()}
          </Text>
        )}
      </View>

      {/* Right dot indicator matching Stitch aesthetic */}
      <View
        style={[
          styles.rightDot,
          {
            backgroundColor: isChecked || possessed
              ? colors.tertiaryGreen
              : (isDisabled ? colors.gray400 : (isDarkMode ? colors.secondaryTealDark : colors.secondaryTeal)),
          },
        ]}
      />
    </TouchableOpacity>
  );
});

export default DocumentCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
  },
  textCrossed: {
    opacity: 0.8,
  },
  statusSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
    flexShrink: 0,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  rightDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: spacing.sm,
  },
});
