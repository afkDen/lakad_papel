import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import DAGExplorer from '../src/components/DAGExplorer';
import NodeDetailSheet from '../src/components/NodeDetailSheet';
import LinearTimeline from '../src/components/LinearTimeline';
import { REQUIREMENTS_GRAPH } from '../src/algorithms/requirementsGraph';
import { colors, spacing, radii, typography, shadows } from '../src/theme';
import { DocumentId } from '../src/context/types';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';

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
            {isSimple ? t.explorerTitleSimple : (language === 'en' ? 'Graph Explorer' : 'Explorer sa Graph')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.subText }]}>
            {isSimple ? t.explorerSubtitleSimple : t.explorerSubtitleAdvanced}
          </Text>
        </View>
        
        {/* Simple / Advanced Mode Toggler */}
        <TouchableOpacity
          style={[
            styles.modeToggleBtn,
            isSimple && { backgroundColor: isDarkMode ? '#262626' : '#eff6ff', borderColor: isDarkMode ? '#404040' : '#bfdbfe' },
            !isSimple && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
          ]}
          onPress={() => dispatch({ type: 'TOGGLE_USER_MODE' })}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isSimple ? "accessibility-sharp" : "git-network-sharp"}
            size={12}
            color={isSimple ? (isDarkMode ? themeColors.subText : colors.teal600) : colors.white}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.modeToggleText,
              isSimple && { color: isDarkMode ? themeColors.subText : colors.teal600 },
              !isSimple && { color: colors.white }
            ]}
          >
            {isSimple ? 'Simple' : 'Advanced'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Senior FAQ view for Simple Mode
  const renderSimpleHelp = () => {
    const activeRoadmapSteps = state.roadmap.filter((step) => !step.isDone);

    return (
      <ScrollView style={[styles.simpleScroll, { backgroundColor: themeColors.background }]} contentContainerStyle={styles.simpleScrollContent}>
        {/* Display Milestone Timeline inside Guide page if target selected */}
        {state.targetDocument && activeRoadmapSteps.length > 0 ? (
          <View style={{ marginBottom: 20 }}>
            <LinearTimeline roadmap={activeRoadmapSteps} />
          </View>
        ) : (
          <View style={[styles.helpBanner, { backgroundColor: isDarkMode ? '#1E1E1E' : colors.gray50, borderColor: themeColors.border }]}>
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

        {/* Senior Frequently Asked Questions */}
        <Text style={[styles.faqSectionTitle, { color: themeColors.text }]}>{t.faqSectionTitle}</Text>

        <View style={[styles.faqItem, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <Text style={[styles.faqQuestion, { color: themeColors.text }]}>
            {language === 'en' ? '1. What documents should I get first?' : '1. Anong mga dokumento ang dapat kong makuha muna?'}
          </Text>
          <Text style={[styles.faqAnswer, { color: themeColors.subText }]}>
            {language === 'en' ? (
              <>Foundational documents like your <Text style={styles.boldText}>PSA Birth Certificate</Text> and <Text style={styles.boldText}>Barangay Cedula</Text> have no prerequisites. They are required to get almost all other primary government IDs, so we recommend acquiring them first!</>
            ) : (
              <>Ang mga foundational na dokumento tulad ng iyong <Text style={styles.boldText}>PSA Birth Certificate</Text> at <Text style={styles.boldText}>Barangay Cedula</Text> ay walang prerequisite. Kinakailangan ang mga ito upang makuha ang halos lahat ng iba pang pangunahing government ID, kaya inirerekomenda naming kunin muna ang mga ito!</>
            )}
          </Text>
        </View>

        <View style={[styles.faqItem, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <Text style={[styles.faqQuestion, { color: themeColors.text }]}>
            {language === 'en' ? '2. How do I use this app?' : '2. Paano ko gagamitin ang app na ito?'}
          </Text>
          <Text style={[styles.faqAnswer, { color: themeColors.subText }]}>
            {language === 'en' ? (
              <>
                • Go to the <Text style={styles.boldText}>Documents</Text> tab first. Check the boxes for any IDs you already possess.{"\n"}
                • Go to the <Text style={styles.boldText}>Find ID</Text> tab and choose the ID you need (e.g. Philippine Passport).{"\n"}
                • We will generate a step-by-step roadmap showing you exactly what to do!
              </>
            ) : (
              <>
                • Pumunta muna sa <Text style={styles.boldText}>Dokumento</Text> tab. Markahan ang mga ID na mayroon ka na.{"\n"}
                • Pumunta sa <Text style={styles.boldText}>Maghanap ng ID</Text> tab at piliin ang ID na kailangan mo (hal. Philippine Passport).{"\n"}
                • Gagawa kami ng sunod-sunod na gabay na nagpapakita kung ano mismo ang dapat mong gawin!
              </>
            )}
          </Text>
        </View>

        <View style={[styles.faqItem, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <Text style={[styles.faqQuestion, { color: themeColors.text }]}>
            {language === 'en' ? '3. Do I need an internet connection?' : '3. Kailangan ko ba ng internet connection?'}
          </Text>
          <Text style={[styles.faqAnswer, { color: themeColors.subText }]}>
            {language === 'en' ? (
              <>No! LakadPapel runs completely offline on your device, making it perfect to use in physical government waiting rooms where cellular signal is often weak.</>
            ) : (
              <>Hindi! Ang LakadPapel ay ganap na gumagana offline sa iyong device, kaya perpekto itong gamitin sa mga waiting room ng gobyerno kung saan madalas na mahina ang signal ng cellular.</>
            )}
          </Text>
        </View>

        <View style={[styles.faqItem, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <Text style={[styles.faqQuestion, { color: themeColors.text }]}>
            {language === 'en' ? '4. How is my nearest branch computed?' : '4. Paano kinakalkula ang aking pinakamalapit na sangay?'}
          </Text>
          <Text style={[styles.faqAnswer, { color: themeColors.subText }]}>
            {language === 'en' ? (
              <>The app securely checks your device's GPS and looks through our preloaded list of Philippine branch coordinates to find the branch closest to you instantly.</>
            ) : (
              <>Ligtas na sinusuri ng app ang GPS ng iyong device at hinahanap sa aming preloaded na listahan ng mga coordinate ng sangay sa Pilipinas upang mahanap agad ang sangay na pinakamalapit sa iyo.</>
            )}
          </Text>
        </View>
      </ScrollView>
    );
  };

  // ----------------------------------------------------
  // ADVANCED MODE VIEW
  // ----------------------------------------------------
  if (isSimple) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        {renderHeader()}
        {renderSimpleHelp()}
      </SafeAreaView>
    );
  }

  // Advanced Mode DAG rendering
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {renderHeader()}

      {/* 2. Color Legend */}
      <View style={[styles.legendRow, { borderBottomColor: themeColors.border }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.green600 }]} />
          <Text style={[styles.legendText, { color: themeColors.text }]}>{t.colorLegendOwned}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.teal600 }]} />
          <Text style={[styles.legendText, { color: themeColors.text }]}>{t.colorLegendAvailable}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: isDarkMode ? '#404040' : colors.gray300 }]} />
          <Text style={[styles.legendText, { color: themeColors.text }]}>{t.colorLegendLocked}</Text>
        </View>
        {state.targetDocument && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.blue600 }]} />
            <Text style={[styles.legendText, { color: themeColors.text }]}>{t.colorLegendTarget}</Text>
          </View>
        )}
      </View>

      {/* 3. Live Graph Stats Bar */}
      <View style={[styles.statsBarContainer, { borderBottomColor: themeColors.border, backgroundColor: isDarkMode ? '#121212' : colors.gray50 }]}>
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
            <Text style={[styles.statNum, { color: colors.green600 }]}>{ownedCount}</Text>
            <Text style={[styles.statLabel, { color: themeColors.subText }]}>{t.owned}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <Text style={[styles.statNum, { color: colors.teal600 }]}>{attainableCount}</Text>
            <Text style={[styles.statLabel, { color: themeColors.subText }]}>{t.colorLegendAvailable}</Text>
          </View>
          {state.targetDocument && (
            <>
              <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
                <Text style={[styles.statNum, { color: colors.blue600 }]}>{remainingCount}</Text>
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

      {/* 4. Top control tools */}
      <View style={[styles.topControlBar, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          style={[
            styles.highlightBtn,
            highlightAttainable && styles.highlightBtnActive,
            { borderColor: themeColors.border }
          ]}
          onPress={() => setHighlightAttainable(!highlightAttainable)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={highlightAttainable ? "flash" : "flash-outline"}
            size={16}
            color={highlightAttainable ? colors.white : colors.teal600}
            style={styles.highlightBtnIcon}
          />
          <Text
            style={[
              styles.highlightBtnText,
              highlightAttainable && styles.highlightBtnTextActive,
              !highlightAttainable && { color: isDarkMode ? themeColors.subText : colors.teal600 }
            ]}
          >
            {language === 'en' ? 'Highlight Next Steps' : 'I-highlight ang mga Susunod na Hakbang'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 5. Canvas View Area (Horizontal + Vertical Scrollable Grid) */}
      <View style={[styles.canvasContainer, { backgroundColor: themeColors.background }]}>
        <ScrollView style={styles.vertScroll} contentContainerStyle={styles.vertScrollContent}>
          <ScrollView horizontal style={styles.horizScroll} contentContainerStyle={styles.horizScrollContent}>
            <DAGExplorer
              possessedDocuments={state.possessedDocuments}
              targetDocumentId={state.targetDocument}
              highlightAttainable={highlightAttainable}
              selectedNodeId={selectedNodeId}
              onNodeSelect={handleNodeSelect}
            />
          </ScrollView>
        </ScrollView>
      </View>

      {/* 6. Details Drawer Bottom Sheet */}
      <NodeDetailSheet
        documentId={selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
        onSetTarget={handleSetTarget}
        onTogglePossession={handleTogglePossession}
        isPossessed={selectedNodeId ? state.possessedDocuments.has(selectedNodeId) : false}
        isTarget={selectedNodeId ? state.targetDocument === selectedNodeId : false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 20,
    paddingBottom: 4,
    backgroundColor: colors.white,
  },
  headerTitleCol: {
    flex: 1,
    paddingRight: spacing.md,
  },
  headerTitle: {
    ...typography.screenTitle,
    fontSize: 22,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.gray500,
    marginTop: 2,
    lineHeight: 15,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 2,
  },
  modeToggleBtnActive: {
    backgroundColor: colors.blue600,
    borderColor: colors.blue600,
  },
  modeToggleText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: colors.teal600,
  },
  modeToggleTextActive: {
    color: colors.white,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    marginRight: 4,
  },
  legendText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.gray500,
  },
  statsBarContainer: {
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.gray50,
  },
  statsScroll: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radii.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 44,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNum: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: colors.gray900,
  },
  statLabel: {
    fontSize: 8,
    fontFamily: 'Inter_400Regular',
    color: colors.gray500,
    marginTop: 1,
  },
  topControlBar: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.white,
  },
  highlightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.teal600,
    borderRadius: radii.md,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  highlightBtnActive: {
    backgroundColor: colors.teal600,
    borderColor: colors.teal600,
  },
  highlightBtnIcon: {
    marginRight: 4,
  },
  highlightBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: colors.teal600,
  },
  highlightBtnTextActive: {
    color: colors.white,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  vertScroll: {
    flex: 1,
  },
  vertScrollContent: {
    flexGrow: 1,
  },
  horizScroll: {
    flex: 1,
  },
  horizScrollContent: {
    flexGrow: 1,
  },
  // Simple Mode styles
  simpleScroll: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  simpleScrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  helpBanner: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radii.md,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...shadows.sm,
  },
  bannerTitle: {
    ...typography.cardSemibold,
    color: colors.gray900,
    fontSize: 16,
    marginBottom: 4,
  },
  bannerText: {
    ...typography.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    color: colors.gray500,
  },
  bannerBtn: {
    backgroundColor: colors.blue600,
    borderRadius: radii.md,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  bannerBtnText: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  faqSectionTitle: {
    ...typography.sectionHeader,
    fontSize: 12,
    color: colors.gray900,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  faqItem: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 12,
    ...shadows.sm,
  },
  faqQuestion: {
    ...typography.cardSemibold,
    fontSize: 14,
    color: colors.gray900,
    marginBottom: 6,
  },
  faqAnswer: {
    ...typography.secondary,
    fontSize: 13,
    lineHeight: 19,
    color: colors.gray500,
    textAlign: 'justify',
  },
  boldText: {
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
    color: colors.gray900,
  },
});
