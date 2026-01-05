import { Stack } from "expo-router";
import TabsNavigator from "../components/TabsNavigator";
import { NoteProvider } from "../contexts/NoteContext";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import { ThemeProvider, ThemeContext } from "@/contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";   

export default function RootLayout() {
  return (
    <AuthProvider>  
      <ThemeProvider>
        <NoteProvider>
          <ThemeContext.Consumer>
            {({ theme }) => (
              <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
                <Stack screenOptions={{ headerShown: false }} />
                <TabsNavigator />
              </SafeAreaView>
            )}
          </ThemeContext.Consumer>
        </NoteProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
