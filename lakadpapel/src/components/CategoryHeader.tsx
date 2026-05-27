import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface CategoryHeaderProps {
  title: string;
}

export default function CategoryHeader({ title }: CategoryHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: colors.white,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 20,
    color: colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
