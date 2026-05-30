import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import DAGExplorer from '../src/components/DAGExplorer';
import NodeDetailSheet from '../src/components/NodeDetailSheet';
import LinearTimeline from '../src/components/LinearTimeline';
import { REQUIREMENTS_GRAPH } from '../src/algorithms/requirementsGraph';
import { colors as defaultColors, spacing, radii, typography, shadows } from '../src/theme';
import { DocumentId } from '../src/context/types';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';
import HeaderBar from '../src/components/HeaderBar';

const BulletPoint = ({ children }: { children: React.ReactNode }) => {
  const { colors: themeColors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
      <Text style={{ color: themeColors.subText, fontSize: 13, marginRight: 8 }}>•</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18, color: themeColors.subText }}>
          {children}
        </Text>
      </View>
    </View>
  );
};

// High-Fidelity Expandable FAQ Accordion Dropdown
interface FAQAccordionItemProps {
  question: string;
  children: React.ReactNode;
  themeColors: any;
}

function FAQAccordionItem({ question, children, themeColors }: FAQAccordionItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.faqItem, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
      <TouchableOpacity
        style={styles.faqHeader}
        activeOpacity={0.8}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={[styles.faqQuestion, { color: themeColors.text }]}>
          {question}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={themeColors.subText}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.faqContainer}>
          {children}
        </View>
      )}
    </View>
  );
}

export default function ExplorerScreen() {
  const { state, dispatch } = useDocumentContext();
  const router = useRouter();
  const [highlightAttainable, setHighlightAttainable] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<DocumentId | null>(null);
  const { colors: themeColors, isDarkMode } = useTheme();
  const { t, language } = useLanguage();

  const isSimple = state.userMode === 'simple';

  // Derived Graph Stats (Advanced Mode Only)
  const totalNodes = Object.keys(REQUIREMENTS_GRAPH).length;
  
  const totalEdges = Object.values(REQUIREMENTS_GRAPH).reduce(
    (sum, n) => sum + n.prerequisites.length,
    0
  );

  const ownedCount = state.possessedDocuments.size;

  // Calculate attainable documents
  const attainableCount = Object.entries(REQUIREMENTS_GRAPH).filter(([id, node]) => {
    if (state.possessedDocuments.has(id)) return false;
    return node.prerequisites.every((prereq) => state.possessedDocuments.has(prereq));
  }).length;

  const remainingCount = state.roadmap.filter((step) => !step.isDone).length;

  // Estimated days & costs based on remaining steps
  const estDays = state.roadmap.reduce((sum, step) => {
    if (step.isDone) return sum;
    const daysStr = step.document.typicalDays.toLowerCase();
    if (daysStr.includes('same day')) return sum + 0.5;
    const match = daysStr.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 1);
  }, 0);

  const estCost = state.roadmap.reduce((sum, step) => {
    if (step.isDone) return sum;
    const feesStr = step.document.fees.toLowerCase();
    if (feesStr.includes('free')) return sum;
    const match = feesStr.replace(/,/g, '').match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);

  const handleNodeSelect = (id: DocumentId) => {
    setSelectedNodeId(id);
  };

  const handleSetTarget = (id: DocumentId) => {
    dispatch({ type: 'SET_TARGET', payload: id });
    router.push('/roadmap');
  };

  const handleTogglePossession = (id: DocumentId) => {
    dispatch({ type: 'TOGGLE_DOCUMENT', payload: id });
  };

  const renderHeader = () => {
    return (
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <View style={styles.headerTitleCol}>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            {isSimple ? (language === 'en' ? 'Explore Guides' : 'I-explore ang mga Dokumento') : (language === 'en' ? 'Graph Explorer' : 'Explorer sa Graph')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.subText }]}>
            {isSimple ? t.explorerSubtitleSimple : t.explorerSubtitleAdvanced}
          </Text>
          <View style={[styles.statBadge, isDarkMode && { backgroundColor: 'rgba(0, 107, 128, 0.2)' }]}>
            <Text style={[styles.statBadgeText, { color: isDarkMode ? '#6cd3f7' : defaultColors.secondaryTeal }]}>
              {language === 'en' ? '✓ 114 verified branches nationwide' : '✓ 114 na-verify na sangay sa buong bansa'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Senior FAQ view for Simple Mode
  const renderSimpleHelp = () => {
    const activeRoadmapSteps = state.roadmap.filter((step) => !step.isDone);

    return (
      <ScrollView style={[styles.simpleScroll, { backgroundColor: themeColors.background }]} contentContainerStyle={styles.simpleScrollContent}>
        
        {/* Horizontal Active Path Timeline Progress Strip (Stitch High-Fidelity Specs) */}
        {state.targetDocument && activeRoadmapSteps.length > 0 ? (
          <View style={[styles.activePathContainer, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <View style={styles.activePathHeader}>
              <Text style={[styles.activePathTitle, { color: isDarkMode ? defaultColors.primaryTerracottaDark : defaultColors.primaryTerracotta }]}>
                {language === 'en' ? 'ACTIVE PATH' : 'AKTIBONG PROSESO'}
              </Text>
              <Text style={[styles.activePathStepsCount, { color: themeColors.subText }]}>
                {activeRoadmapSteps.length} {language === 'en' ? (activeRoadmapSteps.length === 1 ? 'Step' : 'Steps') : 'Hakbang'} {language === 'en' ? 'remaining' : 'ang natitira'}
              </Text>
            </View>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalTimelineScroll}>
              <View style={styles.horizontalTimelineWrapper}>
                {state.roadmap.map((step, idx) => {
                  const isLast = idx === state.roadmap.length - 1;
                  const isStepDone = step.isDone;
                  const isCurrent = !isStepDone && (idx === 0 || state.roadmap[idx - 1]?.isDone);
                  
                  let badgeBg = themeColors.border;
                  let iconColor = themeColors.subText;
                  let fontColor = themeColors.subText;
                  
                  if (isStepDone) {
                    badgeBg = defaultColors.tertiaryGreen;
                    iconColor = defaultColors.white;
                    fontColor = defaultColors.tertiaryGreen;
                  } else if (isCurrent) {
                    badgeBg = isDarkMode ? defaultColors.primaryTerracottaDark : defaultColors.primaryTerracotta;
                    iconColor = defaultColors.white;
                    fontColor = isDarkMode ? defaultColors.primaryTerracottaDark : defaultColors.primaryTerracotta;
                  }

                  // Agency icon maps
                  const getAgencyIcon = (agency: string) => {
                    switch (agency) {
                      case 'PSA': return 'person-sharp';
                      case 'DFA': return 'airplane-sharp';
                      case 'NBI': return 'finger-print-sharp';
                      case 'LTO': return 'car-sharp';
                      case 'COMELEC': return 'checkbox-sharp';
                      case 'PHILSYS': return 'card-sharp';
                      case 'PRC': return 'school-sharp';
                      case 'SSS': return 'people-sharp';
                      case 'GSIS': return 'briefcase-sharp';
                      case 'PHILHEALTH': return 'heart-sharp';
                      case 'PAGIBIG': return 'home-sharp';
                      case 'PHLPOST': return 'mail-sharp';
                      case 'BIR': return 'cash-sharp';
                      default: return 'document-text-sharp';
                    }
                  };

                  return (
                    <React.Fragment key={`horiz-${step.document.id}`}>
                      <View style={styles.horizontalStepNode}>
                        <View style={[styles.horizontalStepBadge, { backgroundColor: badgeBg }]}>
                          <Ionicons name={getAgencyIcon(step.document.agency) as any} size={14} color={iconColor} />
                        </View>
                        <Text style={[styles.horizontalStepLabel, { color: fontColor }]} numberOfLines={1}>
                          {step.document.agency}
                        </Text>
                      </View>
                      {!isLast && (
                        <View style={[styles.horizontalConnector, { backgroundColor: isStepDone ? defaultColors.tertiaryGreen : themeColors.border }]} />
                      )}
                    </React.Fragment>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        ) : (
          <View style={[styles.helpBanner, { backgroundColor: isDarkMode ? '#1E1E1E' : defaultColors.backgroundPaperLight, borderColor: themeColors.border }]}>
            <Ionicons name="compass-outline" size={32} color={themeColors.primary} style={{ marginBottom: 8 }} />
            <Text style={[styles.bannerTitle, { color: themeColors.text }]}>{t.noActiveJourneyGuideTitle}</Text>
            <Text style={[styles.bannerText, { color: themeColors.subText }]}>
              {language === 'en'
                ? "Go to the Find ID tab and choose a document you want to get. We will lay out a simple timeline here to guide you!"
                : "Pumunta sa Maghanap ng ID tab at pumili ng dokumentong nais mong makuha. Maglalagay kami ng simpleng timeline dito para gabayan ka!"}
            </Text>
            <TouchableOpacity
              style={[styles.bannerBtn, { backgroundColor: themeColors.primary }]}
              onPress={() => router.push('/target')}
              activeOpacity={0.8}
            >
              <Text style={styles.bannerBtnText}>{t.chooseTargetIdBtn}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Location Safety Alert Callout (Stitch Mockup Widget) */}
        <View style={[styles.warningCallout, { backgroundColor: defaultColors.warningBg, borderColor: isDarkMode ? defaultColors.primaryTerracottaDark : defaultColors.primaryTerracotta }]}>
          <Ionicons name="warning-sharp" size={20} color={defaultColors.primaryTerracotta} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.warningCalloutTitle}>
              {language === 'en' ? 'LOCATION SAFETY ALERT' : 'PAALALA SA LOKASYON'}
            </Text>
            <Text style={styles.warningCalloutText}>
              {language === 'en'
                ? 'Some PSA and NBI offices require early morning appointments due to high citizen capacity. Consult verified nearest branches for daily slots.'
                : 'May ilang sangay ng PSA at NBI na nangangailangan ng mas maagang appointment dahil sa limitadong slot. I-check ang mapa para sa pinakamalapit na Satellite Office.'}
            </Text>
          </View>
        </View>

        {/* Senior Frequently Asked Questions in high-fidelity collapsible accordion */}
        <Text style={[styles.faqSectionTitle, { color: themeColors.text }]}>{t.faqSectionTitle}</Text>

        <FAQAccordionItem
          question={language === 'en' ? '1. What documents should I get first?' : '1. Anong mga dokumento ang dapat kong makuha muna?'}
          themeColors={themeColors}
        >
          <Text style={[styles.faqAnswerText, { color: themeColors.subText }]}>
            {language === 'en' ? (
              <>Foundational documents like your <Text style={styles.boldText}>PSA Birth Certificate</Text> and <Text style={styles.boldText}>Barangay Cedula</Text> have no prerequisites. They are required to get almost all other primary government IDs, so we recommend acquiring them first!</>
            ) : (
              <>Ang mga foundational na dokumento tulad ng iyong <Text style={styles.boldText}>PSA Birth Certificate</Text> at <Text style={styles.boldText}>Barangay Cedula</Text> ay walang prerequisite. Kinakailangan ang mga ito upang makuha ang halos lahat ng iba pang pangunahing government ID, kaya inirerekomenda naming kunin muna ang mga ito!</>
            )}
          </Text>
        </FAQAccordionItem>

        <FAQAccordionItem
          question={language === 'en' ? '2. How do I use this app?' : '2. Paano ko gagamitin ang app na ito?'}
          themeColors={themeColors}
        >
          {language === 'en' ? (
            <View style={{ gap: 4 }}>
              <BulletPoint>
                Go to the <Text style={styles.boldText}>Documents</Text> tab first. Check the boxes for any IDs you already possess.
              </BulletPoint>
              <BulletPoint>
                Go to the <Text style={styles.boldText}>Find ID</Text> tab and choose the ID you need (e.g. Philippine Passport).
              </BulletPoint>
              <BulletPoint>
                We will generate a step-by-step roadmap showing you exactly what to do!
              </BulletPoint>
            </View>
          ) : (
            <View style={{ gap: 4 }}>
              <BulletPoint>
                Pumunta muna sa <Text style={styles.boldText}>Dokumento</Text> tab. Markahan ang mga ID na mayroon ka na.
              </BulletPoint>
              <BulletPoint>
                Pumunta sa <Text style={styles.boldText}>Maghanap ng ID</Text> tab at piliin ang ID na kailangan mo (hal. Philippine Passport).
              </BulletPoint>
              <BulletPoint>
                Gagawa kami ng sunod-sunod na gabay na nagpapakita kung ano mismo ang dapat mong gawin!
              </BulletPoint>
            </View>
          )}
        </FAQAccordionItem>

        <FAQAccordionItem
          question={language === 'en' ? '3. Do I need an internet connection?' : '3. Kailangan ko ba ng internet connection?'}
          themeColors={themeColors}
        >
          <Text style={[styles.faqAnswerText, { color: themeColors.subText }]}>
            {language === 'en' ? (
              <>No! LakadPapel runs completely offline on your device, making it perfect to use in physical government waiting rooms where cellular signal is often weak.</>
            ) : (
              <>Hindi! Ang LakadPapel ay ganap na gumagana offline sa iyong device, kaya perpekto itong gamitin sa mga waiting room ng gobyerno kung saan madalas na mahina ang signal ng cellular.</>
            )}
          </Text>
        </FAQAccordionItem>

        <FAQAccordionItem
          question={language === 'en' ? '4. How is my nearest branch computed?' : '4. Paano kinakalkula ang aking pinakamalapit na sangay?'}
          themeColors={themeColors}
        >
          <Text style={[styles.faqAnswerText, { color: themeColors.subText }]}>
            {language === 'en' ? (
              <>The app securely checks your device\'s GPS and looks through our preloaded list of Philippine branch coordinates to find the branch closest to you instantly.</>
            ) : (
              <>Ligtas na sinusuri ng app ang GPS ng iyong device at hinahanap sa aming preloaded na listahan ng mga coordinate ng sangay sa Pilipinas upang mahanap agad ang sangay na pinakamalapit sa iyo.</>
            )}
          </Text>
        </FAQAccordionItem>

        {/* Explore Branches Styled Map Preview Banner (Stitch visual anchor) */}
        <View style={[styles.exploreBranchesCard, { borderColor: themeColors.border, backgroundColor: themeColors.cardBackground }]}>
          <View style={styles.mapPreviewGradientContainer}>
            <Ionicons name="map-sharp" size={32} color={isDarkMode ? defaultColors.secondaryTealDark : defaultColors.secondaryTeal} style={{ marginBottom: 6 }} />
            <Text style={[styles.mapPreviewTitle, { color: themeColors.text }]}>
              {language === 'en' ? 'Explore Nearest Branch Locations' : 'Galugarin ang mga Sangay'}
            </Text>
            <Text style={[styles.mapPreviewSubtitle, { color: themeColors.subText }]}>
              {language === 'en' ? 'Navigate offline to nearest centers' : 'I-browse ang pinakamalapit na ahensya'}
            </Text>
            <TouchableOpacity
              style={[styles.mapPreviewBtn, { backgroundColor: themeColors.primary }]}
              activeOpacity={0.8}
              onPress={() => router.push('/target')}
            >
              <Text style={styles.mapPreviewBtnText}>
                {language === 'en' ? 'Open Map Search' : 'Buksan ang Mapa'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    );
  };

  // ----------------------------------------------------
  // ADVANCED MODE VIEW
  // ----------------------------------------------------
  if (isSimple) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <HeaderBar />
        {renderHeader()}
        {renderSimpleHelp()}
      </SafeAreaView>
    );
  }

  // Advanced Mode DAG rendering
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <HeaderBar />
      {renderHeader()}

      {/* 2. Color Legend */}
      <View style={[styles.legendRow, { borderBottomColor: themeColors.border }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: defaultColors.tertiaryGreen }]} />
          <Text style={[styles.legendText, { color: themeColors.text }]}>{t.colorLegendOwned}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: defaultColors.secondaryTeal }]} />
          <Text style={[styles.legendText, { color: themeColors.text }]}>{t.colorLegendAvailable}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: isDarkMode ? '#404040' : defaultColors.borderSubtle }]} />
          <Text style={[styles.legendText, { color: themeColors.text }]}>{t.colorLegendLocked}</Text>
        </View>
        {state.targetDocument && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: isDarkMode ? defaultColors.primaryTerracottaDark : defaultColors.primaryTerracotta }]} />
            <Text style={[styles.legendText, { color: themeColors.text }]}>{t.colorLegendTarget}</Text>
          </View>
        )}
      </View>

      {/* 3. Live Graph Stats Bar */}
      <View style={[styles.statsBarContainer, { borderBottomColor: themeColors.border, backgroundColor: isDarkMode ? '#120E0A' : defaultColors.backgroundPaperLight }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScroll}
        >
          <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <Text style={[styles.statNum, { color: themeColors.text }]}>{totalNodes}</Text>
            <Text style={[styles.statLabel, { color: themeColors.subText }]}>{t.totalNodes}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <Text style={[styles.statNum, { color: themeColors.text }]}>{totalEdges}</Text>
            <Text style={[styles.statLabel, { color: themeColors.subText }]}>{t.edges}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <Text style={[styles.statNum, { color: defaultColors.tertiaryGreen }]}>{ownedCount}</Text>
            <Text style={[styles.statLabel, { color: themeColors.subText }]}>{t.owned}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <Text style={[styles.statNum, { color: defaultColors.secondaryTeal }]}>{attainableCount}</Text>
            <Text style={[styles.statLabel, { color: themeColors.subText }]}>{t.colorLegendAvailable}</Text>
          </View>
          {state.targetDocument && (
            <>
              <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                <Text style={[styles.statNum, { color: isDarkMode ? defaultColors.primaryTerracottaDark : defaultColors.primaryTerracotta }]}>{remainingCount}</Text>
                <Text style={[styles.statLabel, { color: themeColors.subText }]}>{t.remaining}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                <Text style={[styles.statNum, { color: themeColors.text }]}>{estDays}d</Text>
                <Text style={[styles.statLabel, { color: themeColors.subText }]}>{t.estDays}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                <Text style={[styles.statNum, { color: themeColors.text }]}>₱{estCost}</Text>
                <Text style={[styles.statLabel, { color: themeColors.subText }]}>{t.estCost}</Text>
              </View>
            </>
          )}
        </ScrollView>
      </View>

      {/* 4. Interactive Vector Canvas */}
      <ScrollView
        style={styles.canvasScroll}
        contentContainerStyle={styles.canvasScrollContent}
      >
        <DAGExplorer
          possessedDocuments={state.possessedDocuments}
          targetDocumentId={state.targetDocument}
          highlightAttainable={highlightAttainable}
          selectedNodeId={selectedNodeId}
          onNodeSelect={handleNodeSelect}
        />
      </ScrollView>

      {/* 5. Highlight Mode Switch */}
      <View style={[styles.floatingActionRow, { backgroundColor: themeColors.cardBackground, borderTopColor: themeColors.border }]}>
        <View style={styles.floatingActionLabelCol}>
          <Text style={[styles.actionRowTitle, { color: themeColors.text }]}>{language === 'en' ? 'Highlight Attainable' : 'I-highlight ang Makukuha na'}</Text>
          <Text style={[styles.actionRowDesc, { color: themeColors.subText }]}>{language === 'en' ? 'Dims locked nodes dynamically' : 'Nilalamlam ang mga naka-lock na node'}</Text>
        </View>
        <Switch
          value={highlightAttainable}
          onValueChange={setHighlightAttainable}
          trackColor={{ false: defaultColors.borderSubtle, true: themeColors.primary }}
          thumbColor={highlightAttainable ? '#ffffff' : '#f4f3f4'}
        />
      </View>

      {/* 6. Dynamic Detail Bottom Sheet Modal */}
      <NodeDetailSheet
        documentId={selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
        onSetTarget={handleSetTarget}
        onTogglePossession={handleTogglePossession}
        isPossessed={selectedNodeId !== null && state.possessedDocuments.has(selectedNodeId)}
        isTarget={selectedNodeId !== null && state.targetDocument === selectedNodeId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitleCol: {
    flex: 1,
    paddingRight: 12,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 28,
  },
  headerSubtitle: {
    ...typography.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  modeToggleText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  simpleScroll: {
    flex: 1,
  },
  simpleScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  helpBanner: {
    padding: 20,
    borderWidth: 1,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
    marginBottom: 20,
  },
  bannerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 6,
  },
  bannerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  bannerBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  bannerBtnText: {
    color: defaultColors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  faqSectionTitle: {
    ...typography.sectionHeader,
    fontSize: 12,
    color: defaultColors.gray900,
    marginTop: 8,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  faqItem: {
    borderWidth: 1,
    borderRadius: radii.md,
    marginBottom: 12,
    ...shadows.sm,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    ...typography.cardSemibold,
    fontSize: 14,
    flex: 1,
    paddingRight: 8,
  },
  faqContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: defaultColors.borderSubtle,
    paddingTop: 12,
  },
  faqAnswerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'justify',
  },
  statBadge: {
    backgroundColor: 'rgba(0, 103, 128, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  statBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  boldText: {
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },

  // Color Legend (Advanced Mode Only)
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },

  // Live Stats Bar (Advanced Mode Only)
  statsBarContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statsScroll: {
    paddingHorizontal: 24,
    gap: 10,
  },
  statCard: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    ...shadows.sm,
  },
  statNum: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  statLabel: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // Vector Canvas (Advanced Mode Only)
  canvasScroll: {
    flex: 1,
  },
  canvasScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  floatingActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  floatingActionLabelCol: {
    flex: 1,
    paddingRight: 16,
  },
  actionRowTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  actionRowDesc: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },

  // 1. Horizontal Active Path Timeline Progress Strip (Stitch mockup)
  activePathContainer: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radii.lg,
    ...shadows.sm,
    marginBottom: 20,
  },
  activePathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: defaultColors.borderSubtle,
    paddingBottom: 6,
    marginBottom: spacing.sm,
  },
  activePathTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  activePathStepsCount: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  horizontalTimelineScroll: {
    paddingVertical: 4,
  },
  horizontalTimelineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  horizontalStepNode: {
    alignItems: 'center',
    width: 60,
  },
  horizontalStepBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  horizontalStepLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    marginTop: 4,
    textAlign: 'center',
  },
  horizontalConnector: {
    height: 3,
    width: 32,
    marginTop: -14, // align vertically with badges centers
  },

  // 2. Location Warning Alert (Stitch callout mockup)
  warningCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1.5,
    borderLeftWidth: 5,
    borderRadius: radii.md,
    marginBottom: 20,
    elevation: 1,
  },
  warningCalloutTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1,
    color: defaultColors.primaryTerracotta,
    marginBottom: 3,
  },
  warningCalloutText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: '#7c2d12',
    textAlign: 'justify',
  },

  // 3. Explore Branches map preview card (Stitch visual anchor)
  exploreBranchesCard: {
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginTop: 20,
    ...shadows.sm,
  },
  mapPreviewGradientContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPreviewTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    textAlign: 'center',
  },
  mapPreviewSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    marginBottom: 14,
    textAlign: 'center',
  },
  mapPreviewBtn: {
    height: 38,
    paddingHorizontal: 20,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  mapPreviewBtnText: {
    color: defaultColors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
