import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import { REQUIREMENTS_GRAPH } from '../src/algorithms/requirementsGraph';
import { CompletedFlow, DocumentNode } from '../src/context/types';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';
import { colors as defaultColors, radii, spacing, shadows } from '../src/theme';
import { buildSubgraph, topologicalSort } from '../src/algorithms/topologicalSort';

export default function HistoryScreen() {
  const { state, dispatch } = useDocumentContext();
  const { colors: themeColors, isDarkMode } = useTheme();
  const { language, t } = useLanguage();
  const router = useRouter();

  // Search, Filter, Sort and Modal states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedAgencyFilter, setSelectedAgencyFilter] = useState<string | null>(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Details Modal states
  const [activeDetailItem, setActiveDetailItem] = useState<CompletedFlow | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Local Localized translations matching mockup exactly
  const translationsMap: Record<'en' | 'tl', Record<string, string>> = {
    en: {
      history: 'History',
      completedOn: 'Finished',
      steps: 'steps',
      step: 'step',
      completed: 'completed',
      viewDetails: 'View details',
      completedBadge: 'COMPLETED',
      bannerTitle: 'Start a New Process',
      bannerDesc: 'Let us guide you on your next document.',
      bannerBtn: 'EXPLORE',
      searchPlaceholder: 'Search completed documents...',
      clearFilter: 'Clear Filter',
      filterAgency: 'Filter by Agency',
      sortByDate: 'Sort by Date',
      newestFirst: 'Newest First',
      oldestFirst: 'Oldest First',
      close: 'Close',
      detailsTitle: 'Acquisition Details',
      stepsCompleted: 'Steps Completed',
      loadDemo: 'Load Demo History',
      loadDemoDesc: 'Populate the tab with standard completed cards from the design spec.',
      totalCost: 'Estimated Costs',
      officeType: 'Issuing Office',
      typicalDays: 'Processing Duration',
    },
    tl: {
      history: 'Kasaysayan',
      completedOn: 'Natapos',
      steps: 'hakbang',
      step: 'hakbang',
      completed: 'natapos',
      viewDetails: 'Tingnan ang detalye',
      completedBadge: 'TAPOS NA',
      bannerTitle: 'Magsimulang Bagong Proseso',
      bannerDesc: 'Gabayan ka namin sa iyong susunod na dokumento.',
      bannerBtn: 'MAG-EXPLORE',
      searchPlaceholder: 'Maghanap ng natapos...',
      clearFilter: 'Alisin ang Filter',
      filterAgency: 'I-filter ayon sa Sangay',
      sortByDate: 'I-sort ayon sa Petsa',
      newestFirst: 'Pinakabago Muna',
      oldestFirst: 'Pinakauna Muna',
      close: 'Isara',
      detailsTitle: 'Mga Detalye ng Pagkuha',
      stepsCompleted: 'Mga Hakbang na Natapos',
      loadDemo: 'Dala-dalang Demo Data',
      loadDemoDesc: 'Punuin ang tab ng mga standard completed cards mula sa design spec.',
      totalCost: 'Tinatayang Gastos',
      officeType: 'Naglalabas na Opisina',
      typicalDays: 'Tagal ng Proseso',
    }
  };

  const localT = translationsMap[language] || translationsMap['en'];

  // Formatter for localized finished dates
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (language === 'en') {
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      } else {
        const monthsTl = [
          'Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo',
          'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'
        ];
        const month = monthsTl[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
      }
    } catch {
      return isoString;
    }
  };

  // Helper to retrieve clean cost displays
  const getCleanFee = (docId: string) => {
    const node = REQUIREMENTS_GRAPH[docId];
    if (!node) return 'PHP 0.00';
    if (docId === 'passport') return 'PHP 950.00';
    if (docId === 'lto_drivers_license') return 'PHP 530.00';
    if (docId === 'psa_birth_cert') return 'PHP 155.00';

    const feeString = node.fees || '';
    const match = feeString.match(/(?:₱|PHP)\s*([\d,]+)/i) || feeString.match(/([\d,]+)/);
    if (match && match[1]) {
      const numericPart = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(numericPart)) {
        return `PHP ${numericPart.toFixed(2)}`;
      }
    }
    return 'PHP 150.00';
  };

  // Get custom colored circular badge based on document agency/id
  const getBadgeColors = (docId: string, agency: string) => {
    // Exact spec mockups
    if (docId === 'passport' || agency === 'DFA') {
      return { bg: '#FDF2E9', iconColor: '#8d4b00', iconName: 'book-outline' as const };
    }
    if (docId === 'lto_drivers_license' || agency === 'LTO') {
      return { bg: '#EBF5FB', iconColor: '#2471A3', iconName: 'card-outline' as const };
    }
    if (docId === 'psa_birth_cert' || agency === 'PSA') {
      return { bg: '#E8F8F5', iconColor: '#117A65', iconName: 'document-text-outline' as const };
    }

    // Additional premium agency mappings
    switch (agency) {
      case 'COMELEC':
        return { bg: '#FEF9E7', iconColor: '#B7950B', iconName: 'ribbon-outline' as const }; // Soft gold
      case 'BIR':
        return { bg: '#EEF2FF', iconColor: '#3F51B5', iconName: 'cash-outline' as const }; // Soft indigo
      case 'PRC':
        return { bg: '#FDEDEC', iconColor: '#CB4335', iconName: 'medal-outline' as const }; // Soft red
      case 'SSS':
      case 'GSIS':
        return { bg: '#EAF2F8', iconColor: '#1A5276', iconName: 'shield-checkmark-outline' as const }; // Soft navy blue
      case 'PHILHEALTH':
        return { bg: '#E8F8F5', iconColor: '#196F3D', iconName: 'pulse-outline' as const }; // Soft mint green
      case 'PAGIBIG':
        return { bg: '#FBEEE6', iconColor: '#BA4A00', iconName: 'home-outline' as const }; // Soft orange-pink
      case 'PHLPOST':
        return { bg: '#FDEDEC', iconColor: '#C0392B', iconName: 'mail-outline' as const }; // Soft crimson red
      case 'PHILSYS':
        return { bg: '#E0F7FA', iconColor: '#00838F', iconName: 'id-card-outline' as const }; // Soft cyan
      case 'BARANGAY':
        return { bg: '#F5EEF8', iconColor: '#7D3C98', iconName: 'business-outline' as const }; // Soft warm-sand/purple
      case 'SCHOOL':
        return { bg: '#F4ECF7', iconColor: '#6C3483', iconName: 'school-outline' as const }; // Soft violet
      default:
        return { bg: '#F2F4F4', iconColor: '#7F8C8D', iconName: 'document-outline' as const }; // Standard grey
    }
  };

  // Hydrate completed history from mockup design spec
  const loadDemoHistory = async () => {
    const demoItems = [
      {
        targetDocumentId: 'passport',
        completedAt: '2026-05-27T14:30:00.000Z',
        stepCount: 4,
      },
      {
        targetDocumentId: 'lto_drivers_license',
        completedAt: '2026-03-12T10:15:00.000Z',
        stepCount: 2,
      },
      {
        targetDocumentId: 'psa_birth_cert',
        completedAt: '2025-10-15T09:00:00.000Z',
        stepCount: 1,
      },
    ];

    try {
      await AsyncStorage.setItem('@lakadpapel/history', JSON.stringify(demoItems));
      dispatch({
        type: 'HYDRATE',
        payload: {
          possessedDocuments: Array.from(state.possessedDocuments),
          history: demoItems,
          userMode: state.userMode,
        },
      });
      Alert.alert(
        language === 'en' ? 'Reference Completed loaded' : 'Na-load ang Demo Data',
        language === 'en' ? 'History has been populated with premium reference items.' : 'Napuno ang Kasaysayan ng mga premium na sanggunian.'
      );
    } catch (err) {
      console.warn('Failed to load demo history:', err);
    }
  };

  // Reconstruct completed roadmap steps list for detail modal
  const getFlowSteps = (docId: string): DocumentNode[] => {
    try {
      const fullSubgraph = buildSubgraph(REQUIREMENTS_GRAPH, new Set(), docId);
      const sortedIds = topologicalSort(fullSubgraph);
      return sortedIds.map((id) => REQUIREMENTS_GRAPH[id]);
    } catch {
      return [];
    }
  };

  // Filtering, sorting and grouping completed history items
  const filteredHistory = useMemo(() => {
    let result = [...state.history];

    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => {
        const docLabel = REQUIREMENTS_GRAPH[item.targetDocumentId]?.label ?? item.targetDocumentId;
        return docLabel.toLowerCase().includes(query);
      });
    }

    if (selectedAgencyFilter) {
      result = result.filter((item) => {
        const doc = REQUIREMENTS_GRAPH[item.targetDocumentId];
        return doc && doc.agency === selectedAgencyFilter;
      });
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    } else {
      result.sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
    }

    return result;
  }, [state.history, searchQuery, selectedAgencyFilter, sortBy]);

  // Transform filtered history list into sections grouped by year
  const sections = useMemo(() => {
    const groups: Record<string, CompletedFlow[]> = {};

    filteredHistory.forEach((flow) => {
      let year = '2026';
      try {
        const date = new Date(flow.completedAt);
        const yVal = date.getFullYear();
        if (!isNaN(yVal)) {
          year = yVal.toString();
        }
      } catch {
        // Fallback
      }
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(flow);
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((year) => ({
        title: year,
        data: groups[year],
      }));
  }, [filteredHistory]);

  const uniqueAgencies = useMemo(() => {
    const agencies = new Set<string>();
    state.history.forEach((item) => {
      const doc = REQUIREMENTS_GRAPH[item.targetDocumentId];
      if (doc && doc.agency) {
        agencies.add(doc.agency);
      }
    });
    return Array.from(agencies);
  }, [state.history]);

  const openDetailsModal = (item: CompletedFlow) => {
    setActiveDetailItem(item);
    setIsDetailModalVisible(true);
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => {
    return (
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeaderText, { color: themeColors.subText }]}>{title}</Text>
        <View style={[styles.sectionHeaderLine, { backgroundColor: themeColors.border }]} />
      </View>
    );
  };

  const renderItem = ({ item }: { item: CompletedFlow }) => {
    const node = REQUIREMENTS_GRAPH[item.targetDocumentId];
    const docLabel = node?.label ?? item.targetDocumentId;
    const priceText = getCleanFee(item.targetDocumentId);
    const dateText = formatDate(item.completedAt);
    const badge = getBadgeColors(item.targetDocumentId, node?.agency || '');

    return (
      <View style={[
        styles.historyCard,
        {
          backgroundColor: themeColors.cardBackground,
          borderColor: isDarkMode ? defaultColors.primaryTerracottaDark : themeColors.border,
          borderWidth: 1,
        }
      ]}>
        <View style={styles.cardHeaderRow}>
          {/* Circular badge on the left */}
          <View style={[styles.iconBadgeCircle, { backgroundColor: badge.bg }]}>
            <Ionicons name={badge.iconName} size={20} color={badge.iconColor} />
          </View>

          {/* Info block in the middle */}
          <View style={styles.cardMiddleBlock}>
            <View style={styles.titlePriceRow}>
              <Text style={[styles.docLabelText, { color: themeColors.text }]} numberOfLines={1}>
                {docLabel}
              </Text>
              <Text style={[styles.priceLabelText, { color: isDarkMode ? themeColors.primary : defaultColors.primaryTerracotta }]}>
                {priceText}
              </Text>
            </View>
            <Text style={[styles.finishedStepsText, { color: themeColors.subText }]}>
              {localT.completedOn}: {dateText} • {item.stepCount} {item.stepCount === 1 ? localT.step : localT.steps}
            </Text>

            {/* Badges and action row */}
            <View style={styles.badgesActionRow}>
              <View style={[styles.pillBadge, { backgroundColor: '#E8F8F5', borderColor: '#A2D9CE' }]}>
                <Ionicons name="checkmark-sharp" size={10} color="#0E6251" style={{ marginRight: 3 }} />
                <Text style={styles.pillBadgeText}>
                  {localT.completedBadge}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.detailsLinkButton}
                activeOpacity={0.7}
                onPress={() => openDetailsModal(item)}
              >
                <Text style={[styles.detailsLinkText, { color: isDarkMode ? themeColors.primary : defaultColors.primaryTerracotta }]}>
                  {localT.viewDetails}
                </Text>
                <Ionicons
                  name="chevron-forward-sharp"
                  size={12}
                  color={isDarkMode ? themeColors.primary : defaultColors.primaryTerracotta}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconBadge, { backgroundColor: isDarkMode ? '#231A12' : '#FFF3ED' }]}>
          <Ionicons
            name="file-tray-stacked-outline"
            size={40}
            color={isDarkMode ? themeColors.primary : defaultColors.primaryTerracotta}
          />
        </View>
        <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
          {t.historyEmptyState}
        </Text>
        <Text style={[styles.emptySubtitle, { color: themeColors.subText }]}>
          {t.historyEmptyStateSubtitle}
        </Text>

        {/* Demo data load shortcut */}
        <TouchableOpacity
          style={[styles.demoLoadBtn, { borderColor: themeColors.border, borderWidth: 1 }]}
          activeOpacity={0.7}
          onPress={loadDemoHistory}
        >
          <Ionicons name="sparkles-outline" size={16} color={themeColors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.demoLoadBtnText, { color: themeColors.text }]}>
            {localT.loadDemo}
          </Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 11, color: themeColors.subText, textAlign: 'center', marginTop: 6, paddingHorizontal: 40, fontFamily: 'Inter_400Regular', lineHeight: 15 }}>
          {localT.loadDemoDesc}
        </Text>
      </View>
    );
  };

  const renderPromoBanner = () => {
    return (
      <View style={[
        styles.promoCard,
        {
          backgroundColor: themeColors.cardBackground,
          borderColor: themeColors.border,
          borderLeftColor: themeColors.primary,
        }
      ]}>
        <Text style={[styles.promoTitle, { color: themeColors.text }]}>
          {localT.bannerTitle}
        </Text>
        <Text style={[styles.promoDesc, { color: themeColors.subText }]}>
          {localT.bannerDesc}
        </Text>
        <TouchableOpacity
          style={[styles.promoBtn, { backgroundColor: themeColors.primary }]}
          activeOpacity={0.9}
          onPress={() => router.push('/target')}
        >
          <Text style={[styles.promoBtnText, { color: isDarkMode ? '#1F1B17' : defaultColors.white }]}>
            {localT.bannerBtn}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Redesigned Premium Header matching specs */}
      <View style={[styles.premiumHeaderBar, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          style={styles.headerIconButton}
          activeOpacity={0.7}
          onPress={() => router.push('/checklist')}
        >
          <Ionicons name="arrow-back-outline" size={22} color={themeColors.text} />
        </TouchableOpacity>

        <Text style={[styles.premiumHeaderTitle, { color: themeColors.text }]}>
          {localT.history}
        </Text>

        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={() => {
              setIsSearchActive(!isSearchActive);
              if (isSearchActive) setSearchQuery('');
            }}
          >
            <Ionicons
              name={isSearchActive ? "close-outline" : "search-outline"}
              size={22}
              color={themeColors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <Ionicons name="funnel-outline" size={20} color={themeColors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable fully functional search bar */}
      {isSearchActive && (
        <View style={[styles.searchBarContainer, { backgroundColor: themeColors.cardBackground, borderBottomColor: themeColors.border }]}>
          <Ionicons name="search" size={16} color={themeColors.subText} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInputField, { color: themeColors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={localT.searchPlaceholder}
            placeholderTextColor={themeColors.subText}
            autoFocus
          />
        </View>
      )}

      {/* Section list grouping history items */}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `${item.targetDocumentId}-${index}`}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={state.history.length > 0 ? renderPromoBanner : null}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />

      {/* Slide-Up Bottom Sheet Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              {localT.clearFilter}
            </Text>

            {/* Filter by Agency */}
            <Text style={[styles.filterGroupLabel, { color: themeColors.subText }]}>
              {localT.filterAgency}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: 16 }}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedAgencyFilter === null && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                ]}
                onPress={() => setSelectedAgencyFilter(null)}
              >
                <Text style={[styles.filterChipText, selectedAgencyFilter === null && { color: '#FFF' }]}>
                  ALL
                </Text>
              </TouchableOpacity>
              {uniqueAgencies.map((agency) => (
                <TouchableOpacity
                  key={agency}
                  style={[
                    styles.filterChip,
                    { borderColor: themeColors.border },
                    selectedAgencyFilter === agency && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                  ]}
                  onPress={() => setSelectedAgencyFilter(agency)}
                >
                  <Text style={[styles.filterChipText, selectedAgencyFilter === agency && { color: '#FFF' }]}>
                    {agency}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Sort by Date */}
            <Text style={[styles.filterGroupLabel, { color: themeColors.subText }]}>
              {localT.sortByDate}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
              <TouchableOpacity
                style={[
                  styles.filterSelectBtn,
                  { borderColor: themeColors.border },
                  sortBy === 'newest' && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                ]}
                onPress={() => setSortBy('newest')}
              >
                <Text style={[styles.filterBtnText, sortBy === 'newest' && { color: '#FFF' }]}>
                  {localT.newestFirst}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterSelectBtn,
                  { borderColor: themeColors.border },
                  sortBy === 'oldest' && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                ]}
                onPress={() => setSortBy('oldest')}
              >
                <Text style={[styles.filterBtnText, sortBy === 'oldest' && { color: '#FFF' }]}>
                  {localT.oldestFirst}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Modal Buttons */}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelBtn, { borderColor: themeColors.border, flex: 1 }]}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedAgencyFilter(null);
                  setSortBy('newest');
                  setIsFilterModalVisible(false);
                }}
              >
                <Text style={[styles.cancelBtnText, { color: themeColors.subText }]}>
                  {localT.clearFilter}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveBtn, { backgroundColor: themeColors.primary, flex: 1 }]}
                activeOpacity={0.7}
                onPress={() => setIsFilterModalVisible(false)}
              >
                <Text style={styles.saveBtnText}>
                  {localT.close}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sliding Details bottom sheet modal */}
      {activeDetailItem && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isDetailModalVisible}
          onRequestClose={() => setIsDetailModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalSheet, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border, maxHeight: '85%' }]}>
              <Text style={[styles.modalTitle, { color: themeColors.text, marginBottom: 4 }]}>
                {localT.detailsTitle}
              </Text>
              <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', textAlign: 'center', color: themeColors.primary, marginBottom: 16 }}>
                {REQUIREMENTS_GRAPH[activeDetailItem.targetDocumentId]?.label || activeDetailItem.targetDocumentId}
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Flow Details Stats */}
                <View style={[styles.detailsStatsBox, { borderColor: themeColors.border }]}>
                  <View style={styles.detailsStatsCol}>
                    <Text style={styles.detailsStatsLabel}>{localT.totalCost}</Text>
                    <Text style={[styles.detailsStatsVal, { color: themeColors.text }]}>
                      {getCleanFee(activeDetailItem.targetDocumentId)}
                    </Text>
                  </View>
                  <View style={styles.detailsStatsCol}>
                    <Text style={styles.detailsStatsLabel}>{localT.completedOn}</Text>
                    <Text style={[styles.detailsStatsVal, { color: themeColors.text }]}>
                      {formatDate(activeDetailItem.completedAt)}
                    </Text>
                  </View>
                </View>

                {/* Subgraph Steps List */}
                <Text style={[styles.filterGroupLabel, { color: themeColors.text, marginTop: 16 }]}>
                  {localT.stepsCompleted} ({activeDetailItem.stepCount})
                </Text>

                <View style={{ gap: 10, marginTop: 8 }}>
                  {getFlowSteps(activeDetailItem.targetDocumentId).map((step, idx) => {
                    const stepBadge = getBadgeColors(step.id, step.agency);
                    return (
                      <View
                        key={`flow-step-${step.id}`}
                        style={[
                          styles.detailStepItemCard,
                          {
                            backgroundColor: isDarkMode ? '#231A12' : '#FBF9F6',
                            borderColor: themeColors.border,
                          }
                        ]}
                      >
                        <View style={[styles.iconBadgeCircle, { backgroundColor: stepBadge.bg, width: 34, height: 34, borderRadius: 17, marginRight: 10 }]}>
                          <Ionicons name={stepBadge.iconName} size={15} color={stepBadge.iconColor} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: themeColors.text }}>
                            {idx + 1}. {step.label}
                          </Text>
                          <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: themeColors.subText, marginTop: 2 }}>
                            {step.agency} • {step.officeType}
                          </Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={18} color="#0D6251" />
                      </View>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Close Button */}
              <TouchableOpacity
                style={[styles.modalButton, styles.saveBtn, { backgroundColor: themeColors.primary, marginTop: 12 }]}
                activeOpacity={0.7}
                onPress={() => setIsDetailModalVisible(false)}
              >
                <Text style={styles.saveBtnText}>
                  {localT.close}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  premiumHeaderBar: {
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumHeaderTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    flex: 1,
    textAlign: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchInputField: {
    flex: 1,
    height: 36,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    marginRight: spacing.sm,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1.5,
  },
  historyCard: {
    borderRadius: radii.lg,
    marginHorizontal: 24,
    marginBottom: spacing.md,
    padding: 16,
    ...shadows.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardMiddleBlock: {
    flex: 1,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docLabelText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    flex: 1,
    paddingRight: 8,
  },
  priceLabelText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  finishedStepsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  badgesActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  pillBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#0E6251',
    letterSpacing: 0.5,
  },
  detailsLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsLinkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    marginRight: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  demoLoadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  demoLoadBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  promoCard: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: radii.lg,
    padding: 24,
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderWidth: 1.2,
    borderLeftWidth: 6,
    ...shadows.sm,
  },
  promoTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  promoDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  promoBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.xl,
    borderTopWidth: 1.5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterGroupLabel: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.sm,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  filterSelectBtn: {
    flex: 1,
    height: 42,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  cancelBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  saveBtn: {
    elevation: 2,
  },
  saveBtnText: {
    color: defaultColors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  detailsStatsBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
    gap: 12,
  },
  detailsStatsCol: {
    flex: 1,
    alignItems: 'center',
  },
  detailsStatsLabel: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    color: '#737373',
    textTransform: 'uppercase',
  },
  detailsStatsVal: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    marginTop: 4,
  },
  detailStepItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
  },
});
