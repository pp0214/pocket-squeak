import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import "react-native-reanimated";
import "../global.css";
import i18n, { initI18n } from "@/src/i18n";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  useEffect(() => {
    if (loaded && i18nReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, i18nReady]);

  if (!loaded || !i18nReady) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal/add-pet"
          options={{
            presentation: "modal",
            title: "Add Pet",
            headerStyle: { backgroundColor: "#fff" },
            headerTitleStyle: { fontWeight: "600" },
          }}
        />
        <Stack.Screen
          name="modal/recorder"
          options={{
            presentation: "modal",
            title: "Quick Record",
            headerStyle: { backgroundColor: "#fff" },
            headerTitleStyle: { fontWeight: "600" },
          }}
        />
        <Stack.Screen
          name="modal/edit-pet"
          options={{
            presentation: "modal",
            title: "Edit Pet",
            headerStyle: { backgroundColor: "#fff" },
            headerTitleStyle: { fontWeight: "600" },
          }}
        />
        <Stack.Screen
          name="modal/export"
          options={{
            presentation: "modal",
            title: "Export Data",
            headerStyle: { backgroundColor: "#fff" },
            headerTitleStyle: { fontWeight: "600" },
          }}
        />
        <Stack.Screen
          name="modal/backup"
          options={{
            presentation: "modal",
            title: "Backup & Restore",
            headerStyle: { backgroundColor: "#fff" },
            headerTitleStyle: { fontWeight: "600" },
          }}
        />
        <Stack.Screen
          name="pet/[id]"
          options={{
            title: "Pet Details",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#fff" },
            headerTitleStyle: { fontWeight: "600" },
          }}
        />
      </Stack>
    </I18nextProvider>
  );
}
