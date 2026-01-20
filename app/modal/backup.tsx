import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import {
  createAndShareBackup,
  pickAndRestoreBackup,
} from "@/src/services/backupService";
import { usePetStore } from "@/src/store/petStore";
import { useToast } from "@/src/contexts/ToastContext";

export default function BackupModal() {
  const { t } = useTranslation();
  const router = useRouter();
  const { loadPets } = usePetStore();
  const toast = useToast();

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      await createAndShareBackup();
      toast.success(t("backup.backupSuccess"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("backup.error"));
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    Alert.alert(t("backup.restoreBackup"), t("backup.restoreWarning"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.confirm"),
        style: "destructive",
        onPress: async () => {
          setIsRestoring(true);
          try {
            const restored = await pickAndRestoreBackup();
            if (restored) {
              await loadPets();
              toast.success(t("backup.restoreSuccess"));
              router.back();
            }
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : t("backup.error"),
            );
          } finally {
            setIsRestoring(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 gap-4">
        {/* Backup Section */}
        <Card>
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-xl bg-green-100 items-center justify-center mr-3">
              <FontAwesome name="cloud-download" size={24} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {t("backup.createBackup")}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {t("backup.backupDescription")}
              </Text>
            </View>
          </View>

          <Button
            title={t("backup.createBackup")}
            onPress={handleBackup}
            loading={isBackingUp}
            variant="primary"
          />
        </Card>

        {/* Restore Section */}
        <Card>
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-xl bg-purple-100 items-center justify-center mr-3">
              <FontAwesome name="cloud-upload" size={24} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {t("backup.restoreBackup")}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {t("backup.restoreDescription")}
              </Text>
            </View>
          </View>

          {/* Warning */}
          <View className="bg-yellow-50 p-3 rounded-xl mb-4">
            <View className="flex-row items-center">
              <FontAwesome
                name="exclamation-triangle"
                size={16}
                color="#f59e0b"
                style={{ marginRight: 8 }}
              />
              <Text className="text-sm text-yellow-700 flex-1">
                {t("backup.restoreWarning")}
              </Text>
            </View>
          </View>

          <Button
            title={t("backup.restoreBackup")}
            onPress={handleRestore}
            loading={isRestoring}
            variant="secondary"
          />
        </Card>
      </View>
    </ScrollView>
  );
}
