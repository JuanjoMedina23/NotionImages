import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

export type  Note= {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  completed: boolean;
};

export type NotesContextType = {
  notes: Note[];
  createNote: (title: string, content: string) => Promise<void>;
  updateNote: (id: string, title: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string) => Note | undefined;
  toggleComplete: (id: string) => Promise<void>;
  getFilteredNotes: (filter: "all" | "pending" | "completed") => Note[];
};

const NoteContext = createContext<NotesContextType | undefined>(undefined);

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const STORAGE_KEY = "NOTES_DATA";

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes]);

  // Cargar notas desde Supabase según usuario
  const loadNotes = async () => {
    try {
      // 1. Cargar desde AsyncStorage primero
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setNotes(JSON.parse(raw));
      }

      // 2. Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 3. Obtener notas del usuario
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Error loading notes:", error);
        return;
      }

      if (data) {
        const normalized = data.map((n: any) => ({
          id: n.id,
          title: n.title,
          content: n.content ?? "",
          createdAt: n.created_at,
          completed: n.completed ?? false,
        }));
        setNotes(normalized);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      }
    } catch (e) {
      console.log("Error loading notes:", e);
    }
  };

  // Crear nota asociada al usuario
  const createNote = async (title: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No hay usuario logueado, no se puede crear nota");
        return;
      }

      const { data, error } = await supabase
        .from("notes")
        .insert({
          title,
          content,
          created_at: new Date().toISOString(),
          completed: false,
          user_id: user.id,
        })
        .select();

      if (error) {
        console.log("Error creando nota:", error);
        return;
      }

      if (data && data.length > 0) {
        setNotes((prev) => [data[0], ...prev]);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([data[0], ...notes]));
      }
    } catch (e) {
      console.log("Error creando nota:", e);
    }
  };

  const updateNote = async (id: string, title: string, content: string) => {
    try {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, title, content } : n))
      );

      const { error } = await supabase
        .from("notes")
        .update({ title, content })
        .eq("id", id);

      if (error) console.log("Error updating note:", error);
    } catch (e) {
      console.log("Error updating note:", e);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      setNotes((prev) => prev.filter((n) => n.id !== id));

      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", id);

      if (error) console.log("Error deleting note:", error);
    } catch (e) {
      console.log("Error deleting note:", e);
    }
  };

  const toggleComplete = async (id: string) => {
    try {
      const note = notes.find((n) => n.id === id);
      if (!note) return;

      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, completed: !note.completed } : n))
      );

      const { error } = await supabase
        .from("notes")
        .update({ completed: !note.completed })
        .eq("id", id);

      if (error) console.log("Error toggling note:", error);
    } catch (e) {
      console.log("Error toggling note:", e);
    }
  };

  const getNote = (id: string) => notes.find((n) => n.id === id);

  const getFilteredNotes = (filter: "all" | "pending" | "completed") => {
    switch (filter) {
      case "pending":
        return notes.filter((n) => !n.completed);
      case "completed":
        return notes.filter((n) => n.completed);
      default:
        return notes;
    }
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        createNote,
        updateNote,
        deleteNote,
        getNote,
        toggleComplete,
        getFilteredNotes,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (!context) throw new Error("useNotes must be used within a NoteProvider");
  return context;
};
