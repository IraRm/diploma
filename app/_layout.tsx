import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FavoritesProvider } from "../src/state/FavoritesContext";

export default function RootLayout() {
  return (
    <FavoritesProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          initialRouteName="splash"
          screenOptions={{ headerShown: false }}
        />
      </SafeAreaProvider>
    </FavoritesProvider>
  );
}
