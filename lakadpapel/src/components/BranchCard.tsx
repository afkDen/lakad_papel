import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AgencyBranch, AgencyType } from '../context/types';
import { colors } from '../theme';

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
      <View style={styles.container}>
        <Text style={styles.fallbackText}>{fallbackText}</Text>
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
    <View style={styles.container}>
      <Text style={styles.branchName}>{branch.name}</Text>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={14} color={colors.gray500} />
        <Text style={styles.infoTextFlex}>{branch.address}</Text>
      </View>

      <View style={styles.infoRowTight}>
        <Ionicons name="time-outline" size={14} color={colors.gray500} />
        <Text style={styles.infoText}>{branch.hours}</Text>
      </View>

      {branch.mapsUrl && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleGetDirections}
          style={styles.directionsRow}
        >
          <Ionicons name="map-outline" size={14} color={colors.blue600} />
          <Text style={styles.directionsText}>Get Directions</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray50,
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
  },
  fallbackText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray500,
    fontStyle: 'italic',
  },
  branchName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray900,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoRowTight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoTextFlex: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray500,
    marginLeft: 4,
    flex: 1,
  },
  infoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray500,
    marginLeft: 4,
  },
  directionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  directionsText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    color: colors.blue600,
    marginLeft: 4,
  },
});
