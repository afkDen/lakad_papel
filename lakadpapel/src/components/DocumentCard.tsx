import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DocumentNode } from '../context/types';
import { colors } from '../theme';

interface DocumentCardProps {
  document: DocumentNode;
  isChecked: boolean;
  onToggle: () => void;
  isDisabled?: boolean;
}

export default function DocumentCard({
  document,
  isChecked,
  onToggle,
  isDisabled = false,
}: DocumentCardProps) {
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
      <View style={styles.row}>
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={getIconColor()}
        />
        <View style={styles.textContainer}>
          <Text style={styles.label}>{document.label}</Text>
          <Text style={styles.agency}>{document.agency}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

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
    borderBottomColor: colors.gray200,
    backgroundColor: colors.white,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.gray900,
  },
  agency: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray500,
    marginTop: 2,
  },
});
