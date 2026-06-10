import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SLIDES = [
  {
    id: '1',
    emoji: '📈',
    title: '매일 10분,\n주식 고수되기',
    sub: '매일 10문제로 핵심 개념만\n빠르게 익혀요.',
  },
  {
    id: '2',
    emoji: '🧠',
    title: '퀴즈로 배우고\n뉴스로 확인해요',
    sub: 'OX · 객관식 퀴즈와\n오늘의 주식 뉴스를 한번에!',
  },
  {
    id: '3',
    emoji: '👑',
    title: '꾸준히 풀면\n워런버핏이 될 수도?',
    sub: 'XP를 쌓아 입문자에서\n워런버핏까지 레벨업!',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slide = SLIDES[currentIndex];

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finish();
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 건너뛰기 */}
      <TouchableOpacity style={styles.skip} onPress={finish}>
        <Text style={styles.skipText}>건너뛰기</Text>
      </TouchableOpacity>

      {/* 슬라이드 */}
      <View style={styles.slide}>
        <Text style={styles.slideEmoji}>{slide.emoji}</Text>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideSub}>{slide.sub}</Text>
      </View>

      {/* 인디케이터 */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>

      {/* 버튼 */}
      <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.85}>
        <Text style={styles.buttonText}>
          {currentIndex === SLIDES.length - 1 ? '🚀  시작하기' : '다음'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
  },
  skip: {
    alignSelf: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  skipText: {
    color: '#6B7280',
    fontSize: 14,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  slideEmoji: {
    fontSize: 80,
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 16,
  },
  slideSub: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D2D44',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#3B82F6',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 48,
    marginBottom: 32,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
