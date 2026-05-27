import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DocumentNode } from '../context/types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme';

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

  const getIconColor = () => {
    if (isChecked) return colors.green600;
    if (isDisabled) return colors.gray400;
    return colors.gray300;
  };

  return (
    <TouchableOpacity
      activeOpacity={isDisabled ? 0.4 : 0.7}
      onPress={isDisabled ? undefined : onToggle}
      disabled={isDisabled}
      style={[styles.touchable, isDisabled && styles.disabled]}
    >
      <View style={[styles.row, { backgroundColor: themeColors.cardBackground, borderBottomColor: themeColors.border }]}>
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={getIconColor()}
        />
        <View style={styles.textContainer}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: themeColors.text }]}>{document.label}</Text>
            {possessed && (
              <View style={[styles.statusBadge, isDarkMode && { backgroundColor: '#27272A' }]}>
                <Text style={[styles.statusBadgeText, isDarkMode && { color: '#A1A1AA' }]}>
                  {language === 'en' ? '✓ Already Have This' : '✓ Taglay Na'}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.agency, { color: themeColors.subText }]}>{document.agency}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default DocumentCard;

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
    minHeight: 56,
  },
  disabled: {
    opacity: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  agency: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  statusBadgeText: {
    color: '#6B7280',
    fontSize: 12,
  },
});
