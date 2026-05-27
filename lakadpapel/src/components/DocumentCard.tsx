import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DocumentNode } from '../context/types';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../theme';

interface DocumentCardProps {
  document: DocumentNode;
  isChecked: boolean;
  onToggle: () => void;
  isDisabled?: boolean;
}

const DocumentCard = React.memo(function DocumentCard({
  document,
  isChecked,
  onToggle,
  isDisabled = false,
}: DocumentCardProps) {
  const { colors: themeColors } = useTheme();

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
          <Text style={[styles.label, { color: themeColors.text }]}>{document.label}</Text>
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
});
