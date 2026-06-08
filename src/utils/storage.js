import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LAST_QUIZ_DATE: 'last_quiz_date',
  LAST_SCORE: 'last_score',
  STREAK: 'streak',
  HISTORY: 'history', // [{date, correct, total}]
};

// 오늘 날짜 문자열 (예: "2024-06-08")
export const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// 오늘 퀴즈 완료 여부
export const isTodayDone = async () => {
  const last = await AsyncStorage.getItem(KEYS.LAST_QUIZ_DATE);
  return last === getTodayStr();
};

// 퀴즈 결과 저장
export const saveQuizResult = async (correct, total) => {
  const today = getTodayStr();

  // 마지막 퀴즈 날짜 & 점수 저장
  await AsyncStorage.setItem(KEYS.LAST_QUIZ_DATE, today);
  await AsyncStorage.setItem(KEYS.LAST_SCORE, JSON.stringify({ correct, total }));

  // 스트릭 계산
  const streak = await getStreak();
  const last = await AsyncStorage.getItem(KEYS.LAST_QUIZ_DATE + '_prev');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let newStreak = last === yesterdayStr ? streak + 1 : 1;
  await AsyncStorage.setItem(KEYS.STREAK, String(newStreak));
  await AsyncStorage.setItem(KEYS.LAST_QUIZ_DATE + '_prev', today);

  // 히스토리 저장
  const historyRaw = await AsyncStorage.getItem(KEYS.HISTORY);
  const history = historyRaw ? JSON.parse(historyRaw) : [];
  history.unshift({ date: today, correct, total });
  if (history.length > 30) history.pop(); // 최근 30일만 보관
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
};

// 스트릭 가져오기
export const getStreak = async () => {
  const val = await AsyncStorage.getItem(KEYS.STREAK);
  return val ? parseInt(val) : 0;
};

// 마지막 점수 가져오기
export const getLastScore = async () => {
  const val = await AsyncStorage.getItem(KEYS.LAST_SCORE);
  return val ? JSON.parse(val) : null;
};

// 히스토리 가져오기
export const getHistory = async () => {
  const val = await AsyncStorage.getItem(KEYS.HISTORY);
  return val ? JSON.parse(val) : [];
};
