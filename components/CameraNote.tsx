import React, { useRef } from "react";
import { View, TouchableOpacity } from "react-native";
import { CameraView } from "expo-camera";
import { X, Circle } from "lucide-react-native";

type CameraNoteProps = {
  onPictureTaken: (uri: string) => void;
  onClose: () => void;
};

export default function CameraNote({ onPictureTaken, onClose }: CameraNoteProps) {
  const cameraRef = useRef<CameraView>(null);

  async function takePhoto() {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync({
      base64: true,
      quality: 0.8,
    });

    onPictureTaken(photo.base64 ?? "");
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        ref={cameraRef}
      />

      <TouchableOpacity className="absolute top-10 left-5" onPress={onClose}>
        <X size={32} color="white" />
      </TouchableOpacity>

      <TouchableOpacity onPress={takePhoto} className="absolute bottom-10 self-center">
        <Circle size={80} color="white" />
      </TouchableOpacity>
    </View>
  );
}
