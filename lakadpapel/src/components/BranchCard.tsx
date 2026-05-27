import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AgencyBranch, AgencyType } from '../context/types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme';

interface BranchCardProps {
  branch: AgencyBranch | null;
  agencyType: AgencyType;
}

export default function BranchCard({ branch, agencyType }: BranchCardProps) {
  const { colors: themeColors, isDarkMode } = useTheme();
  const { language, t } = useLanguage();

  if (branch === null) {
    let fallbackText = language === 'en'
      ? `Visit your nearest ${agencyType} office`
      : `Bisitahin ang pinakamalapit na opisina ng ${agencyType}`;
      
    if (agencyType === 'BARANGAY') {
      fallbackText = language === 'en'
        ? 'Visit your local Barangay Hall'
        : 'Bisitahin ang inyong lokal na Barangay Hall';
    } else if (agencyType === 'SCHOOL') {
      fallbackText = language === 'en'
        ? "Contact your school's registrar office"
        : "Makipag-ugnayan sa registrar ng inyong paaralan";
    }

    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#262626' : colors.gray50 }]}>
        <Text style={[styles.fallbackText, { color: themeColors.subText }]}>{fallbackText}</Text>
      </View>
    );
  }

  const handleGetDirections = async () => {
    if (!branch.mapsUrl) return;

    const googleMapsUrl = branch.mapsUrl;
    const appleMapsUrl =
      `https://maps.apple.com/?q=${encodeURIComponent(branch.name + ' ' + branch.city)}`;

    try {
      const supported = await Linking.canOpenURL(googleMapsUrl);
      if (supported) {
        await Linking.openURL(googleMapsUrl);
      } else {
        await Linking.openURL(appleMapsUrl);
      }
    } catch (err) {
      console.error('Failed to open directions link:', err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#262626' : colors.gray50 }]}>
      <Text style={[styles.branchName, { color: themeColors.text }]}>{branch.name}</Text>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={14} color={themeColors.subText} />
        <Text style={[styles.infoTextFlex, { color: themeColors.subText }]}>{branch.address}</Text>
      </View>

      <View style={styles.infoRowTight}>
        <Ionicons name="time-outline" size={14} color={themeColors.subText} />
        <Text style={[styles.infoText, { color: themeColors.subText }]}>{branch.hours}</Text>
      </View>

      {branch.mapsUrl && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleGetDirections}
          style={styles.directionsRow}
        >
          <Ionicons name="map-outline" size={14} color={themeColors.primary} />
          <Text style={[styles.directionsText, { color: themeColors.primary }]}>{t.getDirections}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
  },
  fallbackText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  branchName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
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
    marginLeft: 4,
    flex: 1,
  },
  infoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
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
    marginLeft: 4,
  },
});
