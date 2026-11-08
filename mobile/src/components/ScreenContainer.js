import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cssInterop } from 'nativewind';

cssInterop(SafeAreaView, { className: 'style' });

export default function ScreenContainer({
  children,
  header,
  footer,
  scroll = true,
  edges = ['top'],
  contentStyle,
  contentContainerClassName = '',
  className = '',
  padded = true,
  bounces = true,
}) {
  const defaultPadding = padded ? 'px-5 py-4' : '';

  const bodyContent = scroll ? (
    <ScrollView
      contentContainerStyle={contentStyle}
      contentContainerClassName={`${defaultPadding} ${contentContainerClassName} ${className}`}
      className="flex-1 w-full"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={bounces}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={contentStyle}
      className={`flex-1 w-full ${defaultPadding} ${contentContainerClassName} ${className} justify-between`}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={edges}
      className="flex-1 bg-[#F3EFE8] items-center justify-center"
    >
      {/* Responsive Canvas Shell */}
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col justify-between relative">
        {/* Optional Fixed Top Bar / Header */}
        {header ? (
          <View className="z-20 w-full bg-[#FAF8F5]/90 border-b border-[#EFEBE1]">
            {header}
          </View>
        ) : null}

        {/* Keyboard-Aware Content Viewport */}
        <KeyboardAvoidingView
          className="flex-1 w-full"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        >
          <View className="flex-1 w-full">
            {bodyContent}
          </View>
        </KeyboardAvoidingView>

        {/* Optional Fixed Bottom Bar / Footer */}
        {footer ? (
          <View className="z-20 w-full bg-[#FAF8F5]/95 border-t border-[#EFEBE1]">
            {footer}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}