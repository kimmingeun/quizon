import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { isTodayDone, getStreak, getLastScore, getXP } from '../utils/storage';
import { fetchStockNews } from '../utils/news';
import { getLevelInfo } from '../utils/xp';

export default function HomeScreen({ navigation }) {
  const [todayDone, setTodayDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastScore, setLastScore] = useState(null);
  const [levelInfo, setLevelInfo] = useState(null);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const today = new Date().toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const done = await isTodayDone();
        const s = await getStreak();
        const score = await getLastScore();
        const xp = await getXP();
        setTodayDone(done);
        setStreak(s);
        setLastScore(score);
        setLevelInfo(getLevelInfo(xp));
      };
      load();
    }, [])
  );

  useEffect(() => {
    fetchStockNews()
      .then(setNews)
      .catch(() => setNews([]))
      .finally(() => setNewsLoading(false));
  }, []);

  const getStreakMessage = () => {
    if (streak === 0) return '오늘 첫 퀴즈를 풀어보세요!';
    if (streak < 3) return `${streak}일째 공부 중이에요 👏`;
    if (streak < 7) return `${streak}일 연속! 꾸준하네요 🔥`;
    return `${streak}일 연속! 주식 고수 등극 🏆`;
  };

  const formatDate = (pubDate) => {
    const d = new Date(pubDate);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8FF" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 상단 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>안녕하세요 👋</Text>
            <Text style={styles.subGreeting}>{getStreakMessage()}</Text>
          </View>
          <View style={styles.badgeRow}>
            {levelInfo && (
              <View style={styles.levelBadge}>
                <Text style={styles.levelEmoji}>{levelInfo.current.emoji}</Text>
                <Text style={styles.levelText}>Lv.{levelInfo.current.level}</Text>
              </View>
            )}
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakCount}>{streak}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 오늘의 퀴즈 메인 카드 */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardTop}>
            <Text style={styles.cardLabel}>TODAY</Text>
            <Text style={styles.cardDate}>{today}</Text>
          </View>

          <View style={styles.divider} />

          {/* XP 진행 바 */}
          {levelInfo && (
            <View style={styles.xpSection}>
              <View style={styles.xpRow}>
                <Text style={styles.xpLabel}>
                  {levelInfo.current.emoji} {levelInfo.current.title}
                </Text>
                <Text style={styles.xpValue}>
                  {levelInfo.xp} XP
                  {levelInfo.next ? ` / ${levelInfo.next.minXp} XP` : ' (MAX)'}
                </Text>
              </View>
              <View style={styles.xpBarBg}>
                <View style={[styles.xpBarFill, { width: `${Math.round(levelInfo.progress * 100)}%` }]} />
              </View>
              {levelInfo.next && (
                <Text style={styles.xpNextLabel}>
                  다음 레벨까지 {levelInfo.next.minXp - levelInfo.xp} XP
                </Text>
              )}
            </View>
          )}

          <View style={styles.divider} />

          {todayDone && lastScore ? (
            <View style={styles.doneSection}>
              <Text style={styles.doneEmoji}>✅</Text>
              <Text style={styles.doneTitle}>오늘 퀴즈 완료!</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreHighlight}>{lastScore.correct}</Text>
                <Text style={styles.scoreSlash}> / {lastScore.total} 정답</Text>
              </View>
            </View>
          ) : (
            <View style={styles.quizInfoSection}>
              <View style={styles.infoRow}>
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeText}>📝 10문제</Text>
                </View>
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeText}>⏱ 약 5분</Text>
                </View>
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeText}>📈 주식 기초</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 카테고리 */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>오늘의 출제 범위</Text>
          <View style={styles.categoryRow}>
            {['기초 개념', '주요 지표', '투자 용어'].map((c) => (
              <View key={c} style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 시작 버튼 */}
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Quiz')}
        >
          <Text style={styles.startButtonText}>
            {todayDone ? '🔄  다시 풀기' : '📈  오늘 퀴즈 시작'}
          </Text>
        </TouchableOpacity>

        {/* 주식 뉴스 */}
        <View style={styles.newsSection}>
          <Text style={styles.newsTitle}>📰 오늘의 주식 뉴스</Text>
          {newsLoading ? (
            <ActivityIndicator color="#3B82F6" style={{ marginTop: 16 }} />
          ) : news.length === 0 ? (
            <Text style={styles.newsEmpty}>뉴스를 불러올 수 없어요.</Text>
          ) : (
            news.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.newsItem}
                activeOpacity={0.7}
                onPress={() => Linking.openURL(item.link)}
              >
                <View style={styles.newsItemInner}>
                  <Text style={styles.newsItemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.newsItemDate}>{formatDate(item.pubDate)}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* 앱 이름 */}
        <Text style={styles.appName}>QuizOn</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FF',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 13,
    color: '#6B7280',
  },
  streakBadge: {
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  streakEmoji: { fontSize: 16 },
  streakCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EA580C',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  levelEmoji: { fontSize: 16 },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  mainCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  mainCardTop: {
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 2,
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#2D2D44',
    marginBottom: 16,
  },
  xpSection: {
    marginBottom: 16,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  xpValue: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  xpBarBg: {
    height: 6,
    backgroundColor: '#2D2D44',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  xpBarFill: {
    height: 6,
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  xpNextLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'right',
  },
  doneSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  doneEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  doneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreHighlight: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreSlash: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  quizInfoSection: {
    paddingVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  infoBadge: {
    backgroundColor: '#2D2D44',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  infoBadgeText: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '500',
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  categoryChipText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  newsSection: {
    marginBottom: 16,
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  newsEmpty: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
  newsItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  newsItemInner: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  newsItemTitle: {
    flex: 1,
    fontSize: 13,
    color: '#1A1A2E',
    fontWeight: '500',
    lineHeight: 19,
  },
  newsItemDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  appName: {
    textAlign: 'center',
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '600',
    letterSpacing: 2,
    paddingBottom: 12,
    paddingTop: 8,
  },
});
