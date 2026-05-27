import React from 'react';
import { View, Text } from 'react-native';

interface CategoryHeaderProps {
  title: string;
}

export default function CategoryHeader({ title }: CategoryHeaderProps) {
  return (
    <View className="px-6 pt-6 pb-2">
      <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        {title}
      </Text>
    </View>
  );
}
