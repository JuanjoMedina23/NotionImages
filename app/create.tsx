import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useContext, useEffect } from "react";
import { useNotes } from "../contexts/NoteContext";
import { X, Check, Eye, Edit3 } from "lucide-react-native";
import { ThemeContext } from "../contexts/ThemeContext";
import Markdown from "react-native-markdown-display";
import { z } from "zod";

export default function CreateNote() {
  const { createNote, notes } = useNotes();
  const { theme } = useContext(ThemeContext);

  // Recibir parámetros que vienen desde NoteAi
  const params = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  // Cuando vienen datos desde NoteAi -> rellenar los campos y activar preview
  useEffect(() => {
    if (params.title) setTitle(String(params.title));
    if (params.content) {
      setContent(String(params.content));
      setIsPreview(true); // Activar preview automáticamente si viene de IA
    }
  }, [params]);

  const noteSchema = z.object({
    title: z
      .string()
      .min(1, "El título no puede estar vacío")
      .refine((t) => !notes.some((n) => n.title === t), {
        message: "Ya existe una nota con ese título",
      }),
    content: z.string().min(1, "El contenido no puede estar vacío"),
  });

  // Estilos para Markdown
  const markdownStyles = {
    body: {
      color: theme.text,
      fontSize: 14,
      lineHeight: 20,
    },
    heading1: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "bold" as const,
      marginTop: 10,
      marginBottom: 8,
    },
    heading2: {
      color: theme.text,
      fontSize: 19,
      fontWeight: "bold" as const,
      marginTop: 8,
      marginBottom: 6,
    },
    heading3: {
      color: theme.text,
      fontSize: 17,
      fontWeight: "600" as const,
      marginTop: 6,
      marginBottom: 4,
    },
    strong: {
      fontWeight: "bold" as const,
    },
    em: {
      fontStyle: "italic" as const,
    },
    paragraph: {
      color: theme.text,
      marginTop: 4,
      marginBottom: 4,
    },
    bullet_list: {
      marginTop: 4,
      marginBottom: 8,
    },
    ordered_list: {
      marginTop: 4,
      marginBottom: 8,
    },
    list_item: {
      marginTop: 2,
      marginBottom: 2,
      flexDirection: "row" as const,
    },
    bullet_list_icon: {
      color: theme.text,
      fontSize: 14,
    },
    ordered_list_icon: {
      color: theme.text,
      fontSize: 14,
    },
    code_inline: {
      backgroundColor: theme.background,
      color: theme.accent,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 13,
    },
    code_block: {
      backgroundColor: theme.background,
      color: theme.text,
      padding: 10,
      borderRadius: 6,
      marginVertical: 6,
      fontSize: 13,
    },
    fence: {
      backgroundColor: theme.background,
      color: theme.text,
      padding: 10,
      borderRadius: 6,
      marginVertical: 6,
      fontSize: 13,
    },
    blockquote: {
      backgroundColor: theme.background,
      borderLeftWidth: 3,
      borderLeftColor: theme.primary,
      paddingLeft: 10,
      paddingVertical: 6,
      marginVertical: 6,
    },
    link: {
      color: theme.accent,
      textDecorationLine: "underline" as const,
    },
    hr: {
      backgroundColor: theme.primary,
      height: 1,
      marginVertical: 8,
    },
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: theme.background }}>
      {/* Top Bar */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        {/* Cancel */}
        <TouchableOpacity onPress={() => router.back()}>
          <X size={28} color={theme.primary} />
        </TouchableOpacity>

        {/* Toggle Preview/Edit */}
        <TouchableOpacity
          onPress={() => setIsPreview(!isPreview)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.card,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            gap: 6,
          }}
        >
          {isPreview ? (
            <>
              <Edit3 size={18} color={theme.primary} />
              <Text style={{ color: theme.text, fontSize: 12 }}>Editar</Text>
            </>
          ) : (
            <>
              <Eye size={18} color={theme.primary} />
              <Text style={{ color: theme.text, fontSize: 12 }}>Vista Previa</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          onPress={() => {
            const validated = noteSchema.safeParse({ title, content });

            if (!validated.success) {
              alert(validated.error.issues[0].message);
              return;
            }

            createNote(title, content);
            router.replace("/");
          }}
        >
          <Check size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Header */}
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, color: theme.text }}>
        {isPreview ? "Vista Previa" : "Nueva Nota"}
      </Text>

      {/* Título */}
      <TextInput
        placeholder="Título"
        placeholderTextColor={theme.text + "99"}
        value={title}
        onChangeText={setTitle}
        style={{
          backgroundColor: theme.card,
          padding: 12,
          borderRadius: 12,
          marginBottom: 12,
          color: theme.text,
        }}
      />

      {/* Contenido - Editor o Preview */}
      {isPreview ? (
        <ScrollView
          style={{
            backgroundColor: theme.card,
            padding: 12,
            borderRadius: 12,
            flex: 1,
          }}
        >
          {content ? (
            <Markdown style={markdownStyles}>{content}</Markdown>
          ) : (
            <Text style={{ color: theme.text + "60", fontStyle: "italic" }}>
              Escribe algo para ver la vista previa...
            </Text>
          )}
        </ScrollView>
      ) : (
        <TextInput
          placeholder="Contenido"
          placeholderTextColor={theme.text + "99"}
          value={content}
          onChangeText={setContent}
          multiline
          style={{
            backgroundColor: theme.card,
            padding: 12,
            borderRadius: 12,
            flex: 1,
            textAlignVertical: "top",
            color: theme.text,
          }}
        />
      )}
    </View>
  );
}