import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Animated, Linking, Clipboard } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RoadmapStep } from '../context/types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, radii, spacing, typography, shadows } from '../theme';

interface StepCardProps {
  step: RoadmapStep;
  stepNumber: number;
  onMarkDone: () => void;
  isFirst: boolean;
  isLast: boolean;
  isActive: boolean;
  isLocked: boolean;
  focused: boolean;
  onFocus: () => void;
  userInputs: Record<string, string>;
  onUpdateInput: (key: string, value: string) => void;
  checklistState: Record<string, boolean>;
  onToggleChecklistItem: (item: string) => void;
}

export interface InputField {
  key: string;
  label: string;
  placeholder: string;
}

// Function to return dynamic user fields for each specific document ID
export function getDocumentInputFields(documentId: string): InputField[] {
  switch (documentId) {
    case 'psa_birth_cert':
      return [
        { key: 'refNo', label: 'Reference Number', placeholder: 'CRS-XXX-XXXXX' },
        { key: 'apptDate', label: 'Appointment Date & Time', placeholder: 'e.g. Oct 24, 2026 at 10:00 AM' },
        { key: 'registryNo', label: 'Registry Number (LCR No.)', placeholder: 'e.g. LCR No. 2021-998' }
      ];
    case 'barangay_cert':
      return [
        { key: 'barangayName', label: 'Barangay Name', placeholder: 'e.g. Brgy. Wack-Wack' },
        { key: 'cedulaNo', label: 'Cedula Number', placeholder: 'CCIXXXXXXXX' }
      ];
    case 'lto_medical_cert':
      return [
        { key: 'clientId', label: 'LTO Client ID', placeholder: 'e.g. XX-XXXXXXX' },
        { key: 'clinicName', label: 'Medical Clinic Name', placeholder: 'e.g. LTO Accredited Clinic' }
      ];
    case 'voters_id':
      return [
        { key: 'precinctNo', label: 'Precinct Number', placeholder: 'Precinct XXXX-A' },
        { key: 'comelecOffice', label: 'COMELEC Office Location', placeholder: 'e.g. Pasig OEO' }
      ];
    case 'philsys_id':
      return [
        { key: 'transactionNo', label: 'Transaction Number', placeholder: 'XXXX-XXXX-XXXX-XXXX' },
        { key: 'regCenter', label: 'Registration Center Location', placeholder: 'e.g. SM Megamall Center' }
      ];
    case 'passport_regular':
      return [
        { key: 'refNo', label: 'Application Reference No.', placeholder: 'DFA-MNL-2026-XXXXXX' },
        { key: 'apptDateTime', label: 'Appointment Date & Time', placeholder: 'e.g. Oct 24, 2026 at 10:00 AM' },
        { key: 'consularOffice', label: 'DFA Consular Office Location', placeholder: 'e.g. DFA SM Megamall' }
      ];
    case 'nbi_clearance':
      return [
        { key: 'refNo', label: 'NBI Reference Number', placeholder: 'NBI-XXXXXX' },
        { key: 'apptDate', label: 'Scheduled Date & Time', placeholder: 'e.g. Monday, 9:00 AM' },
        { key: 'branchLoc', label: 'NBI Branch Location', placeholder: 'e.g. NBI Robinsons Galleria' }
      ];
    case 'lto_student_permit':
      return [
        { key: 'tdcCertNo', label: 'Theoretical Driving Course (TDC) Cert No.', placeholder: 'TDC-XXXXXXXX' },
        { key: 'clientId', label: 'LTO Client ID', placeholder: 'e.g. XX-XXXXXXX' }
      ];
    case 'lto_nonpro_license':
      return [
        { key: 'pdcCertNo', label: 'Practical Driving Course (PDC) Cert No.', placeholder: 'PDC-XXXXXXXX' },
        { key: 'permitNo', label: 'Student Permit Number', placeholder: 'SXX-XX-XXXXXX' }
      ];
    case 'official_tor':
      return [
        { key: 'studentId', label: 'Student ID Number', placeholder: 'e.g. 2021-XXXXX' },
        { key: 'schoolName', label: 'School / University Name', placeholder: 'e.g. UP Diliman' }
      ];
    case 'prc_board_app':
      return [
        { key: 'refNo', label: 'PRC LERIS Reference Number', placeholder: 'PRC-LERIS-XXXXXX' },
        { key: 'branchLoc', label: 'PRC Branch Location', placeholder: 'e.g. PRC Morayta' }
      ];
    case 'sss_id':
      return [
        { key: 'sssNo', label: 'SSS Number', placeholder: 'XX-XXXXXXX-X' },
        { key: 'bankAcct', label: 'Partner Bank Account Number', placeholder: 'RCBC / UnionBank Acct' }
      ];
    case 'gsis_ecard':
      return [
        { key: 'bpNo', label: 'GSIS BP Number', placeholder: 'XXXXXXXXXX' },
        { key: 'agencyName', label: 'Government Agency Name', placeholder: 'e.g. DepEd' }
      ];
    case 'bir_tin':
      return [
        { key: 'tinNo', label: 'Taxpayer Identification Number (TIN)', placeholder: 'XXX-XXX-XXX-000' },
        { key: 'rdo', label: 'Revenue District Office (RDO)', placeholder: 'e.g. RDO 43 - Pasig' }
      ];
    case 'philhealth_id':
      return [
        { key: 'pinNo', label: 'PhilHealth Identification Number (PIN)', placeholder: 'XX-XXXXXXXXX-X' },
        { key: 'membershipType', label: 'Membership Category', placeholder: 'e.g. Informal / Voluntary' }
      ];
    case 'pagibig_loyalty':
      return [
        { key: 'midNo', label: 'Pag-IBIG MID Number', placeholder: 'XXXX-XXXX-XXXX' },
        { key: 'bankPartner', label: 'Bank Partner', placeholder: 'UnionBank / AUB' }
      ];
    case 'postal_id':
      return [
        { key: 'idNo', label: 'Postal ID Number', placeholder: 'PR-XXXXXXXX-X' },
        { key: 'postOffice', label: 'Post Office Location', placeholder: 'e.g. QC Central Post Office' }
      ];
    default:
      return [
        { key: 'refNo', label: 'Reference Number / ID', placeholder: 'Enter details' }
      ];
  }
}

// Function to generate dynamic warning based on time and agency
function getDynamicWarning(documentId: string, agency: string, currentHour: number, currentDay: number, language: 'en' | 'tl') {
  const isWeekend = currentDay === 0 || currentDay === 6;
  const isEn = language === 'en';

  if (isWeekend) {
    return {
      title: isEn ? 'Weekend Closure Notice' : 'Babala sa Weekend Closure',
      text: isEn 
        ? 'Government offices are closed on weekends. Plan your appearance for Monday morning.'
        : 'Sarado ang mga tanggapan ng gobyerno tuwing weekend. Magplano para sa Lunes ng umaga.',
    };
  }
  
  if (currentHour >= 16) {
    return {
      title: isEn ? 'Closing Hours Notice' : 'Abiso sa Oras ng Pagsasara',
      text: isEn 
        ? 'It is currently past 4:00 PM. Most offices close at 5:00 PM and experience high volume. Arrive 15 minutes before closing or wait until tomorrow morning.'
        : 'Kasalukuyang lampas na ng 4:00 PM. Karamihan ng tanggapan ay nagsasara ng 5:00 PM at nakakaranas ng dagsa ng tao. Arrive 15 minutes bago magsara o maghintay bukas ng umaga.',
    };
  }
  
  if (currentHour >= 12 && currentHour < 13) {
    return {
      title: isEn ? 'Lunch Break Advisory' : 'Payo sa Lunch Break',
      text: isEn
        ? 'Offices operate on skeletal force during lunch break (12:00 PM - 1:00 PM). Expect slightly longer queue waiting times.'
        : 'Skeletal force ang nagtatrabaho tuwing lunch break (12:00 PM - 1:00 PM). Asahan ang mas matagal na paghihintay.',
    };
  }

  // Agency-specific tips
  if (agency === 'DFA') {
    return {
      title: isEn ? 'DFA Appointment Notice' : 'Abiso sa DFA Appointment',
      text: isEn
        ? 'DFA branches strictly require printed A4 appointment forms and convenience e-receipts. No walk-ins allowed.'
        : 'Mahigpit na kinakailangan ng DFA ang printed A4 appointment forms at e-receipts. Bawal ang walk-in.',
    };
  }

  if (agency === 'PSA') {
    return {
      title: isEn ? 'PSA Outlet Slot Reminder' : 'Paalala sa PSA Outlet',
      text: isEn
        ? 'A free online slot scheduled via appointment.psa.gov.ph is mandatory for CRS outlet entry.'
        : 'Libreng online appointment sa appointment.psa.gov.ph ang kailangan bago pumunta sa CRS outlet.',
    };
  }

  if (agency === 'LTO') {
    return {
      title: isEn ? 'LTO LTMS Integration' : 'LTO LTMS Integration',
      text: isEn
        ? 'Verify that your accredited clinic has electronically transmitted your medical certificate to your LTO client portal account.'
        : 'Siguraduhing na-upload ng accredited clinic ang iyong medical certificate sa iyong LTO client portal account.',
    };
  }

  if (agency === 'NBI') {
    return {
      title: isEn ? 'NBI Payment Warning' : 'Babala sa NBI Payment',
      text: isEn
        ? 'Cash is no longer accepted over the counter. You must pay online via GCash/Maya and secure your Reference Number first.'
        : 'Hindi na tumatanggap ng cash sa pila. Kailangang bayaran online sa GCash/Maya at kunin ang iyong Reference Number.',
    };
  }

  return {
    title: isEn ? 'Operating Hours Notice' : 'Abiso sa Oras ng Operasyon',
    text: isEn
      ? `${agency} branches are experiencing moderate volume. Arrive 15 minutes before your preferred slot.`
      : `May katamtamang dagsa sa mga sangay ng ${agency}. Dumating nang 15 minuto bago ang iyong napiling oras.`,
  };
}

export const StepCard = React.memo(function StepCard({
  step,
  stepNumber,
  onMarkDone,
  isFirst,
  isLast,
  isActive,
  isLocked,
  focused,
  onFocus,
  userInputs,
  onUpdateInput,
  checklistState,
  onToggleChecklistItem
}: StepCardProps) {
  const { colors: themeColors, isDarkMode } = useTheme();
  const { language, t } = useLanguage();
  
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [isActive]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });

  const isCompleted = step.isDone;
  const isLocationBased = !!step.nearestBranch;
  
  // Determine timeline node visual state
  const renderTimelineNode = () => {
    if (isCompleted) {
      return (
        <View style={[styles.timelineNode, { backgroundColor: colors.tertiaryGreen }]}>
          <Ionicons name="checkmark-sharp" size={14} color={colors.white} />
        </View>
      );
    }

    if (isActive) {
      return (
        <View style={styles.timelineNodeWrapper}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                backgroundColor: isDarkMode ? '#ffb77d' : '#8d4b00',
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
            ]}
          />
          <View style={[styles.timelineNode, { backgroundColor: isDarkMode ? '#ffb77d' : '#8d4b00' }]}>
            <Ionicons name="ellipsis-horizontal" size={14} color={isDarkMode ? '#2f1500' : colors.white} />
          </View>
        </View>
      );
    }

    if (isLocked) {
      return (
        <View style={[styles.timelineNode, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' }]}>
          <Ionicons name="lock-closed-outline" size={14} color={isDarkMode ? '#94a3b8' : colors.gray500} />
        </View>
      );
    }

    // Upcoming but unlocked
    return (
      <View style={[styles.timelineNode, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' }]}>
        <Ionicons name="location-outline" size={14} color={isDarkMode ? '#94a3b8' : colors.gray500} />
      </View>
    );
  };

  // Get dynamic operating hours/day warnings
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();
  const warning = getDynamicWarning(
    step.document.id,
    step.document.agency,
    currentHour,
    currentDay,
    language as 'en' | 'tl'
  );

  const handleGetDirections = () => {
    if (!step.nearestBranch?.mapsUrl) return;
    Linking.openURL(step.nearestBranch.mapsUrl).catch((err) =>
      console.error('Failed to open directions link:', err)
    );
  };

  const inputFields = getDocumentInputFields(step.document.id);

  return (
    <View style={styles.rowContainer}>
      {/* LEFT COLUMN: Timeline */}
      <View style={styles.leftTimelineCol}>
        {/* Continuous timeline vertical line */}
        <View 
          style={[
            styles.timelineLine, 
            { 
              backgroundColor: isDarkMode ? '#1e293b' : '#E5DFD9',
              top: isFirst ? 24 : 0, 
              bottom: isLast ? '100%' : 0,
              // Adjust bottom offset when last to end at center of node
              height: isLast ? 24 : undefined,
            }
          ]} 
        />
        {renderTimelineNode()}
      </View>

      {/* RIGHT COLUMN: Step Card */}
      <View style={styles.rightCardCol}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={onFocus}
          style={[
            styles.card,
            {
              backgroundColor: themeColors.cardBackground,
              borderColor: isCompleted
                ? themeColors.border
                : isActive
                ? (isDarkMode ? '#ffb77d' : '#8d4b00')
                : themeColors.border,
              borderWidth: isActive ? 1.5 : 1,
              opacity: isLocked ? (focused ? 0.95 : 0.7) : 1,
            },
          ]}
        >
          {/* Card Header Row */}
          <View style={styles.cardHeader}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.docLabel, { color: themeColors.text }]}>
                {step.document.label}
              </Text>
            </View>

            {/* Status Indicator Badges */}
            {isCompleted ? (
              <View style={[styles.badgeContainer, { backgroundColor: '#f0fdf4' }]}>
                <Text style={[styles.badgeText, { color: '#16a34a' }]}>DONE</Text>
              </View>
            ) : isActive ? (
              <View style={[styles.badgeContainer, { backgroundColor: isDarkMode ? 'rgba(255, 183, 125, 0.15)' : '#fdf6e2' }]}>
                <Text style={[styles.badgeText, { color: isDarkMode ? '#ffb77d' : '#8d4b00' }]}>CURRENT</Text>
              </View>
            ) : isLocked ? (
              <View style={[styles.badgeContainer, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}>
                <Text style={[styles.badgeText, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>LOCKED</Text>
              </View>
            ) : (
              <View style={[styles.badgeContainer, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}>
                <Text style={[styles.badgeText, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>UPCOMING</Text>
              </View>
            )}
          </View>

          {/* Clean, vertically stacked Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={13} color={themeColors.subText} style={styles.infoIcon} />
              <Text style={[styles.infoText, { color: themeColors.subText }]} numberOfLines={2}>
                <Text style={styles.infoTextBold}>{t.fee || 'Fee'}:</Text> {step.document.fees}
              </Text>
            </View>
            <View style={[styles.infoRow, { marginTop: 4 }]}>
              <Ionicons name="time-outline" size={13} color={themeColors.subText} style={styles.infoIcon} />
              <Text style={[styles.infoText, { color: themeColors.subText }]} numberOfLines={2}>
                <Text style={styles.infoTextBold}>{t.processTime || 'Process Time'}:</Text> {step.document.typicalDays}
              </Text>
            </View>
          </View>

          {/* Focused/Expanded Details Body */}
          {focused && (
            <View style={styles.expandedBody}>
              <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

              {/* Description / Notes */}
              {step.document.notes && (
                <Text style={[styles.notesText, { color: themeColors.subText }]}>
                  {step.document.notes}
                </Text>
              )}

              {/* Interactive checklist (only editable when active, shown as read-only otherwise) */}
              {step.document.requirements && step.document.requirements.length > 0 && (
                <View style={styles.checklistSection}>
                  <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffb77d' : '#8d4b00' }]}>
                    {language === 'en' ? 'DOCUMENT CHECKLIST' : 'LISTAHAN NG KAKAILANGANIN'}
                  </Text>
                  {step.document.requirements.map((req, idx) => {
                    const isChecked = !!checklistState[req];
                    const isCheckable = isActive;
                    return (
                      <TouchableOpacity
                        key={`req-${idx}`}
                        activeOpacity={isCheckable ? 0.7 : 1}
                        onPress={() => isCheckable && onToggleChecklistItem(req)}
                        style={[
                          styles.checklistRow,
                          {
                            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.4)' : '#FAF8F5',
                            borderColor: themeColors.border,
                          }
                        ]}
                      >
                        <Ionicons
                          name={isChecked ? "checkmark-circle" : "ellipse-outline"}
                          size={18}
                          color={isChecked ? colors.tertiaryGreen : themeColors.subText}
                          style={{ marginRight: 10 }}
                        />
                        <Text 
                          style={[
                            styles.checklistText, 
                            { 
                              color: themeColors.text,
                              textDecorationLine: isChecked ? 'line-through' : 'none',
                              opacity: isChecked ? 0.6 : 1,
                            }
                          ]}
                        >
                          {req}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Dynamic User Details Inputs */}
              <View style={styles.inputsSection}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffb77d' : '#8d4b00' }]}>
                  {language === 'en' ? 'MY DOCUMENT DETAILS' : 'AKING MGA DETALYE'}
                </Text>
                {inputFields.map((field) => (
                  <View key={field.key} style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: themeColors.text }]}>{field.label}</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                          borderColor: themeColors.border,
                          color: themeColors.text,
                        },
                      ]}
                      value={userInputs[field.key] || ''}
                      onChangeText={(val) => onUpdateInput(field.key, val)}
                      placeholder={field.placeholder}
                      placeholderTextColor={isDarkMode ? '#475569' : '#94a3b8'}
                    />
                  </View>
                ))}
              </View>

              {/* Map Placeholder & Get Directions (if branch exists) */}
              {isLocationBased && step.nearestBranch && (
                <View style={styles.mapSection}>
                  <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffb77d' : '#8d4b00' }]}>
                    {language === 'en' ? 'BRANCH LOCATION' : 'LOKASYON NG SANGAY'}
                  </Text>
                  <Text style={[styles.branchName, { color: themeColors.text }]}>
                    {step.nearestBranch.name}
                  </Text>
                  <Text style={[styles.branchAddress, { color: themeColors.subText }]}>
                    {step.nearestBranch.address}
                  </Text>

                  {/* Map image placeholder */}
                  <View style={[styles.mapImageWrapper, { borderColor: themeColors.border }]}>
                    <Image
                      source={require('../../assets/map-placeholder.png')}
                      style={styles.mapImage}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Get Directions CTA */}
                  {step.nearestBranch.mapsUrl && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleGetDirections}
                      style={[styles.directionsBtn, { backgroundColor: isDarkMode ? '#ffb77d' : '#8d4b00' }]}
                    >
                      <Ionicons name="compass-outline" size={16} color={isDarkMode ? '#2f1500' : colors.white} style={{ marginRight: 6 }} />
                      <Text style={[styles.directionsBtnText, { color: isDarkMode ? '#2f1500' : colors.white }]}>
                        {t.getDirections || 'Get Directions'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Operating Hours / Alert callout box */}
              <View 
                style={[
                  styles.warningCallout, 
                  { 
                    backgroundColor: isDarkMode ? 'rgba(251, 191, 36, 0.1)' : '#FEF3C7',
                    borderLeftColor: isDarkMode ? '#f59e0b' : '#d97706',
                  }
                ]}
              >
                <Ionicons
                  name="warning-outline"
                  size={18}
                  color={isDarkMode ? '#f59e0b' : '#d97706'}
                  style={{ marginRight: 10, marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.warningTitle, { color: isDarkMode ? '#f59e0b' : '#b45309' }]}>
                    {warning.title}
                  </Text>
                  <Text style={[styles.warningText, { color: isDarkMode ? '#f59e0b' : '#b45309' }]}>
                    {warning.text}
                  </Text>
                </View>
              </View>

              {/* Complete Step Button (only visible when not complete yet) */}
              {!isCompleted && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onMarkDone}
                  style={[styles.completeBtn, { backgroundColor: colors.tertiaryGreen }]}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.white} style={{ marginRight: 6 }} />
                  <Text style={styles.completeBtnText}>
                    {language === 'en' ? 'Mark As Completed' : 'Tapos Na / Mark As Completed'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default StepCard;

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    width: '100%',
  },
  leftTimelineCol: {
    width: 44,
    alignItems: 'center',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 21,
    width: 2,
  },
  timelineNodeWrapper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    zIndex: 1,
  },
  timelineNode: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    zIndex: 2,
    ...shadows.sm,
  },
  rightCardCol: {
    flex: 1,
    paddingBottom: 16,
  },
  card: {
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  docLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    lineHeight: 20,
  },
  infoSection: {
    marginTop: 8,
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  infoIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  infoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  infoTextBold: {
    fontFamily: 'Inter_600SemiBold',
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    marginLeft: 8,
  },
  badgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  expandedBody: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 12,
  },
  notesText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'justify',
    marginBottom: 16,
  },
  checklistSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: 6,
  },
  checklistText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  inputsSection: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  mapSection: {
    marginBottom: 16,
  },
  branchName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
  },
  branchAddress: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
    marginBottom: 10,
  },
  mapImageWrapper: {
    width: '100%',
    height: 140,
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 12,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    paddingVertical: 12,
  },
  directionsBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  warningCallout: {
    borderLeftWidth: 4,
    padding: 12,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  warningTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    marginBottom: 2,
  },
  warningText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 15,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    paddingVertical: 12,
    width: '100%',
  },
  completeBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.white,
  },
});
