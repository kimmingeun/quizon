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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { isTodayDone, getStreak, getLastScore, getXP } from '../utils/storage';
import { fetchStockNews } from '../utils/news';
import { fetchMarketData } from '../utils/market';
import { getLevelInfo, LEVELS } from '../utils/xp';
import Sparkline from '../components/Sparkline';
import Touchable from '../components/Touchable';

export default function HomeScreen({ navigation }) {
  const [todayDone, setTodayDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastScore, setLastScore] = useState(null);
  const [levelInfo, setLevelInfo] = useState(null);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [market, setMarket] = useState([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [showLevels, setShowLevels] = useState(false);

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
    fetchMarketData()
      .then(setMarket)
      .catch(() => setMarket([]))
      .finally(() => setMarketLoading(false));
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
              <Touchable
                style={styles.levelBadge}
                hoverStyle={styles.levelBadgeHover}
                onPress={() => setShowLevels(true)}
              >
                <Text style={styles.levelEmoji}>{levelInfo.current.emoji}</Text>
                <Text style={styles.levelText}>Lv.{levelInfo.current.level}</Text>
              </Touchable>
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
        <LinearGradient
          colors={['#7C5CFC', '#5B8DEF', '#3BC9F5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainCard}
        >
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
        </LinearGradient>

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
        <Touchable
          style={styles.startButtonWrap}
          onPress={() => navigation.navigate('Quiz')}
        >
          <LinearGradient
            colors={['#7C5CFC', '#5B8DEF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>
              {todayDone ? '🔄  다시 풀기' : '📈  오늘 퀴즈 시작'}
            </Text>
          </LinearGradient>
        </Touchable>

        {/* 시장 지수 */}
        <View style={styles.marketSection}>
          <Text style={styles.marketTitle}>📊 시장 현황</Text>
          {marketLoading ? (
            <ActivityIndicator color="#3B82F6" style={{ marginTop: 16 }} />
          ) : market.length === 0 ? (
            <Text style={styles.marketEmpty}>시장 데이터를 불러올 수 없어요.</Text>
          ) : (
            <View style={styles.marketCard}>
              {['국내', '미국', '환율'].map((category, ci) => {
                const items = market.filter((i) => i.category === category);
                if (!items.length) return null;
                return (
                  <View key={category}>
                    <View style={[styles.marketGroupHeader, ci === 0 && { marginTop: 0 }]}>
                      <Text style={styles.marketGroupLabel}>{category}</Text>
                    </View>
                    {items.map((item, ii) => {
                      const up = item.changePercent != null && item.changePercent >= 0;
                      const color = item.changePercent == null ? '#6B7280' : up ? '#EF4444' : '#3B82F6';
                      return (
                        <View
                          key={item.symbol}
                          style={[styles.marketItem, ii === items.length - 1 && styles.marketItemLast]}
                        >
                          <View style={styles.marketNameCol}>
                            <Text style={styles.marketName}>{item.name}</Text>
                            {item.changePercent != null && (
                              <Text style={[styles.marketTrend, { color }]}>
                                {up ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(2)}%
                              </Text>
                            )}
                          </View>

                          <View style={styles.marketSparkCol}>
                            {item.spark && item.spark.length >= 2 && (
                              <Sparkline data={item.spark} color={color} />
                            )}
                          </View>

                          <View style={styles.marketRight}>
                            <Text style={[styles.marketPrice, { color }]}>
                              {item.price == null
                                ? '-'
                                : item.price.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 주식 뉴스 */}
        <View style={styles.newsSection}>
          <Text style={styles.newsTitle}>📰 오늘의 주식 뉴스</Text>
          {newsLoading ? (
            <ActivityIndicator color="#3B82F6" style={{ marginTop: 16 }} />
          ) : news.length === 0 ? (
            <Text style={styles.newsEmpty}>뉴스를 불러올 수 없어요.</Text>
          ) : (
            news.map((item, i) => (
              <Touchable
                key={i}
                style={styles.newsItem}
                hoverStyle={styles.newsItemHover}
                onPress={() => Linking.openURL(item.link)}
              >
                <View style={styles.newsItemInner}>
                  <Text style={styles.newsItemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.newsItemDate}>{formatDate(item.pubDate)}</Text>
                </View>
              </Touchable>
            ))
          )}
        </View>

        {/* 앱 이름 */}
        <Text style={styles.appName}>QuizOn</Text>

      </ScrollView>

      {/* 등급 안내 모달 */}
      <Modal
        visible={showLevels}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLevels(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLevels(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>🏆 등급 안내</Text>
            <Text style={styles.modalSub}>퀴즈를 풀고 XP를 모아 레벨업하세요!</Text>

            {LEVELS.map((lv) => {
              const isCurrent = levelInfo && levelInfo.current.level === lv.level;
              return (
                <View
                  key={lv.level}
                  style={[styles.levelRow, isCurrent && styles.levelRowActive]}
                >
                  <Text style={styles.levelRowEmoji}>{lv.emoji}</Text>
                  <View style={styles.levelRowInfo}>
                    <Text style={[styles.levelRowTitle, isCurrent && styles.levelRowTitleActive]}>
                      Lv.{lv.level} {lv.title}
                    </Text>
                    <Text style={styles.levelRowXp}>{lv.minXp.toLocaleString('ko-KR')} XP 부터</Text>
                  </View>
                  {isCurrent && (
                    <View style={styles.levelCurrentBadge}>
                      <Text style={styles.levelCurrentText}>현재</Text>
                    </View>
                  )}
                </View>
              );
            })}

            <Touchable
              style={styles.modalClose}
              hoverStyle={styles.modalCloseHover}
              onPress={() => setShowLevels(false)}
            >
              <Text style={styles.modalCloseText}>닫기</Text>
            </Touchable>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFF',
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
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 13,
    color: '#6B7280',
  },
  streakBadge: {
    backgroundColor: '#FFEDD5',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakEmoji: { fontSize: 16 },
  streakCount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F97316',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: '#EDE9FE',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelBadgeHover: {
    backgroundColor: '#DDD6FE',
  },
  levelEmoji: { fontSize: 16 },
  levelText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7C5CFC',
  },
  mainCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  mainCardTop: {
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    fontWeight: '700',
    color: '#fff',
  },
  xpValue: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  xpBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  xpBarFill: {
    height: 8,
    backgroundColor: '#FFE066',
    borderRadius: 4,
  },
  xpNextLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
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
    fontWeight: '800',
    color: '#FFE066',
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
    color: 'rgba(255,255,255,0.8)',
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
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  infoBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
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
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  categoryChipText: {
    color: '#7C5CFC',
    fontSize: 13,
    fontWeight: '700',
  },
  startButtonWrap: {
    borderRadius: 22,
    marginBottom: 28,
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  startButton: {
    borderRadius: 22,
    paddingVertical: 20,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  marketSection: {
    marginBottom: 20,
  },
  marketTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  marketEmpty: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
  marketCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 4,
    overflow: 'hidden',
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  marketGroupHeader: {
    marginTop: 14,
    marginBottom: 2,
  },
  marketGroupLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A78BFA',
    letterSpacing: 0.5,
  },
  marketItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  marketItemLast: {
    borderBottomWidth: 0,
  },
  marketNameCol: {
    flex: 1,
  },
  marketName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  marketTrend: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  marketSparkCol: {
    width: 56,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  marketRight: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  marketPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  newsSection: {
    marginBottom: 16,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '800',
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
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  newsItemHover: {
    backgroundColor: '#F5F3FF',
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

  // 등급 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26,26,46,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  levelRowActive: {
    backgroundColor: '#EDE9FE',
    borderWidth: 1.5,
    borderColor: '#7C5CFC',
  },
  levelRowEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  levelRowInfo: {
    flex: 1,
  },
  levelRowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  levelRowTitleActive: {
    color: '#7C5CFC',
  },
  levelRowXp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  levelCurrentBadge: {
    backgroundColor: '#7C5CFC',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  levelCurrentText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
  },
  modalClose: {
    marginTop: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCloseHover: {
    backgroundColor: '#E5E7EB',
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6B7280',
  },
});
