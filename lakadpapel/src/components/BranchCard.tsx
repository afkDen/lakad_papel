import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AgencyBranch, AgencyType } from '../context/types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, radii, spacing } from '../theme';

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

    if (agencyType === 'BARANGAY' || agencyType === 'SCHOOL') {
      return (
        <View style={[styles.warningCallout, isDarkMode && { backgroundColor: 'rgba(141, 75, 0, 0.2)', borderLeftColor: '#ffb77d' }]}>
          <Ionicons
            name="warning-outline"
            size={18}
            color={isDarkMode ? '#ffb77d' : colors.primaryTerracotta}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.fallbackText, { color: isDarkMode ? '#ffb77d' : colors.primaryTerracotta, fontWeight: '600' }]}>
            {fallbackText}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#120E0A' : colors.backgroundPaperLight }]}>
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
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#120E0A' : colors.backgroundPaperLight }]}>
      <View style={styles.topRow}>
        <View style={[styles.locIconContainer, { backgroundColor: isDarkMode ? 'rgba(0, 103, 128, 0.2)' : 'rgba(0, 103, 128, 0.1)' }]}>
          <Ionicons
            name="location-outline"
            size={16}
            color={isDarkMode ? colors.secondaryTealDark : colors.secondaryTeal}
          />
        </View>
        <View style={styles.textDetails}>
          <Text style={[styles.branchName, { color: themeColors.text }]}>{branch.name}</Text>
          <Text style={[styles.addressText, { color: themeColors.subText }]}>{branch.address}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 4, flexShrink: 1 }}>
            <Ionicons
              name="time-outline"
              size={12}
              color={themeColors.subText}
              style={{ marginRight: 4, marginTop: 1 }}
            />
            <Text style={[styles.hoursText, { color: themeColors.subText, marginTop: 0, flex: 1 }]}>
              {branch.hours}
            </Text>
          </View>
        </View>
      </View>

      {branch.mapsUrl && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleGetDirections}
          style={[styles.directionsButton, { borderColor: isDarkMode ? colors.secondaryTealDark : colors.secondaryTeal }]}
        >
          <Ionicons
            name="compass-outline"
            size={15}
            color={isDarkMode ? colors.secondaryTealDark : colors.secondaryTeal}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.directionsText, { color: isDarkMode ? colors.secondaryTealDark : colors.secondaryTeal }]}>
            {t.getDirections}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locIconContainer: {
    padding: 8,
    borderRadius: radii.sm,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textDetails: {
    flex: 1,
  },
  warningCallout: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#8d4b00',
    padding: 12,
    borderRadius: radii.sm,
    marginVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fallbackText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  branchName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
  },
  addressText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
    textAlign: 'justify',
    marginRight: 16,
  },
  hoursText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 4,
    textAlign: 'justify',
    marginRight: 16,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingVertical: 8,
    marginTop: spacing.md,
    width: '100%',
  },
  directionsText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
});

