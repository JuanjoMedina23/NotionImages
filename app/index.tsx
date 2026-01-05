import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useNotes } from "../contexts/NoteContext";
import { useAuth } from "../contexts/AuthContext";
import NoteCard from "../components/NoteCard";
import { FilePlus2, Notebook, CheckCircle2, Clock, ListTodo } from "lucide-react-native";
import { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import NoteAi from "../services/NoteAi";

export default function Home() {
  const { getFilteredNotes } = useNotes();
  const { user, loading } = useAuth(); // ← AGREGAR ESTO
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const { theme } = useContext(ThemeContext);

  const notes = getFilteredNotes(filter);

  const filterConfig = [
    { id: "all", label: "Todas", icon: ListTodo },
    { id: "pending", label: "Pendientes", icon: Clock },
    { id: "completed", label: "Completadas", icon: CheckCircle2 },
  ] as const;

  // AGREGAR ESTA PROTECCIÓN
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading]);

  //  AGREGAR ESTE LOADING
  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: theme.background, 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 16 }}>
          Verificando sesión...
        </Text>
      </View>
    );
  }

 
  if (!user) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: theme.background, 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 16 }}>
          Redirigiendo...
        </Text>
      </View>
    );
  }

 
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header y Filtros - Sin flex para mantener tamaño fijo */}
      <View style={{ paddingTop: 14, paddingHorizontal: 20 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 32, fontWeight: "800", color: theme.text }}>
            MIS NOTAS XD
          </Text>
          <Text style={{ color: theme.text + "99", marginTop: 4 }}>
            Organiza tus ideas xd
          </Text>
        </View>

        {/* Filtros */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 10, paddingVertical: 14 }}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          {filterConfig.map(({ id, label, icon: Icon }) => {
            const isActive = filter === id;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setFilter(id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  height: 28,
                  paddingHorizontal:6 ,
                  paddingVertical: 3,
                  borderRadius: 999,
                  marginRight: 8,
                  backgroundColor: isActive ? theme.primary : theme.card,
                }}
              >
                <Icon 
                  size={12} 
                  color={isActive ? theme.card : theme.text + "99"} 
                  style={{ marginRight: 4 }}
                />
                <Text style={{ 
                  fontSize: 15,
                  fontWeight: "600", 
                  color: isActive ? theme.card : theme.text + "99" 
                }}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Lista - Con flex: 1 para ocupar el espacio restante */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {notes.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 80, opacity: 0.7 }}>
            <Notebook size={70} color={theme.text + "99"} />

            <Text style={{ fontSize: 20, fontWeight: "600", color: theme.text, marginTop: 16 }}>
              No hay notas
            </Text>

            <Text style={{ color: theme.text + "99", marginTop: 4, textAlign: "center" }}>
              {filter === "pending" && "Todas tus notas están completadas "}
              {filter === "completed" && "No tienes notas completadas aún"}
              {filter === "all" && "Crea tu primera nota con el botón de abajo"}
            </Text>
          </View>
        ) : (
          notes.map((n) => <NoteCard key={n.id} note={n} />)
        )}
      </ScrollView>

      {/* Botón flotante */}
      <TouchableOpacity
        onPress={() => router.push("/create")}
        style={{
          backgroundColor: theme.primary,
          width: 65,
          height: 65,
          borderRadius: 32,
          position: "absolute",
          bottom: 32,
          right: 32,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 5,
        }}
      >
        <FilePlus2 size={30} color={theme.card} />
      </TouchableOpacity>
      
      {/* Aqui llamo al archivo donde esta la IA */}
      <NoteAi />
    </View>
  );
}