import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, Clipboard } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AgencyBranch, AgencyType } from '../context/types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, radii, spacing, typography, shadows } from '../theme';

interface BranchCardProps {
  branch: AgencyBranch | null;
  agencyType: AgencyType;
}

export default function BranchCard({ branch, agencyType }: BranchCardProps) {
  const { colors: themeColors, isDarkMode } = useTheme();
  const { language, t } = useLanguage();
  const [expanded, setExpanded] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

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

  const handleCopyAddress = () => {
    Clipboard.setString(branch.address);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Dynamic Open/Closed Status Checker
  const getOpenStatus = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sun, 6 = Sat
    
    // Check standard government office hours (Mon-Fri 8 AM - 5 PM)
    const isWeekend = currentDay === 0 || currentDay === 6;
    const isOpenHourStandard = currentHour >= 8 && currentHour < 17; // 8:00 AM to 5:00 PM

    const hoursStr = branch.hours.toLowerCase();
    
    if (hoursStr.includes('mall hours') || hoursStr.includes('10:00 pm')) {
      const isOpenHourMall = currentHour >= 10 && currentHour < 22; // 10:00 AM to 10:00 PM
      if (isOpenHourMall) {
        return { open: true, text: language === 'en' ? 'OPEN NOW' : 'BUKAS NGAYON', details: language === 'en' ? 'Mall Hours' : 'Oras ng Mall' };
      } else {
        return { open: false, text: language === 'en' ? 'CLOSED' : 'SARADO', details: language === 'en' ? 'Mall Hours' : 'Oras ng Mall' };
      }
    } else {
      if (!isWeekend && isOpenHourStandard) {
        return { open: true, text: language === 'en' ? 'OPEN NOW' : 'BUKAS NGAYON', details: '8:00 AM - 5:00 PM' };
      } else {
        return { open: false, text: language === 'en' ? 'CLOSED' : 'SARADO', details: isWeekend ? (language === 'en' ? 'Closed on Weekends' : 'Sarado tuwing Sabado/Linggo') : 'Closes at 5:00 PM' };
      }
    }
  };

  const status = getOpenStatus();

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#17120E' : colors.backgroundPaperLight, borderColor: themeColors.border }]}>
      {/* Interactive Expandable Header Row */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
        style={styles.headerRow}
      >
        <View style={[styles.locIconContainer, { backgroundColor: isDarkMode ? 'rgba(0, 103, 128, 0.2)' : 'rgba(0, 103, 128, 0.1)' }]}>
          <Ionicons
            name="location-outline"
            size={16}
            color={isDarkMode ? colors.secondaryTealDark : colors.secondaryTeal}
          />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.branchName, { color: themeColors.text }]}>{branch.name}</Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.subText }]}>
            {branch.city} • {language === 'en' ? 'Tap to view details' : 'Pindutin para sa detalye'}
          </Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={themeColors.subText}
          style={{ marginLeft: 6 }}
        />
      </TouchableOpacity>

      {/* Expanded Interactive Body */}
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          {/* Alamat / Address Section (Spans 100% full width for perfect text wrapping!) */}
          <View style={styles.detailSegment}>
            <View style={styles.segmentLabelRow}>
              <Text style={[styles.segmentLabel, { color: isDarkMode ? colors.secondaryTealDark : colors.secondaryTeal }]}>
                {language === 'en' ? 'ADDRESS / LOCATION' : 'ALAMAT AT LOKASYON'}
              </Text>
              <TouchableOpacity
                onPress={handleCopyAddress}
                activeOpacity={0.6}
                style={styles.copyBtn}
              >
                <Ionicons
                  name={copied ? "checkmark" : "copy-outline"}
                  size={12}
                  color={copied ? colors.tertiaryGreen : (isDarkMode ? colors.secondaryTealDark : colors.secondaryTeal)}
                />
                <Text style={[styles.copyBtnText, { color: copied ? colors.tertiaryGreen : (isDarkMode ? colors.secondaryTealDark : colors.secondaryTeal) }]}>
                  {copied ? (language === 'en' ? 'Copied!' : 'Nakopya!') : (language === 'en' ? 'Copy' : 'Kopyahin')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.contentRow}>
              <Ionicons
                name="pin-outline"
                size={14}
                color={themeColors.subText}
                style={styles.contentRowIcon}
              />
              <Text style={[styles.addressText, { color: themeColors.text }]}>
                {branch.address}
              </Text>
            </View>
          </View>

          {/* Operational Hours Section */}
          <View style={styles.detailSegment}>
            <View style={styles.segmentLabelRow}>
              <Text style={[styles.segmentLabel, { color: isDarkMode ? colors.secondaryTealDark : colors.secondaryTeal }]}>
                {language === 'en' ? 'OPERATIONAL HOURS' : 'ORAS NG OPERASYON'}
              </Text>
              {status && (
                <View style={[
                  styles.statusBadge,
                  status.open 
                    ? [styles.statusBadgeOpen, isDarkMode && { backgroundColor: 'rgba(0, 107, 44, 0.2)', borderColor: 'rgba(0, 107, 44, 0.4)' }]
                    : [styles.statusBadgeClosed, isDarkMode && { backgroundColor: 'rgba(141, 75, 0, 0.2)', borderColor: 'rgba(141, 75, 0, 0.4)' }]
                ]}>
                  <View style={[styles.pulseDot, { backgroundColor: status.open ? colors.tertiaryGreen : colors.primaryTerracotta }]} />
                  <Text style={[styles.statusBadgeText, { color: status.open ? colors.tertiaryGreen : colors.primaryTerracotta }]}>
                    {status.text}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.contentRow}>
              <Ionicons
                name="time-outline"
                size={14}
                color={themeColors.subText}
                style={styles.contentRowIcon}
              />
              <Text style={[styles.hoursText, { color: themeColors.text }]}>
                {branch.hours}
              </Text>
            </View>
          </View>

          {/* Phone (if available) */}
          {branch.phone && (
            <View style={styles.detailSegment}>
              <Text style={[styles.segmentLabel, { color: isDarkMode ? colors.secondaryTealDark : colors.secondaryTeal }]}>
                {language === 'en' ? 'CONTACT NUMBER' : 'NUMERO NG TELEPONO'}
              </Text>
              <View style={styles.contentRow}>
                <Ionicons
                  name="call-outline"
                  size={14}
                  color={themeColors.subText}
                  style={styles.contentRowIcon}
                />
                <Text style={[styles.hoursText, { color: themeColors.text }]}>
                  {branch.phone}
                </Text>
              </View>
            </View>
          )}

          {/* Get Directions CTA Button */}
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  locIconContainer: {
    padding: 8,
    borderRadius: radii.sm,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  branchName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
  },
  headerSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    marginTop: 1,
  },
  expandedContent: {
    width: '100%',
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
    width: '100%',
  },
  detailSegment: {
    marginBottom: spacing.md,
    width: '100%',
  },
  segmentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    width: '100%',
  },
  segmentLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radii.sm,
  },
  copyBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 8,
    marginLeft: 3,
    letterSpacing: 0.2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  statusBadgeOpen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  statusBadgeClosed: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 8,
    letterSpacing: 0.3,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    paddingRight: 10,
  },
  contentRowIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  addressText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 14,
    flex: 1,
    textAlign: 'justify',
  },
  hoursText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 14,
    flex: 1,
    textAlign: 'justify',
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
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingVertical: 8,
    marginTop: spacing.sm,
    width: '100%',
  },
  directionsText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
});
