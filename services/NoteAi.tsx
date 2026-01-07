import React, { useState, useRef, useEffect, useContext } from "react";
import {View, Text, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator,} from "react-native";
import { GoogleGenAI } from "@google/genai";
import { Bot, Camera, Send, X, FileText } from "lucide-react-native";
import { ThemeContext } from "../contexts/ThemeContext";
import { useNotes } from "../contexts/NoteContext";
import CameraNote from "../components/CameraNote";
import { useRouter } from "expo-router";
import Markdown from "react-native-markdown-display";
//Esto permite guardar la foto ademas de agregar un icono de lucide
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image as ImageLucide } from "lucide-react-native";
//Las fotos se almacenan bajo la key @saved_photos
const PHOTOS_KEY = "@saved_photos";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
};

export default function NoteAi() {
  const [isOpen, setIsOpen] = useState(false);
  const [openCamera, setOpenCamera] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useContext(ThemeContext);
  const { notes } = useNotes();
  const router = useRouter();

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, [messages, loading]);

  const ai = new GoogleGenAI({
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
  });

  // Estilos personalizados para Markdown usando el theme
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

  /** ------------------ENVIAR MENSAJE DE TEXTO---------------------*/
  async function handleSend() {
    if (!value.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: value,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const currentPrompt = value;
    setValue("");
    setLoading(true);

    try {
      // Construir historial de conversación completo
      const conversationHistory = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text.replace(/TITULO:\s*.+?(\n|$)/i, '').trim() }],
      }));

      // Agregar el mensaje actual del usuario
      conversationHistory.push({
        role: "user",
        parts: [{ text: currentPrompt }],
      });

      // Preparar información de notas guardadas (últimas 10 notas)
      const recentNotes = notes.slice(0, 10);
      const notesContext = notes.length > 0
        ? `\n\nNOTAS GUARDADAS DEL USUARIO (últimas ${recentNotes.length}):\n` +
          recentNotes.map((note, idx) => {
            const status = note.completed ? "[✓ Completada]" : "[⏳ Pendiente]";
            return `[${idx + 1}] ${status} "${note.title}"\nContenido: ${note.content.substring(0, 200)}${note.content.length > 200 ? '...' : ''}\nCreada: ${new Date(note.createdAt).toLocaleDateString()}\n`;
          }).join('\n')
        : '\n\nEl usuario aún no tiene notas guardadas.';

      const systemPrompt = `Eres un asistente experto en productividad y organización de notas. 

Tu objetivo es ayudar al usuario a crear, mejorar y organizar sus notas de forma eficiente.
${notesContext}

INSTRUCCIONES IMPORTANTES:
1. Si el usuario pide crear una nota o quiere guardar algo, genera:
   - Un título descriptivo corto (máximo 6 palabras)
   - Contenido bien estructurado con formato Markdown
   - Al FINAL de tu respuesta, en una nueva línea: TITULO: [título aquí]

2. Si el usuario pide mejorar, expandir o reescribir una nota:
   - Revisa las NOTAS GUARDADAS arriba para encontrar la nota mencionada
   - Puede decir "mejora mi última nota" → usa la nota [1]
   - Puede decir "mejora la nota sobre X" → busca por título
   - Genera una versión mejorada CON el mismo título o uno mejor
   - Incluye TITULO: al final

3. Si el usuario pregunta sobre sus notas:
   - Puedes listar, resumir o buscar en las notas guardadas
   - Sé específico sobre qué notas tiene

4. Para respuestas generales (saludos, preguntas, etc.):
   - Responde normalmente SIN agregar TITULO:
   - Sé conciso y útil

5. Usa formato Markdown cuando sea apropiado:
   - Títulos con #, ##, ###
   - Listas con - o 1.
   - Énfasis con **negrita** o *cursiva*
   - Código con \`backticks\`

Mantén las respuestas claras y accionables.`;

      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          },
          ...conversationHistory,
        ],
      });

      const aiText = res.text || "No pude generar respuesta, intenta de nuevo.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      setMessages((p) => [
        ...p,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "Error: " + err.message,
          timestamp: new Date(),
        },
      ]);
    }

    setLoading(false);
  }

  /** ------------------------
   * FOTO TOMADA → ANALIZAR
   --------------------------*/
  async function handlePicture(base64Image: string) {
    setOpenCamera(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: "📸 Enviando foto para análisis...",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "Eres un sistema que analiza imágenes y genera tareas optimizadas.\n\n" +
                  "INSTRUCCIONES:\n" +
                  "1. Analiza la imagen y identifica tareas u objetivos\n" +
                  "2. Genera recomendaciones específicas y accionables\n" +
                  "3. Usa formato Markdown para estructurar la información\n" +
                  "4. Al FINAL, agrega: TITULO: [título descriptivo corto]\n\n" +
                  "Ejemplo: Si ves una cama desordenada → recomienda 'Tender la cama'\n" +
                  "Si ves un escritorio → recomienda organizar, limpiar, etc.",
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Image,
                },
              },
            ],
          },
        ],
      });

      const aiText = res.text || "No pude interpretar la imagen.";
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Extraer titulo y contenido para crear nota automáticamente
      const tituloMatch = aiText.match(/TITULO:\s*(.+?)(\n|$)/i);
      const titulo = tituloMatch ? tituloMatch[1].trim() : "Análisis de imagen";
      const contenido = aiText.replace(/TITULO:\s*.+?(\n|$)/i, '').trim();

      // Enviar datos a la pantalla /create
      router.push(
        `/create?title=${encodeURIComponent(titulo)}&content=${encodeURIComponent(
          contenido
        )}`
      );
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "Error analizando imagen: " + err.message,
          timestamp: new Date(),
        },
      ]);
    }

    setLoading(false);
  }

  async function handleSavedPhoto(base64:string) {
    try{
      //aqui obtengo las fotos existentes
      const photosJson = await AsyncStorage.getItem(PHOTOS_KEY);
      const existingPhotos = photosJson ? JSON.parse(photosJson) : [];
      
      const photodata={
        id: `photo_${Date.now()}`,
        image: base64,//-----------------------
        timestamp: new Date().toISOString(), 
      };
      const updatedPhotos = [photodata, ...existingPhotos];

      await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updatedPhotos));
      //Mensaje de consola para poder verificar si se guarda
      console.log("Se guardo la imagen xd ");
    } 
    catch (err:any)//error-------------Tengo que cambiar si es que no sirve y solo poner error no con any
    {
      console.log("No se pudo guardar la fotovich")
    }
       
    }
    
  

  // Sugerencias rápidas
  const quickSuggestions = [
    "¿Qué notas tengo guardadas?",
    "Mejora mi última nota",
    "Resume mis notas pendientes",
    "Crea una lista de tareas nueva",
    "profe pongame 10, tengo sueño", 
  ];

  const handleQuickSuggestion = (suggestion: string) => {
    setValue(suggestion);
  };

  if (openCamera)
    return (
      <CameraNote
        onPictureTaken={handlePicture}
        onClose={() => setOpenCamera(false)}
      />
    );

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="absolute bottom-28 right-8 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        style={{ backgroundColor: theme.primary }}
      >
        <Bot size={32} color={theme.card} />
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={isOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/40">
          <View
            className="mt-auto h-[75%] rounded-t-3xl p-5"
            style={{ backgroundColor: theme.card }}
          >
            {/* HEADER */}
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text
                  style={{ fontSize: 20, fontWeight: "600", color: theme.text }}
                >
                  Asistente IA
                </Text>
                <Text style={{ fontSize: 12, color: theme.text + "80" }}>
                  {loading ? "Pensando..." : `${notes.length} notas disponibles`}
                </Text>
              </View>

              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <X size={26} color={theme.primary} />
              </TouchableOpacity>
            </View>

            {/* Borre la opcion de tomar foto desde la IA, ahora solo se hace desde imagen */}
            
            {/* CHAT */}
            <ScrollView ref={scrollRef} className="flex-1 mb-2">
              {messages.length === 0 ? (
                <View className="flex-1 py-6">
                  <View className="items-center mb-6">
                    <Bot size={64} color={theme.primary} />
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: theme.text,
                        marginTop: 16,
                        marginBottom: 8,
                      }}
                    >
                      ¡Hola! Soy tu Asistente IA
                    </Text>
                    <Text
                      style={{
                        color: theme.text + "CC",
                        textAlign: "center",
                        paddingHorizontal: 32,
                        marginBottom: 16,
                      }}
                    >
                      Puedo ayudarte a crear, mejorar y organizar tus notas 
                    </Text>
                  </View>

                  <View className="px-2">
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.text + "99",
                        marginBottom: 8,
                        fontWeight: "600",
                      }}
                    >
                      Prueba preguntarme:
                    </Text>
                    {quickSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleQuickSuggestion(suggestion)}
                        className="p-3 rounded-xl mb-2"
                        style={{
                          backgroundColor: theme.background,
                          borderWidth: 1,
                          borderColor: theme.primary + "30",
                        }}
                      >
                        <Text style={{ color: theme.text }}>{suggestion}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                messages.map((msg) => (
                  <TouchableOpacity
                    key={msg.id}
                    className={`p-3 rounded-xl mb-2 max-w-[80%] ${
                      msg.sender === "user" ? "self-end" : "self-start"
                    }`}
                    style={{
                      backgroundColor:
                        msg.sender === "user" ? theme.primary : theme.background,
                    }}
                    onPress={() => {
                      if (msg.sender === "ai") {
                        const tituloMatch = msg.text.match(/TITULO:\s*(.+?)(\n|$)/i);
                        
                        if (tituloMatch) {
                          const titulo = tituloMatch[1].trim();
                          const contenido = msg.text.replace(/TITULO:\s*.+?(\n|$)/i, '').trim();
                          
                          router.push(
                            `/create?title=${encodeURIComponent(titulo)}&content=${encodeURIComponent(
                              contenido
                            )}`
                          );
                        }
                      }
                    }}
                    disabled={msg.sender === "user"}
                    activeOpacity={msg.sender === "ai" ? 0.7 : 1}
                  >
                    {msg.sender === "user" ? (
                      <Text style={{ color: theme.card }}>{msg.text}</Text>
                    ) : (
                      <>
                        <View style={{ minWidth: 200 }}>
                          <Markdown style={markdownStyles}>
                            {msg.text.replace(/TITULO:\s*.+?(\n|$)/i, '').trim()}
                          </Markdown>
                        </View>
                        {msg.text.match(/TITULO:\s*.+?(\n|$)/i) && (
                          <View
                            className="flex-row items-center mt-2 pt-2"
                            style={{ borderTopWidth: 1, borderTopColor: theme.primary + "30" }}
                          >
                            <FileText size={14} color={theme.accent} />
                            <Text
                              style={{
                                fontSize: 11,
                                color: theme.accent,
                                marginLeft: 4,
                                fontWeight: "600",
                              }}
                            >
                              Toca para crear nota
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                ))
              )}

              {loading && (
                <View className="items-start mb-3">
                  <View
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: theme.background }}
                  >
                    <ActivityIndicator size="small" color={theme.primary} />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* INPUT */}
            <View className="flex-row items-center space-x-3">
              <TextInput
                value={value}
                onChangeText={setValue}
                placeholder="Escribe tu mensaje..."
                placeholderTextColor={theme.text + "80"}
                multiline
                maxLength={500}
                style={{
                  flex: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: theme.background,
                  color: theme.text,
                  maxHeight: 100,
                }}
                onSubmitEditing={handleSend}
                editable={!loading}
              />

              <TouchableOpacity
                onPress={handleSend}
                disabled={loading || !value.trim()}
                className="px-4 py-3 rounded-xl"
                style={{
                  backgroundColor:
                    loading || !value.trim() ? theme.text + "30" : theme.primary,
                }}
              >
                <Send size={20} color={theme.card} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}