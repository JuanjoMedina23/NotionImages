import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, LogOut } from "lucide-react-native";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { themes, ThemeName } from "../../styles/themes";
import AsyncStorage from "@react-native-async-storage/async-storage";

const themeOptions: { key: ThemeName; label: string }[] = [
  { key: "light", label: "Claro" },
  { key: "dark", label: "Oscuro" },
  { key: "christmas", label: "Navidad" },
  { key: "halloween", label: "Halloween" },
];

export default function Settings() {
  // ThemeContext para estilos
  const { theme, themeName, changeTheme } = useContext(ThemeContext);

  // AuthContext para usuario y logout
  const { user, setUser, loading } = useAuth() as any;

  // Logout “falso”: limpia estado y AsyncStorage
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); // limpia notas y preferencias
      setUser(null);              // limpia estado de usuario
      router.replace("/auth/login"); // redirige al login
    } catch (err) {
      console.log("Error en logout falso:", err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: theme.text }]}>Configuración</Text>
      </View>

      {/* Card de Usuario */}
      {user && (
        <View style={[styles.card, { backgroundColor: theme.card, marginBottom: 16 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Cuenta</Text>
          <Text style={[styles.emailText, { color: theme.primary }]}>{user.email}</Text>
        </View>
      )}

      {/* Card de Temas */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Seleccionar Tema</Text>
        <View style={styles.themeButtons}>
          {themeOptions.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.themeButton, { borderColor: themeName === t.key ? theme.primary : "#ccc" }]}
              onPress={() => changeTheme(t.key)}
            >
              <View style={[styles.colorPreview, { backgroundColor: themes[t.key].primary }]} />
              <Text style={{ color: themeName === t.key ? theme.primary : theme.text, fontWeight: themeName === t.key ? "700" : "500" }}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.option}>
          <Text style={{ color: theme.text }}>Sincronización</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Text style={{ color: theme.text }}>Acerca de la App</Text>
        </TouchableOpacity>
      </View>

      {/* Botón de Cerrar Sesión */}
      {user && (
        <TouchableOpacity onPress={handleLogout} style={[styles.logoutButton, { backgroundColor: theme.card }]}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backButton: { marginRight: 10 },
  headerText: { fontSize: 24, fontWeight: "bold" },
  card: { borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  emailText: { fontSize: 14, marginTop: 4 },
  themeButtons: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  themeButton: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 2, marginRight: 8, marginBottom: 8 },
  colorPreview: { width: 20, height: 20, borderRadius: 4, marginRight: 8 },
  option: { paddingVertical: 12 },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 16, borderRadius: 12, marginTop: 20, gap: 8 },
  logoutText: { color: "#ef4444", fontSize: 16, fontWeight: "600" },
});
