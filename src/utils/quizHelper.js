import allQuestions from '../data/questions.json';

// 오늘 날짜 기준으로 10문제 랜덤 선택 (매일 다른 문제)
export const getTodayQuestions = () => {
  const today = new Date().toDateString();
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed += today.charCodeAt(i);
  }

  const shuffled = [...allQuestions].sort((a, b) => {
    const hashA = (a.id * seed) % 97;
    const hashB = (b.id * seed) % 97;
    return hashA - hashB;
  });

  return shuffled.slice(0, Math.min(10, shuffled.length));
};

// 정답 확인
export const checkAnswer = (question, userAnswer) => {
  return question.answer === userAnswer;
};

// 점수 계산
export const calculateScore = (questions, answers) => {
  let correct = 0;
  questions.forEach((q, index) => {
    if (checkAnswer(q, answers[index])) correct++;
  });
  return { correct, total: questions.length };
};
