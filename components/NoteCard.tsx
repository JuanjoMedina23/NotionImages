import { View, Text, TouchableOpacity, Animated, PanResponder, ScrollView } from "react-native";
import { router } from "expo-router";
import { useNotes, Note } from "../contexts/NoteContext";
import { useRef, useContext } from "react";
import { CheckCircle2, Circle, Trash2 } from "lucide-react-native";
import { ThemeContext } from "../contexts/ThemeContext";

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
  const { deleteNote, toggleComplete } = useNotes();
  const { theme } = useContext(ThemeContext);

  const pan = useRef(new Animated.ValueXY()).current;
  const checkScale = useRef(new Animated.Value(1)).current;

  // Crear valores animados para opacidad de los fondos
  const completeOpacity = pan.x.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const deleteOpacity = pan.x.interpolate({
    inputRange: [-100, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 10;
      },
  
      onPanResponderMove: Animated.event([null, { dx: pan.x }], {
        useNativeDriver: false,
      }),
  
      onPanResponderRelease: (e, { dx }) => {
        if (dx > 100) {
          Animated.timing(pan, {
            toValue: { x: 300, y: 0 },
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            toggleComplete(note.id);
            // Resetear inmediatamente después de completar
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (dx < -100) {
          Animated.timing(pan, {
            toValue: { x: -300, y: 0 },
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            deleteNote(note.id);
            // No hace falta resetear porque se elimina
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleCheckPress = () => {
    // Asegurar que pan esté en 0 antes de animar el checkbox
    pan.setValue({ x: 0, y: 0 });
    
    Animated.sequence([
      Animated.timing(checkScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(checkScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    toggleComplete(note.id);
  };

  return (
    <View style={{ marginBottom: 12 }}>
      {/* Background completar (derecha) - Solo visible cuando deslizas a la derecha */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: "100%",
          backgroundColor: "#22c55e",
          borderRadius: 16,
          justifyContent: "center",
          paddingLeft: 16,
          opacity: completeOpacity,
        }}
        pointerEvents="none"
      >
        <CheckCircle2 size={24} color="white" />
      </Animated.View>

      {/* Background eliminar (izquierda) - Solo visible cuando deslizas a la izquierda */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: "100%",
          backgroundColor: "#dc2626",
          borderRadius: 16,
          justifyContent: "center",
          paddingRight: 16,
          alignItems: "flex-end",
          opacity: deleteOpacity,
        }}
        pointerEvents="none"
      >
        <Trash2 size={24} color="white" />
      </Animated.View>

      {/* Card animada */}
      <Animated.View
        style={[
          { transform: [{ translateX: pan.x }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          onPress={() => router.push(`/details/${note.id}`)}
          activeOpacity={0.8}
          style={{
            backgroundColor: theme.card,
            padding: 16,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 5,
            elevation: 3,
            opacity: note.completed ? 0.5 : 1,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
            <ScrollView
              style={{ flex: 1, marginRight: 12, maxHeight: 80 }}
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: note.completed ? theme.text + "66" : theme.text,
                  textDecorationLine: note.completed ? "line-through" : "none",
                }}
              >
                {note.title}
              </Text>

              <Text style={{ fontSize: 12, color: theme.text + "99", marginTop: 4 }}>
                {note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
              </Text>
            </ScrollView>

            <TouchableOpacity onPress={handleCheckPress} activeOpacity={0.7} style={{ padding: 4 }}>
              <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                {note.completed ? (
                  <CheckCircle2 size={28} color={theme.primary} />
                ) : (
                  <Circle size={28} color={theme.text + "66"} />
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}