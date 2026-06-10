import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { checkAnswer } from '../utils/quizHelper';
import { saveQuizResult } from '../utils/storage';
import { getLevelInfo } from '../utils/xp';

export default function ResultScreen({ route, navigation }) {
  const { questions, answers } = route.params;
  const [xpResult, setXpResult] = useState(null);

  const correctCount = questions.filter((q, i) => checkAnswer(q, answers[i])).length;
  const wrongCount = questions.length - correctCount;
  const total = questions.length;
  const percentage = Math.round((correctCount / total) * 100);

  useEffect(() => {
    saveQuizResult(correctCount, total, questions, answers).then(({ earnedXP, totalXP }) => {
      const levelInfo = getLevelInfo(totalXP);
      setXpResult({ earnedXP, totalXP, levelInfo });
    });
  }, []);

  const getMessage = () => {
    if (percentage === 100) return { emoji: '🏆', title: '완벽해요!', sub: '모든 문제를 맞혔어요. 주식 고수!' };
    if (percentage >= 80) return { emoji: '🎉', title: '훌륭해요!', sub: '거의 다 맞혔어요. 조금만 더!' };
    if (percentage >= 60) return { emoji: '👍', title: '잘했어요!', sub: '오답 해설을 꼭 확인해보세요.' };
    if (percentage >= 40) return { emoji: '📚', title: '괜찮아요!', sub: '틀린 문제 위주로 복습해봐요.' };
    return { emoji: '💪', title: '도전하세요!', sub: '매일 조금씩 공부하면 늘어요.' };
  };

  const { emoji, title, sub } = getMessage();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        style={Platform.OS === 'web' ? { overflow: 'auto' } : {}}
      >
        {/* 점수 카드 */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreEmoji}>{emoji}</Text>
          <Text style={styles.scoreTitle}>{title}</Text>
          <Text style={styles.scoreSub}>{sub}</Text>

          <View style={styles.scoreBig}>
            <Text style={styles.scoreNum}>{correctCount}</Text>
            <Text style={styles.scoreOf}>/{total}</Text>
          </View>

          {/* 정답/오답 요약 */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryBox, styles.summaryCorrect]}>
              <Text style={styles.summaryNum}>{correctCount}</Text>
              <Text style={styles.summaryLabel}>정답</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={[styles.summaryBox, styles.summaryWrong]}>
              <Text style={[styles.summaryNum, { color: '#EF4444' }]}>{wrongCount}</Text>
              <Text style={styles.summaryLabel}>오답</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryBox}>
              <Text style={styles.summaryNum}>{percentage}%</Text>
              <Text style={styles.summaryLabel}>정확도</Text>
            </View>
          </View>
        </View>

        {/* XP 획득 카드 */}
        {xpResult && (
          <View style={styles.xpCard}>
            <View style={styles.xpTop}>
              <Text style={styles.xpEmoji}>{xpResult.levelInfo.current.emoji}</Text>
              <View>
                <Text style={styles.xpLevel}>Lv.{xpResult.levelInfo.current.level} {xpResult.levelInfo.current.title}</Text>
                <Text style={styles.xpEarned}>+{xpResult.earnedXP} XP 획득!</Text>
              </View>
            </View>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${Math.round(xpResult.levelInfo.progress * 100)}%` }]} />
            </View>
            <View style={styles.xpBarLabels}>
              <Text style={styles.xpBarText}>{xpResult.totalXP} XP</Text>
              {xpResult.levelInfo.next && (
                <Text style={styles.xpBarText}>다음 레벨: {xpResult.levelInfo.next.minXp} XP</Text>
              )}
            </View>
          </View>
        )}

        {/* 문제 복습 */}
        <Text style={styles.reviewTitle}>📋 문제 복습</Text>

        {questions.map((q, index) => {
          const correct = checkAnswer(q, answers[index]);
          return (
            <View key={q.id} style={[styles.reviewCard, correct ? styles.reviewCorrect : styles.reviewWrong]}>
              <View style={styles.reviewTop}>
                <View style={styles.reviewNumBadge}>
                  <Text style={styles.reviewNumText}>{index + 1}</Text>
                </View>
                <Text style={[styles.reviewResultText, { color: correct ? '#10B981' : '#EF4444' }]}>
                  {correct ? '✅ 정답' : '❌ 오답'}
                </Text>
              </View>
              <Text style={styles.reviewQuestion}>{q.question}</Text>
              {!correct && (
                <View style={styles.reviewExplanationBox}>
                  <Text style={styles.reviewExplanation}>💡 {q.explanation}</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* 하단 버튼 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.replace('Quiz')}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>🔄 다시 풀기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <Text style={styles.homeText}>🏠 홈으로</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FF',
  },
  scroll: {
    padding: 20,
  },

  // 점수 카드
  scoreCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 28,
  },
  scoreEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  scoreSub: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreBig: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  scoreNum: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#3B82F6',
    lineHeight: 72,
  },
  scoreOf: {
    fontSize: 28,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: '#2D2D44',
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
  },
  summaryCorrect: {},
  summaryWrong: {},
  summaryNum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#3D3D54',
    marginVertical: 4,
  },

  // 복습
  reviewTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 14,
  },
  reviewCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
  },
  reviewCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  reviewWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  reviewNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewNumText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  reviewResultText: {
    fontSize: 13,
    fontWeight: '700',
  },
  reviewQuestion: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 21,
  },
  reviewExplanationBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
  },
  reviewExplanation: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },

  // XP 카드
  xpCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  xpTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  xpEmoji: {
    fontSize: 32,
  },
  xpLevel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  xpEarned: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '700',
  },
  xpBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  xpBarFill: {
    height: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  xpBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpBarText: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  // 버튼
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  retryText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
  },
  homeButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  homeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
});
