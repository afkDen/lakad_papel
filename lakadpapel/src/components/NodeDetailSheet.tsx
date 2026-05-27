import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DocumentId, DocumentNode, AgencyType } from '../context/types';
import { REQUIREMENTS_GRAPH } from '../algorithms/requirementsGraph';
import { colors, spacing, radii, typography, shadows } from '../theme';

interface NodeDetailSheetProps {
  documentId: DocumentId | null;
  onClose: () => void;
  onSetTarget: (id: DocumentId) => void;
  onTogglePossession: (id: DocumentId) => void;
  isPossessed: boolean;
  isTarget: boolean;
}

export default function NodeDetailSheet({
  documentId,
  onClose,
  onSetTarget,
  onTogglePossession,
  isPossessed,
  isTarget,
}: NodeDetailSheetProps) {
  if (!documentId) return null;

  const node: DocumentNode | undefined = REQUIREMENTS_GRAPH[documentId];
  if (!node) return null;

  // Find all documents unlocked by this document
  const unlocks = Object.values(REQUIREMENTS_GRAPH).filter((doc) =>
    doc.prerequisites.includes(documentId)
  );

  // Agency color mappings for visual badges
  const getAgencyColor = (agency: AgencyType) => {
    switch (agency) {
      case 'PSA': return colors.blue600;
      case 'DFA': return '#0284c7';
      case 'NBI': return '#4f46e5';
      case 'LTO': return '#d97706';
      case 'COMELEC': return '#059669';
      case 'PHILSYS': return '#7c3aed';
      case 'PRC': return '#db2777';
      case 'SSS': return '#2563eb';
      case 'GSIS': return '#0891b2';
      case 'BARANGAY': return '#0f766e';
      case 'SCHOOL': return '#b45309';
      default: return colors.gray500;
    }
  };

  const agencyColor = getAgencyColor(node.agency);

  return (
    <Modal
      transparent
      visible={!!documentId}
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.backdropInner} />
      </TouchableOpacity>

      {/* Bottom Sheet Container */}
      <View style={styles.sheetContainer}>
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Close Button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
          <Ionicons name="close" size={24} color={colors.gray500} />
        </TouchableOpacity>

        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {/* Header Title */}
          <Text style={styles.title}>{node.label}</Text>

          {/* Agency Badge */}
          <View style={styles.badgeRow}>
            <View style={[styles.agencyBadge, { backgroundColor: agencyColor }]}>
              <Text style={styles.agencyBadgeText}>{node.agency}</Text>
            </View>
            {isPossessed && (
              <View style={[styles.statusBadge, styles.possessedBadge]}>
                <Ionicons name="checkmark-circle" size={14} color={colors.green600} style={styles.badgeIcon} />
                <Text style={styles.possessedBadgeText}>Possessed</Text>
              </View>
            )}
            {isTarget && (
              <View style={[styles.statusBadge, styles.targetBadge]}>
                <Ionicons name="map-outline" size={14} color={colors.blue600} style={styles.badgeIcon} />
                <Text style={styles.targetBadgeText}>Active Target</Text>
              </View>
            )}
          </View>

          {/* Detail Grid */}
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Est. Fees</Text>
              <Text style={styles.detailValue}>{node.fees}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Processing Time</Text>
              <Text style={styles.detailValue}>{node.typicalDays}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Issuing Office</Text>
              <Text style={styles.detailValue}>{node.officeType}</Text>
            </View>
          </View>

          {/* Notes Section */}
          {node.notes && (
            <View style={styles.notesContainer}>
              <Ionicons name="information-circle-outline" size={18} color={colors.blue600} style={styles.noteIcon} />
              <Text style={styles.notesText}>{node.notes}</Text>
            </View>
          )}

          {/* Prerequisites Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Prerequisites ({node.prerequisites.length})</Text>
          </View>
          {node.prerequisites.length === 0 ? (
            <Text style={styles.emptyText}>None — This is a foundational document.</Text>
          ) : (
            <View style={styles.prereqList}>
              {node.prerequisites.map((prereqId) => {
                const prereq = REQUIREMENTS_GRAPH[prereqId];
                if (!prereq) return null;
                return (
                  <View key={prereqId} style={styles.prereqItem}>
                    <Ionicons name="document-text-outline" size={16} color={colors.gray500} style={styles.prereqIcon} />
                    <Text style={styles.prereqLabel}>{prereq.label}</Text>
                    <View style={[styles.agencyTag, { borderColor: getAgencyColor(prereq.agency) }]}>
                      <Text style={[styles.agencyTagText, { color: getAgencyColor(prereq.agency) }]}>
                        {prereq.agency}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Unlocks Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Unlocks ({unlocks.length})</Text>
          </View>
          {unlocks.length === 0 ? (
            <Text style={styles.emptyText}>None — This document does not lead to further requirements.</Text>
          ) : (
            <View style={styles.prereqList}>
              {unlocks.map((unlock) => (
                <View key={unlock.id} style={styles.prereqItem}>
                  <Ionicons name="git-network-outline" size={16} color={colors.gray500} style={styles.prereqIcon} />
                  <Text style={styles.prereqLabel}>{unlock.label}</Text>
                  <View style={[styles.agencyTag, { borderColor: getAgencyColor(unlock.agency) }]}>
                    <Text style={[styles.agencyTagText, { color: getAgencyColor(unlock.agency) }]}>
                      {unlock.agency}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Sticky Actions Footer */}
        <View style={styles.actionContainer}>
          {!isPossessed && (
            <TouchableOpacity
              style={[styles.btnPrimary, isTarget && styles.btnDisabled]}
              onPress={() => {
                onSetTarget(documentId);
                onClose();
              }}
              disabled={isTarget}
              activeOpacity={0.8}
            >
              <Ionicons name="map-outline" size={18} color={colors.white} style={styles.btnIcon} />
              <Text style={styles.btnPrimaryText}>
                {isTarget ? 'Active Target' : 'Set as Target'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.btnSecondary,
              isPossessed ? styles.btnSecondaryDanger : styles.btnSecondarySuccess
            ]}
            onPress={() => onTogglePossession(documentId)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isPossessed ? "close-circle-outline" : "checkmark-circle-outline"}
              size={18}
              color={isPossessed ? '#dc2626' : colors.green600}
              style={styles.btnIcon}
            />
            <Text style={[
              styles.btnSecondaryText,
              isPossessed ? styles.btnSecondaryTextDanger : styles.btnSecondaryTextSuccess
            ]}>
              {isPossessed ? 'Mark as Missing' : 'Mark as Possessed'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  backdropInner: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingTop: spacing.md,
    maxHeight: screenHeight * 0.75,
    minHeight: screenHeight * 0.45,
    ...shadows.sm,
    shadowRadius: 10,
    shadowOpacity: 0.15,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: radii.sm,
    backgroundColor: colors.gray200,
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.xl,
    padding: spacing.xs,
    zIndex: 10,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  title: {
    ...typography.screenTitle,
    fontSize: 20,
    lineHeight: 26,
    paddingRight: 32,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  agencyBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  agencyBadgeText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  possessedBadge: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  targetBadge: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  badgeIcon: {
    marginRight: 4,
  },
  possessedBadgeText: {
    color: colors.green600,
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  targetBadgeText: {
    color: colors.blue600,
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  detailGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radii.md,
    backgroundColor: colors.gray50,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  detailItem: {
    flex: 1,
    padding: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.gray200,
    alignItems: 'flex-start',
  },
  detailLabel: {
    ...typography.caption,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  noteIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  notesText: {
    ...typography.secondary,
    color: '#1e40af',
    flex: 1,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    paddingBottom: spacing.xs,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.sectionHeader,
    fontSize: 11,
  },
  prereqList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  prereqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  prereqIcon: {
    marginRight: spacing.md,
  },
  prereqLabel: {
    ...typography.body,
    fontSize: 14,
    color: colors.gray900,
    flex: 1,
  },
  agencyTag: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  agencyTagText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
  emptyText: {
    ...typography.secondary,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    backgroundColor: colors.white,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue600,
    height: 48,
    borderRadius: radii.md,
  },
  btnDisabled: {
    backgroundColor: colors.gray200,
  },
  btnPrimaryText: {
    ...typography.buttonLabel,
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  btnSecondarySuccess: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  btnSecondaryDanger: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  btnSecondaryText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  btnSecondaryTextSuccess: {
    color: colors.green600,
  },
  btnSecondaryTextDanger: {
    color: '#dc2626',
  },
  btnIcon: {
    marginRight: spacing.sm,
  },
});
