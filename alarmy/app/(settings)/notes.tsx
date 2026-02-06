import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export default function NotesScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const NOTES_STORAGE_KEY = 'NOTES_STORAGE';

  // Load notes from storage
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (data) {
        setNotes(JSON.parse(data));
      }
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };

  const saveNotes = async (notesToSave: Note[]) => {
    try {
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesToSave));
    } catch (err) {
      console.error('Error saving notes:', err);
    }
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setIsEditing(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề ghi chú');
      return;
    }

    let updatedNotes = [...notes];

    if (editingNote) {
      // Update existing note
      updatedNotes = updatedNotes.map(n =>
        n.id === editingNote.id
          ? { ...n, title, content, updatedAt: Date.now() }
          : n
      );
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      updatedNotes = [newNote, ...updatedNotes];
    }

    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setIsEditing(false);
    setTitle('');
    setContent('');
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Xóa ghi chú',
      'Bạn có chắc chắn muốn xóa ghi chú này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            const updatedNotes = notes.filter(n => n.id !== noteId);
            setNotes(updatedNotes);
            saveNotes(updatedNotes);
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isEditing) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsEditing(false)}>
            <Ionicons name="chevron-back" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editingNote ? 'Chỉnh sửa ghi chú' : 'Ghi chú mới'}
          </Text>
          <TouchableOpacity onPress={handleSaveNote}>
            <Text style={styles.saveButton}>Lưu</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.form}>
            <TextInput
              style={styles.titleInput}
              placeholder="Tiêu đề ghi chú"
              placeholderTextColor="#64748b"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.contentInput}
              placeholder="Nội dung ghi chú..."
              placeholderTextColor="#64748b"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảng ghi chú</Text>
        <TouchableOpacity onPress={handleAddNote}>
          <Ionicons name="add" size={28} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      {notes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color="#475569" />
          <Text style={styles.emptyText}>Chưa có ghi chú nào</Text>
          <Text style={styles.emptySubText}>Nhấn nút + để tạo ghi chú mới</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.noteCard}
              onPress={() => handleEditNote(item)}
            >
              <View style={styles.noteContent}>
                <Text style={styles.noteTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.notePreview} numberOfLines={2}>
                  {item.content || 'Không có nội dung'}
                </Text>
                <Text style={styles.noteDate}>
                  {formatDate(item.updatedAt)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteNote(item.id)}
              >
                <Ionicons name="trash" size={20} color="#ef4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },

  // Form
  form: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    backgroundColor: '#1e293b',
    borderColor: '#475569',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  contentInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderColor: '#475569',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
  },

  // List
  listContainer: {
    padding: 16,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#64748b',
  },
  deleteButton: {
    padding: 8,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
});
