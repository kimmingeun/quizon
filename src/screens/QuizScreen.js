import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTodayQuestions } from '../utils/quizHelper';
import Touchable from '../components/Touchable';

const questions = getTodayQuestions();

export default function QuizScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = (currentIndex + 1) / questions.length;
  const isCorrect = showResult && selectedAnswer === question.answer;

  const handleAnswer = (answer) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selectedAnswer];
    if (isLast) {
      navigation.replace('Result', { questions, answers: newAnswers });
    } else {
      setAnswers(newAnswers);
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const getOptionStyle = (idx) => {
    if (!showResult) {
      return selectedAnswer === idx ? styles.optionSelected : styles.optionDefault;
    }
    if (idx === question.answer) return styles.optionCorrect;
    if (selectedAnswer === idx) return styles.optionWrong;
    return styles.optionDefault;
  };

  const getOXStyle = (val) => {
    if (!showResult) {
      return selectedAnswer === val ? styles.oxSelected : styles.oxDefault;
    }
    if (val === question.answer) return styles.oxCorrect;
    if (selectedAnswer === val) return styles.oxWrong;
    return styles.oxDefault;
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* 상단 진행 영역 */}
      <View style={styles.topBar}>
        <Touchable
          style={styles.backButton}
          hoverStyle={styles.backButtonHover}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backText}>✕</Text>
        </Touchable>

        <View style={styles.progressWrapper}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <Text style={styles.progressLabel}>{currentIndex + 1}/{questions.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* 유형 태그 */}
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{question.category}</Text>
          </View>
          <View style={[styles.tag, styles.tagType]}>
            <Text style={styles.tagText}>{question.type === 'ox' ? 'OX 퀴즈' : '객관식'}</Text>
          </View>
        </View>

        {/* 문제 */}
        <Text style={styles.questionText}>{question.question}</Text>

        {/* OX 보기 */}
        {question.type === 'ox' && (
          <View style={styles.oxRow}>
            {[true, false].map((val) => (
              <Touchable
                key={String(val)}
                style={[styles.oxButton, getOXStyle(val)]}
                onPress={() => handleAnswer(val)}
              >
                <Text style={[
                  styles.oxText,
                  showResult && val === question.answer && styles.oxTextCorrect,
                  showResult && selectedAnswer === val && val !== question.answer && styles.oxTextWrong,
                ]}>
                  {val ? 'O' : 'X'}
                </Text>
              </Touchable>
            ))}
          </View>
        )}

        {/* 객관식 보기 */}
        {question.type === 'multiple' && (
          <View style={styles.optionList}>
            {question.options.map((option, idx) => (
              <Touchable
                key={idx}
                style={[styles.optionButton, getOptionStyle(idx)]}
                onPress={() => handleAnswer(idx)}
              >
                <View style={[
                  styles.optionIndex,
                  showResult && idx === question.answer && styles.optionIndexCorrect,
                  showResult && selectedAnswer === idx && idx !== question.answer && styles.optionIndexWrong,
                ]}>
                  <Text style={styles.optionIndexText}>{['①','②','③','④'][idx]}</Text>
                </View>
                <Text style={styles.optionText}>{option}</Text>
              </Touchable>
            ))}
          </View>
        )}

        {/* 해설 박스 */}
        {showResult && (
          <View style={[styles.explanationBox, isCorrect ? styles.explanationCorrect : styles.explanationWrong]}>
            <Text style={styles.explanationTitle}>
              {isCorrect ? '✅  정답이에요!' : '❌  오답이에요'}
            </Text>
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 하단 다음 버튼 */}
      {showResult && (
        <View style={styles.bottomBar}>
          <Touchable style={styles.nextButtonWrap} onPress={handleNext}>
            <LinearGradient
              colors={['#7C5CFC', '#5B8DEF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>
                {isLast ? '결과 보기  →' : '다음 문제  →'}
              </Text>
            </LinearGradient>
          </Touchable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFF',
  },

  // 상단 바
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonHover: {
    backgroundColor: '#D1D5DB',
  },
  backText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  progressWrapper: {
    flex: 1,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#7C5CFC',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    minWidth: 32,
    textAlign: 'right',
  },

  // 스크롤
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // 태그
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagType: {
    backgroundColor: '#F3F4F6',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C5CFC',
  },

  // 문제
  questionText: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#1A1A2E',
    lineHeight: 32,
    marginBottom: 32,
  },

  // OX
  oxRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  oxButton: {
    flex: 1,
    height: 120,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  oxDefault: {
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
  },
  oxSelected: {
    backgroundColor: '#EDE9FE',
    borderColor: '#7C5CFC',
  },
  oxCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  oxWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  oxText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#D1D5DB',
  },
  oxTextCorrect: {
    color: '#10B981',
  },
  oxTextWrong: {
    color: '#EF4444',
  },

  // 객관식
  optionList: {
    gap: 10,
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    gap: 12,
  },
  optionDefault: {
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
  },
  optionSelected: {
    backgroundColor: '#EDE9FE',
    borderColor: '#7C5CFC',
  },
  optionCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  optionWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  optionIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIndexCorrect: {
    backgroundColor: '#10B981',
  },
  optionIndexWrong: {
    backgroundColor: '#EF4444',
  },
  optionIndexText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
    lineHeight: 22,
  },

  // 해설
  explanationBox: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  explanationCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  explanationWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  explanationTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },

  // 하단 버튼
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAFAFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButtonWrap: {
    borderRadius: 18,
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButton: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});
