import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { storageService } from '@/utils/storage';
import { CONSENT_TEMPLATES, TEMPLATE_DISPLAY_NAMES } from '@/constants/consentTemplates';

interface ExpandableMenuProps {
  title: string;
  icon: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const ExpandableMenu: React.FC<ExpandableMenuProps> = ({ 
  title, 
  icon, 
  expanded, 
  onToggle, 
  children 
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.menuSection}>
      <TouchableOpacity 
        style={[styles.menuHeader, { backgroundColor: colors.card }]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.menuHeaderLeft}>
          <IconSymbol 
            name={icon as any} 
            size={24} 
            color={colors.tint} 
            style={styles.menuIcon}
          />
          <ThemedText type="defaultSemiBold" style={styles.menuTitle}>
            {title}
          </ThemedText>
        </View>
        <IconSymbol 
          name={expanded ? "chevron.up" : "chevron.down"} 
          size={20} 
          color={colors.text} 
        />
      </TouchableOpacity>
      {expanded && (
        <View style={[styles.menuContent, { backgroundColor: colors.background }]}>
          {children}
        </View>
      )}
    </View>
  );
};

export default function SettingsScreen() {
  const { colorScheme, setThemePreference } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  const loadSettings = async () => {
    try {
      const loadedSettings = await storageService.getSettings();
      setSelectedForms(loadedSettings.selectedForms);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleToggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleFormToggle = async (formName: string) => {
    try {
      let updatedForms: string[];
      
      if (selectedForms.includes(formName)) {
        // Remove form
        updatedForms = selectedForms.filter(name => name !== formName);
      } else {
        // Add form
        updatedForms = [...selectedForms, formName];
      }
      
      setSelectedForms(updatedForms);
      await storageService.updateSelectedForms(updatedForms);
      
      Alert.alert(
        'Forms Updated',
        updatedForms.length === 0 
          ? 'All forms will be shown in the consent form.'
          : `${updatedForms.length} form(s) selected.`
      );
    } catch (error) {
      console.error('Error updating forms:', error);
      Alert.alert('Error', 'Failed to update form selection');
    }
  };

  const handleThemeToggle = async (value: boolean) => {
    try {
      const newTheme = value ? 'dark' : 'light';
      setIsDarkMode(value);
      await setThemePreference(newTheme);
      
      Alert.alert(
        'Theme Updated',
        `Theme set to ${value ? 'Dark' : 'Light'} mode.`
      );
    } catch (error) {
      console.error('Error updating theme:', error);
      Alert.alert('Error', 'Failed to update theme preference');
    }
  };

  const isFormSelected = (formName: string) => {
    // If no forms are selected, all forms are available
    if (selectedForms.length === 0) return true;
    return selectedForms.includes(formName);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <ThemedText type="title" style={[styles.title, { fontFamily: Fonts.rounded }]}>
            Settings
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Configure your app preferences
          </ThemedText>
        </View>

        {/* Select Your Forms */}
        <ExpandableMenu
          title="Select Your Forms"
          icon="doc.text.fill"
          expanded={expandedSection === 'forms'}
          onToggle={() => handleToggleSection('forms')}
        >
          <View style={styles.formsContent}>
            <ThemedText style={styles.sectionDescription}>
              Choose which consent forms you want to use. Selected forms will appear in the consent form type selection.
            </ThemedText>
            
            {CONSENT_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.name}
                style={[
                  styles.formOption,
                  { 
                    backgroundColor: colors.card,
                    borderColor: isFormSelected(template.name) ? colors.tint : colors.border 
                  }
                ]}
                onPress={() => handleFormToggle(template.name)}
                activeOpacity={0.7}
              >
                <View style={styles.formOptionLeft}>
                  <View style={[
                    styles.checkbox,
                    { borderColor: colors.border },
                    isFormSelected(template.name) && { 
                      backgroundColor: colors.tint,
                      borderColor: colors.tint 
                    }
                  ]}>
                    {isFormSelected(template.name) && (
                      <IconSymbol name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <View style={styles.formInfo}>
                    <ThemedText type="defaultSemiBold">
                      {TEMPLATE_DISPLAY_NAMES[template.name] || template.title}
                    </ThemedText>
                    <ThemedText style={styles.formVersion}>
                      v{template.version}
                    </ThemedText>
                  </View>
                </View>
                <IconSymbol 
                  name="chevron.right" 
                  size={16} 
                  color={colors.icon} 
                />
              </TouchableOpacity>
            ))}
            
            <View style={styles.formsFooter}>
              <ThemedText style={styles.formsFooterText}>
                {selectedForms.length === 0 
                  ? '✓ All forms available'
                  : `${selectedForms.length} of ${CONSENT_TEMPLATES.length} forms selected`
                }
              </ThemedText>
            </View>
          </View>
        </ExpandableMenu>

        {/* Dark Mode / Light Mode */}
        <View style={[styles.menuSection]}>
          <View style={[styles.menuHeader, styles.themeToggle, { backgroundColor: colors.card }]}>
            <View style={styles.menuHeaderLeft}>
              <IconSymbol 
                name={isDarkMode ? "moon.fill" : "sun.max.fill"} 
                size={24} 
                color={colors.tint} 
                style={styles.menuIcon}
              />
              <ThemedText type="defaultSemiBold" style={styles.menuTitle}>
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </ThemedText>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleThemeToggle}
              trackColor={{ false: '#767577', true: colors.tint }}
              thumbColor={isDarkMode ? '#f4f3f4' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* About the App */}
        <ExpandableMenu
          title="About the App"
          icon="info.circle.fill"
          expanded={expandedSection === 'about'}
          onToggle={() => handleToggleSection('about')}
        >
          <View style={styles.aboutContent}>
            <ThemedText type="subtitle" style={styles.aboutTitle}>
              Clinic Consent App
            </ThemedText>
            <ThemedText style={styles.aboutDescription}>
              A professional consent form management application designed for healthcare practitioners.
            </ThemedText>
            
            <View style={styles.aboutFeatures}>
              <ThemedText style={styles.featureTitle}>Features:</ThemedText>
              <ThemedText style={styles.featureItem}>• Digital consent forms</ThemedText>
              <ThemedText style={styles.featureItem}>• Health check questionnaires</ThemedText>
              <ThemedText style={styles.featureItem}>• Electronic signatures</ThemedText>
              <ThemedText style={styles.featureItem}>• Email delivery</ThemedText>
              <ThemedText style={styles.featureItem}>• Client history management</ThemedText>
              <ThemedText style={styles.featureItem}>• Draft auto-save</ThemedText>
            </View>
            
            <View style={styles.aboutInfo}>
              <ThemedText style={styles.infoLabel}>Version:</ThemedText>
              <ThemedText style={styles.infoValue}>1.0.0</ThemedText>
            </View>
            
            <View style={styles.aboutInfo}>
              <ThemedText style={styles.infoLabel}>Designed for:</ThemedText>
              <ThemedText style={styles.infoValue}>
                Acupuncturists, Massage Therapists, and Healthcare Professionals
              </ThemedText>
            </View>
          </View>
        </ExpandableMenu>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.copyright}>
            © CareTrace Ltd 2025
          </ThemedText>
          <ThemedText style={styles.footerNote}>
            All rights reserved
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
  },
  menuContent: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  themeToggle: {
    borderRadius: 12,
  },
  formsContent: {
    padding: 16,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  formOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  formOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  formInfo: {
    flex: 1,
  },
  formVersion: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  formsFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  formsFooterText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  aboutContent: {
    padding: 20,
  },
  aboutTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  aboutDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 20,
  },
  aboutFeatures: {
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
    lineHeight: 20,
  },
  aboutInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
    minWidth: 100,
  },
  infoValue: {
    fontSize: 14,
    opacity: 0.8,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    marginTop: 8,
    marginBottom: 32,
  },
  copyright: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerNote: {
    fontSize: 12,
    opacity: 0.6,
  },
});
