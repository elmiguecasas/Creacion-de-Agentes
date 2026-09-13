export function level(score) {
  return score >= 75 ? 'Dominado' : score >= 50 ? 'En progreso' : 'Inicial';
}

// Identical deterministic calculation in browser and server. Server is authoritative.
export function scoreQuiz(quiz, answers) {
  if (quiz.questions.length !== 5 || !Array.isArray(answers) || answers.length !== 5 ||
      answers.some(a => !Number.isInteger(a) || a < 0 || a > 3)) {
    throw new Error('Se requieren cinco respuestas con índices de 0 a 3.');
  }
  const results = quiz.questions.map((q, i) => ({
    question_id: q.question_id,
    answer: answers[i],
    correct_option: q.correct_option,
    correct: answers[i] === q.correct_option
  }));
  const correct_count = results.filter(r => r.correct).length;
  return { score: Math.round(correct_count / 5 * 100), correct_count, results };
}
