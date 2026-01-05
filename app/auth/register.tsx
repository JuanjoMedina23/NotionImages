import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";

export default function Register() {
  const { register, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirige si ya hay usuario
  if (!loading && user) {
    router.replace("/");
    return null;
  }

  const handleRegister = async () => {
    try {
      await register(email, password);
      router.replace("/");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-6 bg-gradient-to-br from-rose-300 via-purple-400 to-blue-600">
      <View className="w-full max-w-sm bg-white/50 backdrop-blur-lg rounded-2xl p-6 space-y-4 shadow-lg">
        <Text className="text-3xl font-bold text-center text-primary mb-4">Crear Cuenta</Text>

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
          onPress={handleRegister}
          className="bg-primary py-3 rounded-xl items-center mt-2 shadow-md"
        >
          <Text className="text-white font-bold text-lg">Registrarse</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/login")}>
          <Text className="text-primary text-center mt-2 font-medium">
            ¿Ya tienes cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
