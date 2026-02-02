'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Clock, Award, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useGetVideoQuizQuery, useSubmitQuizAttemptMutation, VideoQuiz, QuizQuestion } from '@/store/api/courseApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

interface VideoQuizProps {
  courseId: string;
  videoId: string;
  onComplete?: (passed: boolean) => void;
}

export default function VideoQuizComponent({ courseId, videoId, onComplete }: VideoQuizProps) {
  const dispatch = useAppDispatch();
  const { data: quizData, isLoading, refetch } = useGetVideoQuizQuery({ courseId, videoId });
  const [submitQuiz, { isLoading: submitting }] = useSubmitQuizAttemptMutation();

  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const quiz = quizData?.quiz;
  const bestScore = quizData?.bestScore || 0;



  const handleStartQuiz = () => {
    setShowQuiz(true);
    setStartTime(new Date());
    setAnswers({});
    setTimeSpent(0);
    setShowResults(false);
    setResults(null);
  };

  const handleAnswerChange = (questionIndex: number, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmit = useCallback(async () => {
    if (!quiz) return;

    // Check if all questions answered
    const unanswered = quiz.questions.filter((_, index) => answers[index] === undefined);
    if (unanswered.length > 0) {
      dispatch(
        addToast({
          type: 'warning',
          message: `Please answer all questions. ${unanswered.length} question(s) remaining.`,
        })
      );
      return;
    }

    try {
      const answerArray = quiz.questions.map((_, index) => answers[index] || '');
      const finalTimeSpent = timeSpent || Math.floor((Date.now() - (startTime?.getTime() || Date.now())) / 1000);

      const result = await submitQuiz({
        courseId,
        videoId,
        answers: answerArray,
        timeSpent: finalTimeSpent,
      }).unwrap();

      setResults(result);
      setShowResults(true);
      if (onComplete) {
        onComplete(result.attempt.passed);
      }

      dispatch(
        addToast({
          type: result.attempt.passed ? 'success' : 'info',
          message: result.message,
        })
      );
    } catch (error: any) {
      dispatch(
        addToast({
          type: 'error',
          message: error?.data?.message || 'Failed to submit quiz',
        })
      );
    }
  }, [quiz, answers, timeSpent, startTime, courseId, videoId, submitQuiz, dispatch, onComplete]);

  // Timer
  useEffect(() => {
    if (showQuiz && !showResults && startTime && quiz?.timeLimit && quiz.timeLimit > 0) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setTimeSpent(elapsed);

        // Check if time limit exceeded
        if (elapsed >= quiz.timeLimit * 60) {
          handleSubmit();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showQuiz, showResults, startTime, quiz, handleSubmit]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6 text-center text-muted-foreground text-sm sm:text-base">Loading quiz...</CardContent>
      </Card>
    );
  }

  if (!quiz) {
    return null;
  }

  const remainingTime = quiz.timeLimit > 0 && startTime
    ? Math.max(0, quiz.timeLimit * 60 - timeSpent)
    : null;

  return (
    <>
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-0">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Award className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            Video Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-4">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">{quiz.title}</h3>
              {quiz.description && (
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{quiz.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-muted-foreground">Questions</p>
                <p className="font-semibold text-foreground">{quiz.questions.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Passing Score</p>
                <p className="font-semibold text-foreground">{quiz.passingScore}%</p>
              </div>
              {quiz.timeLimit > 0 && (
                <div>
                  <p className="text-muted-foreground">Time Limit</p>
                  <p className="font-semibold text-foreground">{quiz.timeLimit} min</p>
                </div>
              )}
              {bestScore > 0 && (
                <div>
                  <p className="text-muted-foreground">Best Score</p>
                  <p className="font-semibold text-foreground">{bestScore.toFixed(1)}%</p>
                </div>
              )}
            </div>

            {quiz.isRequired && (
              <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600 shrink-0" />
                <p className="text-xs sm:text-sm text-yellow-600">This quiz is required to continue</p>
              </div>
            )}

            {!quiz.allowRetake && bestScore >= quiz.passingScore && (
              <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                <p className="text-xs sm:text-sm text-green-600">You have already passed this quiz</p>
              </div>
            )}

            <Button onClick={handleStartQuiz} className="w-full text-sm sm:text-base" disabled={!quiz.allowRetake && bestScore >= quiz.passingScore}>
              {bestScore > 0 ? 'Retake Quiz' : 'Start Quiz'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Modal */}
      <Modal
        isOpen={showQuiz && !showResults}
        onClose={() => {
          if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
            setShowQuiz(false);
          }
        }}
        title={quiz.title}
        size="lg"
      >
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {remainingTime !== null && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-foreground">Time Remaining</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-primary sm:text-right">
                {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}

          <div className="space-y-4 sm:space-y-6 max-h-[55vh] sm:max-h-[60vh] overflow-y-auto -mx-1 px-1">
            {quiz.questions.map((question, index) => (
              <div key={index} className="space-y-2 sm:space-y-3">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-foreground text-sm sm:text-base shrink-0">{index + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground mb-1 sm:mb-2 text-sm sm:text-base break-words">{question.question}</p>
                    {question.points > 0 && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{question.points} point(s)</p>
                    )}

                    {question.type === 'multiple-choice' && question.options && (
                      <div className="space-y-1.5 sm:space-y-2 mt-2 sm:mt-3">
                        {question.options.map((option, optIndex) => (
                          <label
                            key={optIndex}
                            className="flex items-start gap-3 p-2.5 sm:p-3 rounded-lg border border-border bg-card hover:bg-accent/20 cursor-pointer min-h-[44px] text-left"
                          >
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={optIndex}
                              checked={answers[index] === optIndex}
                              onChange={() => handleAnswerChange(index, optIndex)}
                              className="h-4 w-4 shrink-0 text-primary mt-0.5"
                            />
                            <span className="text-xs sm:text-sm text-foreground break-words">{option.text}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'true-false' && question.options && (
                      <div className="space-y-1.5 sm:space-y-2 mt-2 sm:mt-3">
                        {question.options.map((option, optIndex) => (
                          <label
                            key={optIndex}
                            className="flex items-start gap-3 p-2.5 sm:p-3 rounded-lg border border-border bg-card hover:bg-accent/20 cursor-pointer min-h-[44px] text-left"
                          >
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={optIndex}
                              checked={answers[index] === optIndex}
                              onChange={() => handleAnswerChange(index, optIndex)}
                              className="h-4 w-4 shrink-0 text-primary mt-0.5"
                            />
                            <span className="text-xs sm:text-sm text-foreground break-words">{option.text}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'short-answer' && (
                      <input
                        type="text"
                        value={answers[index] || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        placeholder="Enter your answer"
                        className="w-full mt-2 sm:mt-3 rounded-lg border border-border bg-card px-3 sm:px-4 py-2 min-h-[44px] text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowQuiz(false)} className="flex-1 w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1 w-full sm:w-auto">
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Results Modal */}
      <Modal
        isOpen={showResults}
        onClose={() => {
          setShowResults(false);
          setShowQuiz(false);
          refetch();
        }}
        title="Quiz Results"
        size="lg"
      >
        {results && (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className={`p-3 sm:p-4 rounded-lg text-center ${results.attempt.passed
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20'
              }`}>
              <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                {results.attempt.passed ? (
                  <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 shrink-0" />
                )}
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {results.attempt.passed ? 'Congratulations!' : 'Try Again'}
                </h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                Score: {results.attempt.percentage.toFixed(1)}%
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {results.attempt.score} out of {results.questions.length} points
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto">
              {results.questions.map((result: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 sm:p-4 rounded-lg border ${result.isCorrect
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                    }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {result.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground break-words">{result.question}</p>
                      <p className="text-sm text-muted-foreground mt-1 break-words">
                        Your answer: {typeof result.userAnswer === 'number'
                          ? (result.type === 'multiple-choice' || result.type === 'true-false'
                            ? `Option ${result.userAnswer + 1}`
                            : result.userAnswer)
                          : result.userAnswer}
                      </p>
                      {!result.isCorrect && (
                        <p className="text-sm text-green-600 mt-1 break-words">
                          Correct answer: {typeof result.correctAnswer === 'number'
                            ? `Option ${result.correctAnswer + 1}`
                            : result.correctAnswer}
                        </p>
                      )}
                      {result.explanation && (
                        <p className="text-sm text-muted-foreground mt-2 italic break-words">
                          {result.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => {
                setShowResults(false);
                setShowQuiz(false);
                refetch();
              }}
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}


