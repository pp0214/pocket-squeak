import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Card } from "@/src/components/ui/Card";
import {
  changeLanguage,
  getCurrentLanguage,
  supportedLanguages,
} from "@/src/i18n";
import { useToast } from "@/src/contexts/ToastContext";

interface SettingItemProps {
  icon: string;
  iconColor?: string;
  title: string;
  description?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingItem({
  icon,
  iconColor = "#6b7280",
  title,
  description,
  onPress,
  rightElement,
}: SettingItemProps) {
  const content = (
    <View className="flex-row items-center py-3">
      <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-3">
        <FontAwesome name={icon as any} size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">{title}</Text>
        {description && (
          <Text className="text-sm text-gray-500 mt-0.5">{description}</Text>
        )}
      </View>
      {rightElement ?? (
        <FontAwesome name="chevron-right" size={14} color="#D1D5DB" />
      )}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }
  return content;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
      {title}
    </Text>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  const handleLanguageChange = () => {
    const options = supportedLanguages.map((lang) => ({
      text: lang.nativeName,
      onPress: async () => {
        try {
          await changeLanguage(lang.code);
          setCurrentLang(lang.code);
        } catch (error) {
          toast.error(String(error));
        }
      },
    }));

    Alert.alert(t("settings.selectLanguage"), "", [
      ...options,
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const currentLanguageName =
    supportedLanguages.find((l) => l.code === currentLang)?.nativeName ||
    "English";

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 gap-6">
        {/* Language Section */}
        <View>
          <SectionHeader title={t("settings.language")} />
          <Card>
            <SettingItem
              icon="globe"
              iconColor="#3b82f6"
              title={t("settings.language")}
              description={currentLanguageName}
              onPress={handleLanguageChange}
            />
          </Card>
        </View>

        {/* Notifications Section */}
        <View>
          <SectionHeader title={t("settings.notifications")} />
          <Card>
            <SettingItem
              icon="bell"
              iconColor="#f59e0b"
              title={t("settings.dailyReminder")}
              description={t("settings.reminderDescription")}
              onPress={() => router.push("/modal/notification-settings" as any)}
            />
            <View className="h-px bg-gray-100 ml-13" />
            <SettingItem
              icon="exclamation-triangle"
              iconColor="#ef4444"
              title={t("settings.healthAlerts")}
              description={t("settings.healthAlertsDescription")}
              onPress={() => router.push("/modal/notification-settings" as any)}
            />
          </Card>
        </View>

        {/* Data Management Section */}
        <View>
          <SectionHeader title={t("settings.dataManagement")} />
          <Card>
            <SettingItem
              icon="download"
              iconColor="#22c55e"
              title={t("settings.exportData")}
              description={t("settings.exportDescription")}
              onPress={() => router.push("/modal/export")}
            />
            <View className="h-px bg-gray-100 ml-13" />
            <SettingItem
              icon="cloud-upload"
              iconColor="#8b5cf6"
              title={t("settings.backup")}
              description={t("settings.backupDescription")}
              onPress={() => router.push("/modal/backup")}
            />
          </Card>
        </View>

        {/* About Section */}
        <View>
          <SectionHeader title={t("settings.about")} />
          <Card>
            <View className="flex-row items-center py-3">
              <View className="w-10 h-10 rounded-xl bg-primary-100 items-center justify-center mr-3">
                <Text className="text-xl">🐹</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  {t("settings.appName")}
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  {t("settings.version")} 1.0.0
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
