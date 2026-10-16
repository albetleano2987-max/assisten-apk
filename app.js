import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Halo! Saya AI Floating Companion kamu. Ada yang bisa saya bantu?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  // Fungsi Ambil Screenshot / Gambar dari Galeri
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Fungsi Kirim Pesan ke Gemini API
  const handleSend = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const userMessage = inputText;
    setMessages(prev => [...prev, { role: 'user', text: userMessage, image: selectedImage }]);
    setInputText('');
    setLoading(true);

    try {
      // Jika API Key belum diisi, berikan respons simulasi cerdas
      if (!apiKey) {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            { 
              role: 'assistant', 
              text: `[Mode Simulasi]\nPertanyaan diterima: "${userMessage}". Masukkan API Key Gemini kamu di pengaturan untuk mendapatkan jawaban langsung dari AI!` 
            }
          ]);
          setLoading(false);
          setSelectedImage(null);
        }, 1000);
        return;
      }

      // Integrasi endpoint Gemini API (Contoh menggunakan gemini-1.5-flash)
      // (Catatan: Untuk gambar, perlu konversi base64. Bagian ini disederhanakan untuk struktur dasar)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }]
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, terjadi kesalahan saat merespons.";

      setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Gagal terhubung ke server AI.' }]);
    } finally {
      setLoading(false);
      setSelectedImage(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tombol Floating Bubble */}
      {!isExpanded && (
        <TouchableOpacity 
          style={styles.floatingButton} 
          activeOpacity={0.8}
          onPress={() => setIsExpanded(true)}
        >
          <Ionicons name="sparkles" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Panel Chat Floating / Modal Utama */}
      {isExpanded && (
        <View style={styles.chatContainer}>
          {/* Header Panel */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="sparkles" size={20} color="#38bdf8" />
              <Text style={styles.headerTitle}>AI Floating Companion</Text>
            </View>
            <TouchableOpacity onPress={() => setIsExpanded(false)}>
              <Ionicons name="close" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Input API Key Singkat */}
          <View style={styles.apiKeyBox}>
            <TextInput
              style={styles.apiKeyInput}
              placeholder="Tempel Gemini API Key (Opsional)..."
              placeholderTextColor="#64748b"
              secureTextEntry
              value={apiKey}
              onChangeText={setApiKey}
            />
          </View>

          {/* Daftar Pesan */}
          <ScrollView style={styles.messageScroll} contentContainerStyle={{ padding: 12 }}>
            {messages.map((msg, index) => (
              <View 
                key={index} 
                style={[
                  styles.messageBubble, 
                  msg.role === 'user' ? styles.userBubble : styles.aiBubble
                ]}
              >
                {msg.image && (
                  <Image source={{ uri: msg.image }} style={styles.attachedImage} />
                )}
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            ))}
            {loading && (
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <ActivityIndicator size="small" color="#38bdf8" />
              </View>
            )}
          </ScrollView>

          {/* Preview Gambar Terpilih */}
          {selectedImage && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.previewThumb} />
              <Text style={styles.previewText}>Gambar layar dipilih</Text>
              <TouchableOpacity onPress={() => setSelectedImage(null)}>
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}

          {/* Footer Input */}
          <View style={styles.inputFooter}>
            <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={22} color="#38bdf8" />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Tanyakan sesuatu ke AI..."
              placeholderTextColor="#64748b"
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 40,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  chatContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    left: 20,
    height: height * 0.7,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#090d16',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  apiKeyBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
  },
  apiKeyInput: {
    backgroundColor: '#0f172a',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  messageScroll: {
    flex: 1,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#0284c7',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#1e293b',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#f8fafc',
    fontSize: 14,
  },
  attachedImage: {
    width: 200,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItem: 'center',
    padding: 8,
    backgroundColor: '#1e293b',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  previewThumb: {
    width: 35,
    height: 35,
    borderRadius: 6,
  },
  previewText: {
    flex: 1,
    color: '#cbd5e1',
    fontSize: 12,
  },
  inputFooter: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#090d16',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#0284c7',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
