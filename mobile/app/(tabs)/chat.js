import { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Send, Sparkles, Feather, AlertCircle, RefreshCw } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';


import ZenMonkAvatar from '../../src/features/ai/ZenMonkAvatar';
import ChatBubble from '../../src/features/ai/ChatBubble';
import TypingIndicator from '../../src/features/ai/TypingIndicator';
import { useChat } from '../../src/features/ai/useChat';
import { LoadingState } from '../../src/components/States';
import { useAuth } from '../../src/auth/AuthContext';
import { useNotification } from '../../src/notification/NotificationContext';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Plus, { className: 'style' });
cssInterop(Send, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Feather, { className: 'style' });
cssInterop(AlertCircle, { className: 'style' });
cssInterop(RefreshCw, { className: 'style' });

const STARTERS = [
  'I am feeling overwhelmed.',
  'Help me calm my mind.',
  'I want to talk about my day.',
  'Give me a small self-care activity.',
  'I am having trouble sleeping.',
];

export default function ZenMonkChat() {

  const { showNotification } = useNotification();

  const router = useRouter();
  const { user } = useAuth();
  const chat = useChat();
  const [draft, setDraft] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameText, setRenameText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const listRef = useRef(null);

  const submit = () => {
    if (!draft.trim() || chat.sending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    const text = draft;
    setDraft('');
    chat.send(text);
  };

  const onConversationLongPress = (c) => {
    Alert.alert(c.title, 'Manage this conversation', [
      {
        text: 'Rename',
        onPress: () => {
          setRenamingId(c.id);
          setRenameText(c.title);
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Delete this conversation?', 'It will be removed from your journey history.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => chat.removeConversation(c.id).catch(() => { }),
            },
          ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const saveRename = async () => {
    if (!renameText.trim()) return;
    try {
      await chat.rename(renamingId, renameText.trim());
      setRenamingId(null);

      showNotification({
        title: 'Conversation Renamed',
        message: 'Your conversation has been successfully renamed.',
        type: 'success',
      })

    } catch {
      showNotification({
        title: 'Rename Failed',
        message: 'Please try again.',
        type: 'alert',
      })
    }
  };

  const onMessageLongPress = (m) => {
    if (m.pending || m.failed || m.id?.startsWith('tmp-')) return;
    Alert.alert('Delete this reflection?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => chat.removeMessage(m.id).catch(() => { }),
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">

      {/* Responsive Wrapper for Web/Tablet preview + edge-to-edge phone layout */}
      <View className="w-full h-full md:max-w-[440px] md:h-[95vh] md:max-h-[890px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1">

        {/* Header Bar */}
        <View className="px-5 pt-3.5 pb-3 border-b border-[#EAE5D8] bg-[#FAF8F5]/90 backdrop-blur-md">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3.5 flex-1 pr-2">
              <View className="relative">
                <ZenMonkAvatar size={48} />
                <View className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#528A6B] border-2 border-[#FAF8F5]" />
              </View>

              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-[19px] font-serif font-bold text-[#1C2520] tracking-tight">
                    Zen Monk
                  </Text>
                  <View className="bg-[#E5EDE8] px-2 py-0.5 rounded-full">
                    <Text className="text-[9px] uppercase tracking-wider font-bold text-[#436453]">
                      Guide
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-[#718077] mt-0.5" numberOfLines={1}>
                  {user?.name ? `Hello, ${user.name.split(' ')[0]}. ` : ''}Here to listen & hold space.
                </Text>
              </View>
            </View>

            {/* New Conversation Button */}
            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => { });
                chat.newConversation();
              }}
              accessibilityRole="button"
              accessibilityLabel="Start a new conversation"
              className="flex-row items-center gap-1.5 bg-[#EDE8DD] active:bg-[#E3DC CE] px-3.5 py-2 rounded-full border border-[#DFD8CC]"
            >
              <Plus size={15} color="#26362E" strokeWidth={2.4} />
              <Text className="text-xs font-semibold text-[#26362E]">New</Text>
            </Pressable>
          </View>

          {/* Conversation History Pill Chips */}
          {chat.conversations?.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingTop: 12, paddingBottom: 2 }}
            >
              {chat.conversations.map((c) => {
                const selected = c.id === chat.activeId;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => { });
                      chat.select(c.id);
                    }}
                    onLongPress={() => onConversationLongPress(c)}
                    delayLongPress={350}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={`max-w-[170px] px-3.5 py-1.5 rounded-full border ${selected
                      ? 'bg-[#26362E] border-[#26362E]'
                      : 'bg-[#F2EFE8] border-[#E3DDD1] active:bg-[#E8E2D5]'
                      }`}
                  >
                    <Text
                      numberOfLines={1}
                      className={`text-xs ${selected ? 'text-[#FAF8F5] font-semibold' : 'text-[#5C6A62] font-medium'
                        }`}
                    >
                      {c.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}
        </View>

        {/* Inline Rename Bar */}
        {renamingId ? (
          <View className="flex-row items-center gap-2.5 px-5 py-2.5 bg-[#F3EFE7] border-b border-[#E5DFD1]">
            <View className="flex-1 h-10 px-3.5 rounded-xl bg-white border border-[#DDD5C5] justify-center">
              <TextInput
                value={renameText}
                onChangeText={setRenameText}
                maxLength={120}
                autoCapitalize="sentences"
                placeholder="Name your journey"
                placeholderTextColor="#9EA8A1"
                className="text-xs text-[#202923]"
                style={{ outlineStyle: 'none', borderWidth: 0 }}
              />
            </View>
            <Pressable
              onPress={saveRename}
              className="h-10 px-4 rounded-xl bg-[#26362E] items-center justify-center active:opacity-85"
            >
              <Text className="text-xs font-semibold text-[#FAF8F5]">Save</Text>
            </Pressable>
            <Pressable
              onPress={() => setRenamingId(null)}
              className="h-10 px-3 items-center justify-center"
            >
              <Text className="text-xs text-[#7B8881]">Cancel</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Main Chat Flow */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          className="flex-1 bg-[#FAF8F5]"
        >
          {chat.loadingThread && chat.messages.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <LoadingState message="Opening mindful space…" />
            </View>
          ) : null}

          {/* Prompt Starters View */}
          {!chat.loadingThread && chat.messages.length === 0 && !chat.error ? (
            <ScrollView
              contentContainerStyle={{ padding: 22, gap: 14 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="bg-[#EBF2ED] p-4 rounded-3xl border border-[#D5E2D9] mb-1">
                <View className="flex-row items-center gap-2 mb-1.5">
                  <Sparkles size={16} color="#355644" />
                  <Text className="text-xs uppercase font-bold tracking-wider text-[#355644]">
                    Mindful Prompt
                  </Text>
                </View>
                <Text className="text-sm text-[#273B2F] leading-relaxed">
                  How does your chest and heart feel right now? You can share freely, or pick a reflection below:
                </Text>
              </View>

              {STARTERS.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => { });
                    chat.send(s);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Start with: ${s}`}
                  className="bg-white border border-[#E9E4D8] active:border-[#26362E] p-4 rounded-2xl shadow-sm shadow-[#26362E]/5 flex-row items-center justify-between"
                >
                  <Text className="text-xs font-medium text-[#2A3630] flex-1 pr-3 leading-snug">
                    {s}
                  </Text>
                  <View className="w-7 h-7 rounded-full bg-[#F4F1EA] items-center justify-center">
                    <Feather name="arrow-up-right" size={13} color="#4E5D54" />
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            /* Messages List */
            <FlatList
              ref={listRef}
              data={chat.messages}
              keyExtractor={(m) => m.id}
              renderItem={({ item }) => (
                <ChatBubble message={item} onLongPress={() => onMessageLongPress(item)} />
              )}
              contentContainerStyle={{ paddingVertical: 18, paddingHorizontal: 16 }}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
              ListFooterComponent={
                <View className="gap-3.5 mt-2">
                  {chat.sending ? (
                    <View className="self-start ml-2">
                      <TypingIndicator />
                    </View>
                  ) : null}

                  {/* Contextual Wellness Suggestions */}
                  {chat.suggestions?.length > 0 ? (
                    <View className="gap-2 mt-2 bg-[#F5F2EA] p-3.5 rounded-2xl border border-[#E7E1D3]">
                      <Text className="text-[11px] font-semibold tracking-wider uppercase text-[#67776F]">
                        Suggested for your journey:
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {chat.suggestions.map((s) => (
                          <Pressable
                            key={s.deepLink}
                            onPress={() => router.push(s.deepLink)}
                            accessibilityRole="button"
                            className="bg-[#26362E] active:bg-[#1A251F] rounded-full py-2 px-4 shadow-sm"
                          >
                            <Text className="text-xs font-semibold text-[#FAF8F5]">{s.label}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  ) : null}

                  {/* Error Card */}
                  {chat.error ? (
                    <View
                      className="bg-[#FBF1EF] p-3.5 rounded-2xl border border-[#F4D2CC] gap-2.5"
                      accessibilityLiveRegion="polite"
                    >
                      <View className="flex-row items-center gap-2">
                        <AlertCircle size={15} color="#A83A2E" />
                        <Text className="text-xs font-medium text-[#A83A2E] flex-1">
                          {chat.error.message}
                        </Text>
                      </View>
                      {chat.error.text ? (
                        <Pressable
                          onPress={chat.retry}
                          className="self-start flex-row items-center gap-1.5 bg-[#A83A2E] px-3.5 py-1.5 rounded-full"
                        >
                          <RefreshCw size={12} color="#FFFFFF" />
                          <Text className="text-xs font-semibold text-white">Retry</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              }
            />
          )}

          {/* Input Floating Dock */}
          <View className="p-3.5 border-t border-[#EAE5D9] bg-[#FAF8F5]/95">
            <View
              className={`flex-row items-end gap-2.5 bg-white border rounded-3xl px-3.5 py-2 ${isInputFocused ? 'border-[#26362E]' : 'border-[#E4DED1]'
                } shadow-sm shadow-[#26362E]/5`}
            >
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Share what is on your mind..."
                placeholderTextColor="#9AA59E"
                multiline
                maxLength={2000}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                accessibilityLabel="Message to Zen Monk"
                className="flex-1 max-h-[110px] min-h-[38px] text-[14px] text-[#1D2521] pt-2 pb-2 leading-relaxed"
                style={{
                  outlineStyle: 'none',
                  borderWidth: 0,
                }}
              />
              <Pressable
                onPress={submit}
                disabled={!draft.trim() || chat.sending}
                accessibilityRole="button"
                accessibilityLabel="Send reflection"
                className={`w-10 h-10 rounded-full items-center justify-center transition-all ${draft.trim() && !chat.sending
                  ? 'bg-[#26362E] active:scale-95 shadow-md shadow-[#26362E]/30'
                  : 'bg-[#E7E2D6] opacity-60'
                  }`}
              >
                <Send
                  size={16}
                  color={draft.trim() && !chat.sending ? '#FAF8F5' : '#8D9B92'}
                />
              </Pressable>
            </View>

            {/* Subtle Mindful Disclaimer */}
            <Text className="text-[10px] text-[#8C9890] text-center mt-2 tracking-tight">
              Zen Monk is an AI companion for calm reflections, not a clinic. In distress, call 112.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </View>

    </SafeAreaView>
  )
}