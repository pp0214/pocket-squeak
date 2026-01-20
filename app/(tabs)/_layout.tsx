import { useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface AnimatedTabIconProps {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
  focused: boolean;
}

function AnimatedTabIcon({ name, color, focused }: AnimatedTabIconProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.15, { damping: 12, stiffness: 150 });
      translateY.value = withSpring(-2, { damping: 12, stiffness: 150 });
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{ marginBottom: -3 }, animatedStyle]}>
      <FontAwesome name={name} size={24} color={color} />
    </Animated.View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ed7a11",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#E5E7EB",
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="paw" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: t("tabs.record"),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              name="plus-circle"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wiki"
        options={{
          title: t("tabs.food"),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="cutlery" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="cog" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
