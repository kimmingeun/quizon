// 레벨 정의
export const LEVELS = [
  { level: 1, title: '입문자',    emoji: '📊', minXp: 0    },
  { level: 2, title: '주린이',    emoji: '📈', minXp: 200  },
  { level: 3, title: '개인투자자', emoji: '💹', minXp: 600  },
  { level: 4, title: '트레이더',  emoji: '🏦', minXp: 1200 },
  { level: 5, title: '펀드매니저', emoji: '💰', minXp: 2500 },
  { level: 6, title: '워런버핏',  emoji: '👑', minXp: 5000 },
];

// XP로 레벨 정보 반환
export const getLevelInfo = (xp) => {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
      break;
    }
  }
  const progress = next
    ? (xp - current.minXp) / (next.minXp - current.minXp)
    : 1;
  return { current, next, progress, xp };
};

// 퀴즈 결과로 획득 XP 계산
export const calcXP = (correct, total, streak, answers, questions) => {
  // 정답 1개당 10 XP
  let xp = correct * 10;

  // 연속 출석 20 XP
  xp += 20;

  // 7일 연속 보너스
  if (streak > 0 && streak % 7 === 0) xp += 50;

  // 콤보 보너스 (연속 정답)
  let combo = 0;
  let maxCombo = 0;
  for (let i = 0; i < questions.length; i++) {
    const isCorrect =
      questions[i].type === 'ox'
        ? answers[i] === questions[i].answer
        : answers[i] === questions[i].answer;
    if (isCorrect) {
      combo++;
      maxCombo = Math.max(maxCombo, combo);
    } else {
      combo = 0;
    }
  }
  if (maxCombo >= 10) xp += 30;
  else if (maxCombo >= 7) xp += 20;
  else if (maxCombo >= 5) xp += 10;
  else if (maxCombo >= 3) xp += 5;

  return xp;
};
