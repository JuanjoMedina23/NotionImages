import React, { useState, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useNotes } from "../../contexts/NoteContext";
import { ArrowLeft, Pencil, Trash2, Check, X } from "lucide-react-native";
import { ThemeContext } from "../../contexts/ThemeContext";
import Markdown from "react-native-markdown-display";

export default function NoteDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getNote, updateNote, deleteNote } = useNotes();
  const { theme } = useContext(ThemeContext);

  const note = getNote(id as string);

  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    updateNote(id as string, title, content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteNote(id as string);
    router.back();
  };

  if (!note) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.background }}>
        <Text style={{ color: theme.text }}>No encontrada</Text>
      </SafeAreaView>
    );
  }

  // Estilos para Markdown
  const markdownStyles = {
    body: {
      color: theme.text,
      fontSize: 16,
      lineHeight: 22,
    },
    heading1: {
      color: theme.text,
      fontSize: 26,
      fontWeight: "bold" as const,
      marginBottom: 12,
    },
    heading2: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "bold" as const,
      marginBottom: 10,
    },
    paragraph: {
      marginBottom: 8,
    },
    strong: { fontWeight: "bold" as const },
    em: { fontStyle: "italic" as const },
    code_inline: {
      backgroundColor: theme.background,
      color: theme.accent,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    link: {
      color: theme.accent,
      textDecorationLine: "underline" as const,
    },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: 16 }}>

      {/* Top Bar */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={28} color={theme.text} />
        </TouchableOpacity>

        {!isEditing ? (
          <View style={{ flexDirection: "row", gap: 16 }}>
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Pencil size={26} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDelete}>
              <Trash2 size={26} color="#dc2626" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flexDirection: "row", gap: 16 }}>
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <X size={28} color="#dc2626" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave}>
              <Check size={28} color={theme.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}

      {isEditing ? (
        // 🔧 MODO DE EDICIÓN
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: theme.text + "66",
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 16,
              color: theme.text,
            }}
          />

          <TextInput
            value={content}
            onChangeText={setContent}
            multiline
            style={{
              borderWidth: 1,
              borderColor: theme.text + "33",
              padding: 12,
              borderRadius: 16,
              minHeight: 300,
              fontSize: 16,
              color: theme.text,
              textAlignVertical: "top",
              backgroundColor: theme.card,
            }}
          />
        </ScrollView>

      ) : (
        // 👀 MODO LECTURA (Markdown + Scroll)
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* Markdown en TÍTULO */}
          <Markdown style={markdownStyles}>
            {`# ${note.title}`}
          </Markdown>

          {/* Markdown en CONTENIDO */}
          <Markdown style={markdownStyles}>
            {note.content}
          </Markdown>

          <Text style={{ fontSize: 12, color: theme.text + "99", marginTop: 20 }}>
            Creada: {new Date(note.createdAt).toLocaleString()}
          </Text>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}
