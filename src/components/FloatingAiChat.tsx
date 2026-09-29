import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export const FloatingAiChat: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: '¡Hola! ¿En qué puedo ayudarte hoy sobre Pilar?' },
  ]);

  // Consulta simple a la API de DeepSeek
  const askDeepSeek = async (text: string): Promise<string> => {
    const apiKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
    if (!apiKey) {
      return 'Falta configurar EXPO_PUBLIC_DEEPSEEK_API_KEY en tu archivo .env';
    }

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Eres el asistente turístico oficial de Pilar, Buenos Aires. Responde de forma amable y concisa.',
            },
            ...messages.map((m) => ({ role: m.role, content: m.text })),
            { role: 'user', content: text },
          ],
        }),
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'No pude obtener una respuesta.';
    } catch {
      return 'Hubo un error de conexión con la IA.';
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    const reply = await askDeepSeek(text);
    setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    setLoading(false);
  };

  return (
    <>
      {/* Botón flotante para abrir el chat */}
      <TouchableOpacity style={styles.fab} onPress={() => setVisible(true)}>
        <Text style={styles.fabIcon}>💬</Text>
      </TouchableOpacity>

      {/* Ventana modal */}
      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Cabecera */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Guía Virtual de Pilar</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Mensajes */}
            <FlatList
              data={messages}
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.bubble,
                    item.role === 'user' ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  <Text style={item.role === 'user' ? styles.userText : styles.aiText}>
                    {item.text}
                  </Text>
                </View>
              )}
            />

            {/* Input y botón enviar */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Escribe tu consulta..."
                placeholderTextColor="#888"
                value={input}
                onChangeText={setInput}
                editable={!loading}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || loading) && styles.disabledBtn]}
                onPress={handleSend}
                disabled={!input.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.sendText}>➤</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabIcon: {
    fontSize: 24,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    fontSize: 20,
    color: '#666',
    padding: 4,
  },
  list: {
    padding: 16,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#F0F0F2',
    alignSelf: 'flex-start',
  },
  userText: {
    color: '#fff',
    fontSize: 15,
  },
  aiText: {
    color: '#000',
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F2',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#007AFF',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});