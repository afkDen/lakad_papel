import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking, Modal, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../src/context/ThemeContext';
import { useLanguage } from '../src/context/LanguageContext';
import { useDocumentContext } from '../src/hooks/useDocumentContext';
import { useLocation } from '../src/hooks/useLocation';
import { colors as defaultColors, radii, spacing, shadows, typography } from '../src/theme';

export default function SettingsScreen() {
  const { colors: themeColors, isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { state, dispatch } = useDocumentContext();
  const { permissionGranted, requestPermission } = useLocation();

  // Profile state backed by AsyncStorage
  const [profileName, setProfileName] = React.useState('Juan Dela Cruz');
  const [profileLocation, setProfileLocation] = React.useState('Lungsod ng Quezon');
  const [profileAvatarIndex, setProfileAvatarIndex] = React.useState(0);
  const [profileImageUri, setProfileImageUri] = React.useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);

  // Temporary edit states
  const [editName, setEditName] = React.useState('');
  const [editLocation, setEditLocation] = React.useState('');
  const [editAvatarIndex, setEditAvatarIndex] = React.useState(0);
  const [editImageUri, setEditImageUri] = React.useState<string | null>(null);

  const avatars = ['👤', '🇵🇭', '🏝️', '🦅', '☀️', '🏠'];

  const isSimple = state.userMode === 'simple';

  // Load profile on mount
  React.useEffect(() => {
    async function loadProfile() {
      try {
        const savedName = await AsyncStorage.getItem('@lakadpapel/profile_name');
        const savedLocation = await AsyncStorage.getItem('@lakadpapel/profile_location');
        const savedAvatar = await AsyncStorage.getItem('@lakadpapel/profile_avatar');
        const savedImageUri = await AsyncStorage.getItem('@lakadpapel/profile_image_uri');
        if (savedName) setProfileName(savedName);
        if (savedLocation) setProfileLocation(savedLocation);
        if (savedAvatar) setProfileAvatarIndex(parseInt(savedAvatar, 10));
        if (savedImageUri) setProfileImageUri(savedImageUri);
      } catch (err) {
        console.warn('Failed to load profile:', err);
      }
    }
    loadProfile();
  }, []);

  const handleLocationPress = async () => {
    if (permissionGranted) {
      Alert.alert(
        language === 'en' ? 'Location Access Active' : 'Aktibo ang Lokasyon',
        language === 'en'
          ? 'Location access is already granted and active. If you wish to disable or modify it, you can do so in your device settings.'
          : 'Pinayagan na ang access sa lokasyon. Kung nais mo itong baguhin o i-disable, maaari mo itong gawin sa settings ng iyong device.',
        [
          { text: t.cancel, style: 'cancel' },
          { text: language === 'en' ? 'Open Settings' : 'Buksan ang Settings', onPress: () => Linking.openSettings() }
        ]
      );
    } else {
      await requestPermission();
      setTimeout(async () => {
        const { status } = await require('expo-location').getForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            language === 'en' ? 'Enable Location Access' : 'Paganahin ang Lokasyon',
            language === 'en'
              ? 'To locate the nearest government branches, please enable Location Services for LakadPapel in your device settings.'
              : 'Upang mahanap ang pinakamalapit na sangay, mangyaring paganahin ang Serbisyo sa Lokasyon para sa LakadPapel sa settings ng iyong device.',
            [
              { text: t.cancel, style: 'cancel' },
              { text: language === 'en' ? 'Open Settings' : 'Buksan ang Settings', onPress: () => Linking.openSettings() }
            ]
          );
        }
      }, 500);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      language === 'en' ? 'Reset Progress' : 'I-reset ang Progress',
      t.clearChecklistConfirm,
      [
        {
          text: t.cancel,
          style: 'cancel',
        },
        {
          text: t.yes,
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@lakadpapel/possessed_documents');
              dispatch({
                type: 'HYDRATE',
                payload: {
                  possessedDocuments: [],
                  history: state.history,
                  userMode: state.userMode,
                },
              });
              Alert.alert(
                language === 'en' ? 'Success' : 'Tagumpay',
                t.clearChecklistSuccess
              );
            } catch (err) {
              console.warn('Failed to clear possessed documents:', err);
              Alert.alert(
                language === 'en' ? 'Error' : 'Error',
                language === 'en' ? 'Failed to clear progress.' : 'Bigo sa pagbura ng progress.'
              );
            }
          },
        },
      ]
    );
  };

  const openEditModal = () => {
    setEditName(profileName);
    setEditLocation(profileLocation);
    setEditAvatarIndex(profileAvatarIndex);
    setEditImageUri(profileImageUri);
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editLocation.trim()) {
      Alert.alert(
        language === 'en' ? 'Missing Details' : 'Kulangan ng Detalye',
        language === 'en' ? 'Please enter your name and city.' : 'Mangyaring ilagay ang iyong pangalan at lungsod.'
      );
      return;
    }
    try {
      await AsyncStorage.setItem('@lakadpapel/profile_name', editName);
      await AsyncStorage.setItem('@lakadpapel/profile_location', editLocation);
      await AsyncStorage.setItem('@lakadpapel/profile_avatar', editAvatarIndex.toString());
      if (editImageUri) {
        await AsyncStorage.setItem('@lakadpapel/profile_image_uri', editImageUri);
      } else {
        await AsyncStorage.removeItem('@lakadpapel/profile_image_uri');
      }
      setProfileName(editName);
      setProfileLocation(editLocation);
      setProfileAvatarIndex(editAvatarIndex);
      setProfileImageUri(editImageUri);
      setIsEditModalVisible(false);
    } catch (err) {
      console.warn('Failed to save profile:', err);
    }
  };

  const handleSelectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          language === 'en' ? 'Permission Required' : 'Kailangan ng Pahintulot',
          language === 'en'
            ? 'We need camera roll permission to let you upload custom pictures!'
            : 'Kailangan namin ng pahintulot sa gallery para makapag-upload ng sariling larawan!'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setEditImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Image picker error:', err);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const renderProfileCard = () => {
    return (
      <View style={[
        styles.profileCardSimple,
        {
          backgroundColor: themeColors.cardBackground,
          borderColor: isDarkMode ? defaultColors.primaryTerracottaDark : defaultColors.borderSubtle,
          borderWidth: 1.5,
        }
      ]}>
        <View style={styles.profileRowSimple}>
          <View style={[styles.avatarBadgeSimple, { backgroundColor: isDarkMode ? '#2E231B' : defaultColors.backgroundPaperLight, overflow: 'hidden' }]}>
            {profileImageUri ? (
              <Image
                source={{ uri: profileImageUri }}
                style={{ width: 60, height: 60, borderRadius: 30 }}
              />
            ) : (
              <Text style={styles.avatarTextSimple}>{avatars[profileAvatarIndex]}</Text>
            )}
          </View>
          <View style={styles.profileInfoSimple}>
            <Text style={[styles.profileNameSimple, { color: themeColors.text }]}>{profileName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Ionicons
                name="location-outline"
                size={14}
                color={isDarkMode ? defaultColors.primaryTerracottaDark : defaultColors.primaryTerracotta}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.profileLocationSimple, { color: themeColors.subText, marginTop: 0 }]}>
                {profileLocation}
              </Text>
            </View>
          </View>
        </View>

        {/* Standard Unified Edit button */}
        <TouchableOpacity
          style={[styles.editButtonSimple, { backgroundColor: themeColors.primary }]}
          activeOpacity={0.8}
          onPress={openEditModal}
        >
          <Ionicons name="create-outline" size={18} color={defaultColors.white} style={{ marginRight: 6 }} />
          <Text style={styles.editButtonTextSimple}>
            {language === 'en' ? 'Edit Profile' : 'I-edit ang Profile'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            {t.settings}
          </Text>
        </View>

        {/* Dynamic Profile ID Card */}
        {renderProfileCard()}

        {/* Settings List */}
        <View style={[styles.settingsContainer, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border, marginTop: 24 }]}>
          {/* Appearance Theme Row */}
          <View style={[styles.settingRow, { borderBottomColor: themeColors.border }]}>
            <View style={styles.rowLabelGroup}>
              <Ionicons
                name="moon-outline"
                size={20}
                color={themeColors.text}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                {t.darkMode}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: defaultColors.borderSubtle, true: themeColors.primary }}
              thumbColor={isDarkMode ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {/* User Mode Switch Row */}
          <View style={[styles.settingRow, { borderBottomColor: themeColors.border }]}>
            <View style={styles.rowLabelGroup}>
              <Ionicons
                name="git-network-outline"
                size={20}
                color={themeColors.text}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                  {language === 'en' ? 'Advanced Mode' : 'Propesyonal na Mode'}
                </Text>
                <Text style={{ color: themeColors.subText, fontSize: 11, marginTop: 2, fontFamily: 'Inter_400Regular', lineHeight: 15 }}>
                  {language === 'en'
                    ? 'Enables the topological DAG and interactive visualizer'
                    : 'Paganahin ang topological DAG at interactive visualizer'}
                </Text>
              </View>
            </View>
            <Switch
              value={state.userMode === 'advanced'}
              onValueChange={() => dispatch({ type: 'TOGGLE_USER_MODE' })}
              trackColor={{ false: defaultColors.borderSubtle, true: themeColors.primary }}
              thumbColor={state.userMode === 'advanced' ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {/* Font Size Selector Row (Mocked styling from high-fidelity mockups) */}
          <View style={[styles.settingRow, { borderBottomColor: themeColors.border }]}>
            <View style={styles.rowLabelGroup}>
              <Ionicons
                name="text-outline"
                size={20}
                color={themeColors.text}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                {language === 'en' ? 'Font Size' : 'Laki ng Font'}
              </Text>
            </View>
            <Text style={[styles.diagnosticValue, { color: themeColors.subText, fontFamily: 'Inter_600SemiBold' }]}>
              {language === 'en' ? 'Medium' : 'Katamtaman'}
            </Text>
          </View>

          {/* Language Preference Selector Row */}
          <View style={[styles.settingRow, { borderBottomColor: themeColors.border }]}>
            <View style={styles.rowLabelGroup}>
              <Ionicons
                name="language-outline"
                size={20}
                color={themeColors.text}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                {language === 'en' ? 'Language' : 'Wika'}
              </Text>
            </View>
            <View style={styles.langSelector}>
              <TouchableOpacity
                style={[
                  styles.langBtn,
                  language === 'en' && { backgroundColor: themeColors.primary },
                  language !== 'en' && { backgroundColor: isDarkMode ? '#262626' : defaultColors.backgroundPaperLight }
                ]}
                onPress={() => setLanguage('en')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.langBtnText,
                    { color: language === 'en' ? '#FFFFFF' : themeColors.text }
                  ]}
                >
                  English
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.langBtn,
                  language === 'tl' && { backgroundColor: themeColors.primary },
                  language !== 'tl' && { backgroundColor: isDarkMode ? '#262626' : defaultColors.backgroundPaperLight }
                ]}
                onPress={() => setLanguage('tl')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.langBtnText,
                    { color: language === 'tl' ? '#FFFFFF' : themeColors.text }
                  ]}
                >
                  Filipino
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Services Row */}
          <View style={[styles.settingRow, { borderBottomColor: themeColors.border }]}>
            <View style={styles.rowLabelGroup}>
              <Ionicons
                name="location-outline"
                size={20}
                color={themeColors.text}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                  {t.locationServices}
                </Text>
                <Text style={{ color: themeColors.subText, fontSize: 11, marginTop: 2, fontFamily: 'Inter_400Regular', lineHeight: 15 }}>
                  {t.locationSettingsDesc}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLocationPress}
              style={[
                styles.permissionBadge,
                {
                  backgroundColor: permissionGranted
                    ? (isDarkMode ? 'rgba(0, 107, 44, 0.2)' : 'rgba(0, 107, 44, 0.1)')
                    : (isDarkMode ? 'rgba(141, 75, 0, 0.2)' : 'rgba(141, 75, 0, 0.1)'),
                }
              ]}
            >
              <Text
                style={[
                  styles.permissionBadgeText,
                  {
                    color: permissionGranted
                      ? defaultColors.tertiaryGreen
                      : (isDarkMode ? defaultColors.primaryTerracottaDark : defaultColors.primaryTerracotta),
                  }
                ]}
              >
                {permissionGranted ? t.permissionGranted : t.permissionDenied}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Engine Diagnostics Row */}
          <View style={[styles.settingRow, { borderBottomColor: themeColors.border }]}>
            <View style={styles.rowLabelGroup}>
              <Ionicons
                name="server-outline"
                size={20}
                color={themeColors.text}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.settingLabel, { color: themeColors.text }]}>
                Database Version
              </Text>
            </View>
            <Text style={[styles.diagnosticValue, { color: themeColors.subText }]}>
              v2.1 (114 Verified)
            </Text>
          </View>

          {/* Danger Cache Wiping Button Row */}
          <TouchableOpacity
            style={[styles.settingRow, styles.dangerRow, { borderBottomColor: themeColors.border }]}
            onPress={handleClearCache}
            activeOpacity={0.7}
          >
            <View style={styles.rowLabelGroup}>
              <Ionicons
                name="trash-outline"
                size={20}
                color={defaultColors.dangerRed}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.settingLabel, { color: defaultColors.dangerRed, fontFamily: 'Inter_600SemiBold' }]}>
                {t.clearChecklist}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={defaultColors.dangerRed} />
          </TouchableOpacity>
        </View>

        {/* Database Diagnostic Footer */}
        <Text style={[styles.versionText, { color: themeColors.subText }]}>
          {t.dbVersion}
        </Text>
      </ScrollView>

      {/* Editable Profile Modal Sheet */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              {language === 'en' ? 'Edit Profile Details' : 'I-edit ang Detalye ng Profile'}
            </Text>

            {/* Avatar Emojis Grid Selector */}
            <Text style={[styles.inputLabel, { color: themeColors.subText }]}>
              {language === 'en' ? 'Choose Avatar' : 'Pumili ng Larawan'}
            </Text>
            <View style={styles.avatarGrid}>
              {avatars.map((av, idx) => (
                <TouchableOpacity
                  key={`avatar-${idx}`}
                  style={[
                    styles.avatarGridItem,
                    { backgroundColor: isDarkMode ? '#2E231B' : defaultColors.backgroundPaperLight },
                    editAvatarIndex === idx && { borderColor: themeColors.primary, borderWidth: 2 }
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setEditAvatarIndex(idx)}
                >
                  <Text style={styles.avatarGridText}>{av}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Input fields */}
            <Text style={[styles.inputLabel, { color: themeColors.subText }]}>
              {language === 'en' ? 'Full Name' : 'Buong Pangalan'}
            </Text>
            <TextInput
              style={[styles.textInput, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: isDarkMode ? '#1E1610' : '#FFFFFF' }]}
              value={editName}
              onChangeText={setEditName}
              placeholder={language === 'en' ? 'Enter name' : 'Ilagay ang pangalan'}
              placeholderTextColor={themeColors.subText}
            />

            <Text style={[styles.inputLabel, { color: themeColors.subText, marginTop: 12 }]}>
              {language === 'en' ? 'Location (City)' : 'Lokasyon (Lungsod)'}
            </Text>
            <TextInput
              style={[styles.textInput, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: isDarkMode ? '#1E1610' : '#FFFFFF' }]}
              value={editLocation}
              onChangeText={setEditLocation}
              placeholder={language === 'en' ? 'Enter city' : 'Ilagay ang lungsod'}
              placeholderTextColor={themeColors.subText}
            />

            {/* Custom Photo Upload Row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: 12 }}>
              <Text style={[styles.inputLabel, { color: themeColors.subText, marginBottom: 0 }]}>
                {language === 'en' ? 'Custom Photo' : 'Sariling Larawan'}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {editImageUri && (
                  <TouchableOpacity
                    style={[styles.imageBtn, { backgroundColor: '#fee2e2', borderColor: '#fca5a5', borderWidth: 1 }]}
                    activeOpacity={0.7}
                    onPress={() => setEditImageUri(null)}
                  >
                    <Text style={{ color: defaultColors.dangerRed, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
                      {language === 'en' ? 'Remove' : 'Alisin'}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.imageBtn, { backgroundColor: themeColors.primary }]}
                  activeOpacity={0.7}
                  onPress={handleSelectImage}
                >
                  <Text style={{ color: defaultColors.white, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
                    {editImageUri ? (language === 'en' ? 'Change' : 'Palitan') : (language === 'en' ? 'Upload Photo' : 'Mag-upload')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {editImageUri && (
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Image
                  source={{ uri: editImageUri }}
                  style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 1.5, borderColor: themeColors.primary }}
                />
              </View>
            )}

            {/* Modal Buttons */}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelBtn, { borderColor: themeColors.border }]}
                activeOpacity={0.7}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: themeColors.subText }]}>
                  {t.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveBtn, { backgroundColor: themeColors.primary }]}
                activeOpacity={0.7}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveBtnText}>
                  {language === 'en' ? 'Save' : 'I-save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 28,
  },
  settingsContainer: {
    padding: 16,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  dangerRow: {
    borderBottomWidth: 0,
  },
  rowLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  diagnosticValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  langSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    padding: 2,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 4,
  },
  langBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  versionText: {
    fontSize: 12,
    color: '#737373',
    marginTop: 24,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  permissionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexShrink: 0,
  },
  permissionBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },

  // Profile Card - Simple Mode (Warm paper stack look)
  profileCardSimple: {
    padding: spacing.lg,
    borderWidth: 1.5,
    borderRadius: radii.lg,
    ...shadows.md,
  },
  profileRowSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarBadgeSimple: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarTextSimple: {
    fontSize: 32,
  },
  profileInfoSimple: {
    flex: 1,
  },
  profileNameSimple: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    lineHeight: 26,
  },
  profileLocationSimple: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 4,
  },
  editButtonSimple: {
    flexDirection: 'row',
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  editButtonTextSimple: {
    color: defaultColors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },

  // Profile Card - Advanced Mode (Glowing Citizen ID)
  profileCardAdvanced: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radii.lg,
    ...shadows.sm,
  },
  profileHeaderAdvanced: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(141, 75, 0, 0.15)',
    paddingBottom: 6,
    marginBottom: spacing.md,
  },
  idCardLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  profileRowAdvanced: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBadgeAdvanced: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    backgroundColor: 'rgba(141, 75, 0, 0.05)',
  },
  avatarTextAdvanced: {
    fontSize: 36,
  },
  profileInfoAdvanced: {
    flex: 1,
  },
  profileNameAdvanced: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    lineHeight: 20,
  },
  profileLocationAdvanced: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  statsRowAdvanced: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  statColAdvanced: {
    flex: 1,
  },
  statLabelAdvanced: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
  },
  statValueAdvanced: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    marginTop: 2,
  },

  // Edit Modal Profile Sheet
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
    minHeight: 380,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  avatarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  avatarGridItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  avatarGridText: {
    fontSize: 24,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 12,
  },
  imageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
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
});
