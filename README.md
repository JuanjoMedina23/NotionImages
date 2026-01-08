📝 NotionImages — AI Notes App

NotionImages es una aplicación de notas inteligente creada con Expo y Firebase Studio, que combina productividad, IA generativa (GenAI) y análisis de imágenes para mejorar la organización personal.

La app permite crear, editar y mejorar notas con ayuda de un chatbot con permisos completos, análisis de imágenes desde la galería y múltiples modos visuales (temas).

🚀 Características principales
✍️ Notas con IA (GenAI)

Creación y edición de notas tradicionales.

Chatbot con IA que puede:

Leer notas existentes

Editar y mejorar contenido

Reorganizar texto

Sugerir mejoras automáticamente

La IA actúa como un asistente con permisos controlados sobre las notas.

🖼️ Análisis de imágenes con IA

Selección de imágenes desde la galería interna de la app.

Conversión de imágenes a Base64 para análisis con IA.

Ejemplo de uso:

Foto de un cuarto desordenado → la IA genera una lista de tareas organizada para mejorar el ambiente.

Pantalla dedicada accesible mediante Tabs inferiores.

👉 Gestos inteligentes

Implementado con React Native Gesture Handler:

👉 Deslizar a la derecha → la IA analiza la imagen

👈 Deslizar a la izquierda → marcar imagen como favorita

🎨 Temas visuales (Settings)

Pantalla de configuración con múltiples modos:

🌞 Normal

🌙 Oscuro

🎄 Navidad

🎃 Halloween

El tema seleccionado:

Se guarda con AsyncStorage

Se maneja mediante Context Providers

Se aplica globalmente en toda la app

🔐 Autenticación real

Inicio de sesión obligatorio con Google

Cada usuario tiene acceso solo a sus datos

Autenticación segura antes de acceder a notas o IA

🗄️ Backend y persistencia

Supabase como base de datos principal

Se almacenan:

Usuario

Notas

Contenido

Fechas

Metadatos adicionales

Relación clara entre usuario y notas

✨ Experiencia de usuario

Splash Screen personalizado

Navegación moderna con Expo Router

Diseño consistente y adaptable a temas

Tabs inferiores para acceso rápido a funciones clave

🛠️ Tecnologías utilizadas

Expo (React Native)

Expo Router

Firebase Studio

Supabase

AsyncStorage

React Context API

GenAI

React Native Gesture Handler

Expo Image / Media APIs

Google Authentication

📱 Plataformas soportadas

✅ Android

✅ iOS

✅ Web (Expo Web)

▶️ Cómo ejecutar el proyecto

Instala dependencias:

npm install


Inicia el proyecto:

npx expo start


Opciones disponibles:

Expo Go

Android Emulator

iOS Simulator

Web

📁 Estructura del proyecto

app/ → Rutas y pantallas (Expo Router)

contexts/ → Providers (Auth, Theme, Notes)

components/ → Componentes reutilizables

assets/ → Imágenes, splash, íconos

🌱 Futuras mejoras

Sincronización offline

Historial de versiones de notas

Exportación de notas

Más acciones por gestos

Más estilos de IA

🤝 Comunidad

Expo Docs

Expo GitHub

Expo Discord


Aqui se muestra un ejemplo del funcionamiento de la app en modo gif:


https://github.com/user-attachments/assets/b629f905-5a92-4d9d-9f33-fa071cdc96c4

