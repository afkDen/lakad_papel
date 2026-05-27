import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DocumentNode } from '../context/types';

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
    if (isChecked) return '#16a34a'; // green-600
    if (isDisabled) return '#9ca3af'; // text-gray-400
    return '#d1d5db'; // border-gray-300 / neutral gray
  };

  return (
    <TouchableOpacity
      activeOpacity={isDisabled ? 0.4 : 0.7}
      onPress={isDisabled ? undefined : onToggle}
      disabled={isDisabled}
      className={`w-full min-h-[56px] ${isDisabled ? 'opacity-40' : ''}`}
    >
      <View className="flex-row items-center px-6 py-4 border-b border-gray-200 bg-white">
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={getIconColor()}
        />
        <View className="flex-1 px-3">
          <Text className="text-base text-gray-900 font-normal">
            {document.label}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            {document.agency}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
