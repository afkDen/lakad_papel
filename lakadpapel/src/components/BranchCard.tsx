import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AgencyBranch, AgencyType } from '../context/types';

interface BranchCardProps {
  branch: AgencyBranch | null;
  agencyType: AgencyType;
}

export default function BranchCard({ branch, agencyType }: BranchCardProps) {
  if (branch === null) {
    let fallbackText = `Visit your nearest ${agencyType} office`;
    if (agencyType === 'BARANGAY') {
      fallbackText = 'Visit your local Barangay Hall';
    } else if (agencyType === 'SCHOOL') {
      fallbackText = "Contact your school's registrar office";
    }

    return (
      <View className="bg-gray-50 rounded-lg p-4 mt-3">
        <Text className="text-xs text-gray-500 italic">{fallbackText}</Text>
      </View>
    );
  }

  const handleGetDirections = () => {
    if (branch.mapsUrl) {
      Linking.openURL(branch.mapsUrl).catch((err) =>
        console.error('Failed to open directions link:', err)
      );
    }
  };

  return (
    <View className="bg-gray-50 rounded-lg p-4 mt-3">
      <Text className="text-sm font-semibold text-gray-900">{branch.name}</Text>

      <View className="flex-row items-center mt-2">
        <Ionicons name="location-outline" size={14} color="#6b7280" />
        <Text className="text-xs text-gray-500 ml-1 flex-1">{branch.address}</Text>
      </View>

      <View className="flex-row items-center mt-1">
        <Ionicons name="time-outline" size={14} color="#6b7280" />
        <Text className="text-xs text-gray-500 ml-1">{branch.hours}</Text>
      </View>

      {branch.mapsUrl && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleGetDirections}
          className="flex-row items-center mt-3"
        >
          <Ionicons name="map-outline" size={14} color="#2563eb" />
          <Text className="text-xs text-blue-600 font-semibold ml-1">Get Directions</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
