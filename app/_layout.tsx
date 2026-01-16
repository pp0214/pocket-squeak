import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
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
        name="pet/[id]"
        options={{
          title: "Pet Details",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#fff" },
          headerTitleStyle: { fontWeight: "600" },
        }}
      />
    </Stack>
  );
}
