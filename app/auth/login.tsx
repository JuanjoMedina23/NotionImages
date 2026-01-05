import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";

export default function Login() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Evita loops: si ya hay usuario, redirige al index
  if (!loading && user) {
    router.replace("/");
    return null;
  }

  const handleLogin = async () => {
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || submitting) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-br from-rose-300 via-purple-400 to-blue-600">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center p-6 bg-gradient-to-br from-rose-300 via-purple-400 to-blue-600">
      <View className="w-full max-w-sm bg-white/50 backdrop-blur-lg rounded-2xl p-6 space-y-4 shadow-lg">
        <Text className="text-3xl font-bold text-center text-primary mb-4">Iniciar Sesión</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          className="bg-white rounded-lg border border-gray-300 px-4 py-3"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="bg-white rounded-lg border border-gray-300 px-4 py-3"
        />

        <TouchableOpacity
          onPress={handleLogin}
          className="bg-primary py-3 rounded-xl items-center mt-2 shadow-md"
        >
          <Text className="text-white font-bold text-lg">Iniciar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/register")}>
          <Text className="text-primary text-center mt-2 font-medium">
            ¿No tienes cuenta? Regístrate
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
