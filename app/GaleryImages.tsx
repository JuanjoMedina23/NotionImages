import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import {View,Text,TouchableOpacity,ScrollView,Image,Modal,Alert,ActivityIndicator,Animated, PanResponder } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image as ImageIcon, X, Trash2, Camera,Heart,  Star,Sparkles} from "lucide-react-native";
import { ThemeContext } from "../contexts/ThemeContext";
import CameraNote from "../components/CameraNote";

/* Importar useRouter para navegar donde estw la IA */
import { useRouter } from "expo-router";

/* Agregue la  propiedad isFavorite */
type SavedPhoto = {
  id: string;
  image: string; // base64
  timestamp: string;
  isFavorite?: boolean; 
};

const PHOTOS_KEY = "@saved_photos";

function PhotoItem({ 
  photo, 
  onPress, 
  theme 
}: { 
  photo: SavedPhoto;
  onPress: () => void;
  theme: any;
}) {
  return (
    <View className="w-[48%] m-1">
      <TouchableOpacity
        onPress={onPress}
        className="aspect-square rounded-xl overflow-hidden"
        style={{ backgroundColor: theme.card }}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: `data:image/jpeg;base64,${photo.image}` }}
          className="w-full h-full"
          resizeMode="cover"
        />
        
        {/*  Badge de favorito en la esquina */}
        {photo.isFavorite && (
          <View className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1.5">
            <Star size={16} color="white" fill="white" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}


export default function PhotoGallery() {
  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<SavedPhoto | null>(null);
  const [openCamera, setOpenCamera] = useState(false);
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);
  
  /*  ordenar fotos   segun el date */
  const [sortBy, setSortBy] = useState<'date' | 'favorites'>('date');
  
  
  const router = useRouter();

  
  const translateX = useRef(new Animated.Value(0)).current;
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  
  useEffect(() => {
    translateX.setValue(0);
    setSwipeDirection(null);
  }, [selectedPhoto]);

  
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !loading,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 10 && !loading;
        },
        onPanResponderMove: (_, gestureState) => {
          if (loading) return;
          
          if (gestureState.dx < -50) {
            setSwipeDirection('left');
          } else if (gestureState.dx > 50) {
            setSwipeDirection('right');
          } else {
            setSwipeDirection(null);
          }
          translateX.setValue(gestureState.dx);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (loading || !selectedPhoto) return;

          if (gestureState.dx < -100) {
            // Deslizar izquierda -> Analizar
            Animated.timing(translateX, {
              toValue: -400,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              analyzePhoto(selectedPhoto.id);
              translateX.setValue(0);
            });
          } else if (gestureState.dx > 100) {
            // Deslizar derecha es Favorito
            Animated.timing(translateX, {
              toValue: 400,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              toggleFavorite(selectedPhoto.id);
              Animated.timing(translateX, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }).start();
            });
          } else {
            // Vuelve a posición original
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              friction: 8,
            }).start();
          }
          setSwipeDirection(null);
        },
      }),
    [loading, selectedPhoto, translateX]
  );

  /* Cambio del color de fondo según como lo muevaxd */
  const backgroundColor = translateX.interpolate({
    inputRange: [-200, -100, 0, 100, 200],
    outputRange: ['rgba(139, 92, 246, 0.5)', 'rgba(139, 92, 246, 0.5)', 'transparent', 'rgba(245, 158, 11, 0.5)', 'rgba(245, 158, 11, 0.5)'],
    extrapolate: 'clamp',
  });

  const loadPhotos = async () => {
    try {
      const photosJson = await AsyncStorage.getItem(PHOTOS_KEY);
      if (photosJson) {
        const loadedPhotos: SavedPhoto[] = JSON.parse(photosJson);
        // Ordenar por más reciente
        loadedPhotos.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setPhotos(loadedPhotos);
      }
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePhoto = async (base64Image: string) => {
    try {
      /*  Agregar isFavorite: false por defecto */
      const photoData: SavedPhoto = {
        id: `photo_${Date.now()}`,
        image: base64Image,
        timestamp: new Date().toISOString(),
        isFavorite: false, 
      };

      const updatedPhotos = [photoData, ...photos];
      await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updatedPhotos));
      setPhotos(updatedPhotos);
      Alert.alert("¡Éxito!", "Foto guardada correctamente");
    } catch (error) {
      console.error("Error saving photo:", error);
      Alert.alert("Error", "No se pudo guardar la foto");
    }
  };

  const deletePhoto = async (photoId: string) => {
    Alert.alert("Eliminar foto", "¿Estás seguro de eliminar esta foto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            const updatedPhotos = photos.filter((p) => p.id !== photoId);
            await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updatedPhotos));
            setPhotos(updatedPhotos);
            setSelectedPhoto(null);
          } catch (error) {
            console.error("Error deleting photo:", error);
            Alert.alert("Error", "No se pudo eliminar la foto");
          }
        },
      },
    ]);
  };

 
  const toggleFavorite = async (photoId: string) => {
    try {
      const updatedPhotos = photos.map((p) =>
        p.id === photoId ? { ...p, isFavorite: !p.isFavorite } : p
      );
      await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updatedPhotos));
      setPhotos(updatedPhotos);
      
      const photo = updatedPhotos.find(p => p.id === photoId);
      if (photo?.isFavorite) {
        Alert.alert( "Agregado a favoritos");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  
  const analyzePhoto = async (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    /* Estado para controlar el alert de loading */
    setLoading(true);

    try {
      /*  Importar GoogleGenAI */
      const { GoogleGenAI } = require("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      });

      /*  Enviar la imagen base64 a Gemini ademas de hacer el propmt aqui*/
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
                  data: photo.image, /* Aquí va el base64 */
                },
              },
            ],
          },
        ],
      });

      const aiText = res.text || "No pude interpretar la imagen.";

      /*  Extraer título y contenido */
      const tituloMatch = aiText.match(/TITULO:\s*(.+?)(\n|$)/i);
      const titulo = tituloMatch ? tituloMatch[1].trim() : "Análisis de imagen";
      const contenido = aiText.replace(/TITULO:\s*.+?(\n|$)/i, '').trim();

      setLoading(false);
      setSelectedPhoto(null); /* Cerrar modal */

      /*  Navegar a /create con los datos */
      router.push(
        `/create?title=${encodeURIComponent(titulo)}&content=${encodeURIComponent(
          contenido
        )}`
      );

    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", "No se pudo analizar la imagen: " + error.message);
    }
  };

  const handlePictureTaken = (base64Image: string) => {
    setOpenCamera(false);
    savePhoto(base64Image);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

 


  const getSortedPhotos = () => {
    const photosCopy = [...photos];
    
    if (sortBy === 'favorites') {
      return photosCopy.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    }
    
    //  ordenar por fecha
    return photosCopy.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const sortedPhotos = getSortedPhotos();
  const favoritesCount = photos.filter(p => p.isFavorite).length; /* NUEVO */

  if (openCamera) {
    return (
      <CameraNote
        onPictureTaken={handlePictureTaken}
        onClose={() => setOpenCamera(false)}
      />
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* HEADER - MODIFICADO */}
      <View
        className="px-5 pt-12 pb-4"
        style={{ backgroundColor: theme.card }}
      >
        {/*  Primera fila con título y botón */}
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: theme.text }}>
              Mis Fotos
            </Text>
            {/*  Mostrar contador de favoritas */}
            <Text style={{ fontSize: 14, color: theme.text + "99" }}>
              {photos.length} fotos • {favoritesCount} favoritas
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setOpenCamera(true)}
            className="px-4 py-3 rounded-xl flex-row items-center"
            style={{ backgroundColor: theme.primary }}
          >
            <Camera size={20} color={theme.card} />
            <Text
              style={{
                color: theme.card,
                marginLeft: 8,
                fontWeight: "600",
              }}
            >
              Nueva
            </Text>
          </TouchableOpacity>
        </View>

        {/*  Botones de filtro */}
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => setSortBy('date')}
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: sortBy === 'date' ? theme.primary : theme.background,
            }}
          >
            <Text
              style={{
                color: sortBy === 'date' ? theme.card : theme.text,
                fontWeight: "600",
                fontSize: 12,
              }}
            >
               Recientes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSortBy('favorites')}
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: sortBy === 'favorites' ? theme.primary : theme.background,
            }}
          >
            <Text
              style={{
                color: sortBy === 'favorites' ? theme.card : theme.text,
                fontWeight: "600",
                fontSize: 12,
              }}
            >
               Favoritas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENIDO */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.text + "80", marginTop: 12 }}>
            Cargando fotos...
          </Text>
        </View>
      ) : photos.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <ImageIcon size={64} color={theme.text + "40"} />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: theme.text,
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            No hay fotos guardadas
          </Text>
          <Text
            style={{
              color: theme.text + "99",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Toma tu primera foto para empezar tu galería
          </Text>
          <TouchableOpacity
            onPress={() => setOpenCamera(true)}
            className="px-6 py-3 rounded-xl"
            style={{ backgroundColor: theme.primary }}
          >
            <Text style={{ color: theme.card, fontWeight: "600" }}>
              Tomar foto
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1 p-2">
          {/*  Usar sortedPhotos en lugar del photos */}
          <View className="flex-row flex-wrap">
            {sortedPhotos.map((photo) => (
              /* Usar el nuevo componente PhotoItem sin gestos */
              <PhotoItem
                key={photo.id}
                photo={photo}
                theme={theme}
                onPress={() => setSelectedPhoto(photo)}
              />
            ))}
          </View>
        </ScrollView>
      )}

      {/* MODAL DE VISTA COMPLETA CON GESTOS */}
      <Modal
        visible={!!selectedPhoto}
        animationType="fade"
        transparent
        onRequestClose={() => !loading && setSelectedPhoto(null)}
      >
        <View className="flex-1 bg-black">
          {/* vista de acción para gestos */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1,
            }}
            pointerEvents="none"
          >
            {swipeDirection === 'left' && (
              <View className="items-center">
                <Sparkles size={64} color="white" />
                <Text style={{ color: 'white', marginTop: 8, fontSize: 16, fontWeight: '600' }}>
                  Analizar con IA
                </Text>
              </View>
            )}
            {swipeDirection === 'right' && (
              <View className="items-center">
                <Heart size={64} color="white" />
                <Text style={{ color: 'white', marginTop: 8, fontSize: 16, fontWeight: '600' }}>
                  Marcar Favorito
                </Text>
              </View>
            )}
          </Animated.View>

          {/* IMAGEN CON GESTOS */}
          {selectedPhoto && (
            <Animated.View
              {...panResponder.panHandlers}
              style={{
                flex: 1,
                transform: [{ translateX }],
              }}
              className="items-center justify-center"
            >
              <Image
                source={{
                  uri: `data:image/jpeg;base64,${selectedPhoto.image}`,
                }}
                className="w-full h-full"
                resizeMode="contain"
              />
            </Animated.View>
          )}

          {/* Overlay de loading mientras analiza sin poder cerrar */}
          {loading && (
            <View 
              className="absolute inset-0 z-50 items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
            >
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={{ color: 'white', marginTop: 16, fontSize: 16 }}>
                Analizando imagen con IA...
              </Text>
            </View>
          )}

          {/* HEADER  */}
          <View className="absolute top-0 left-0 right-0 z-10 px-5 pt-12 pb-4 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setSelectedPhoto(null)}
              className="p-2"
              disabled={loading}
            >
              <X size={28} color="white" />
            </TouchableOpacity>

            {/*  Botones de acción */}
            <View className="flex-row space-x-4">
              {/*  Botón de favorito */}
              <TouchableOpacity
                onPress={() => selectedPhoto && toggleFavorite(selectedPhoto.id)}
                className="p-2"
                disabled={loading}
              >
                <Heart
                  size={24}
                  color={selectedPhoto?.isFavorite ? "#f59e0b" : "white"}
                  fill={selectedPhoto?.isFavorite ? "#f59e0b" : "none"}
                />
              </TouchableOpacity>

              {/*  Botón para analizar con IA */}
              <TouchableOpacity
                onPress={() => selectedPhoto && analyzePhoto(selectedPhoto.id)}
                className="p-2"
                disabled={loading}
              >
                <Sparkles size={24} color="#8b5cf6" />
              </TouchableOpacity>

              {/*  Botón de eliminar */}
              <TouchableOpacity
                onPress={() => selectedPhoto && deletePhoto(selectedPhoto.id)}
                className="p-2"
                disabled={loading}
              >
                <Trash2 size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Foter con fecha e instrucciones */}
          {selectedPhoto && (
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-black/60">
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 12,
                  marginBottom: 4,
                  opacity: 0.8,
                }}
              >
                Desliza para analizar con IA o marcar Favorito
              </Text>
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 14,
                }}
              >
                {formatDate(selectedPhoto.timestamp)}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}