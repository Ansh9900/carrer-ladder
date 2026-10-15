import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AssessmentInfo, AssessmentSubmissionResult } from '../../types';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface AssessmentModuleProps {
  initialSkillId?: string;
  onCompleted?: () => void;
}

export const AssessmentModule: React.FC<AssessmentModuleProps> = ({ initialSkillId, onCompleted }) => {
  const [assessments, setAssessments] = useState<AssessmentInfo[]>([]);
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<any | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentSubmissionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.getAssessments();
        setAssessments(res.assessments);

        if (initialSkillId) {
          const match = res.assessments.find(a => a.skillId === initialSkillId || a.id === initialSkillId);
          if (match) {
            handleStartAssessment(match.id);
          }
        }
      } catch (e) {
        console.error('Failed to load assessments:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [initialSkillId]);

  // Countdown timer
  useEffect(() => {
    if (!activeAssessment || result || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeAssessment, result, timeLeft]);

  const handleStartAssessment = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.getAssessmentDetails(id);
      setActiveAssessment(res.assessment);
      setActiveAssessmentId(id);
      setSelectedAnswers({});
      setCurrentQuestionIndex(0);
      setResult(null);
      setTimeLeft((res.assessment.durationMinutes || 10) * 60);
    } catch (e) {
      console.error('Failed to start assessment:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitTest = async () => {
    if (!activeAssessmentId) return;
    setIsSubmitting(true);
    try {
      const res = await api.submitAssessment(activeAssessmentId, selectedAnswers);
      setResult(res);
      if (onCompleted) onCompleted();
    } catch (e) {
      console.error('Failed to submit test:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="text-xs text-indigo-400 font-medium">
          <span>Objective Verification Test Suite</span>
          <span className="mx-2">·</span>
          <span>Adaptive Technical Questions</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
          Skill Assessments & Verification
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Validate your technical competency through standardized assessments to earn verified badges visible to hiring recruiters.
        </p>
      </div>

      {/* If taking an active test */}
      {activeAssessment && !result && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Test Header */}
          <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
                {activeAssessment.category} Assessment
              </span>
              <h2 className="text-base font-bold text-white">{activeAssessment.skillName} Technical Exam</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 bg-slate-900 rounded-lg border border-slate-800 text-slate-200">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="font-bold tabular-nums">{formatTimer(timeLeft)}</span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Leave assessment? Your progress will be discarded.')) {
                    setActiveAssessment(null);
                  }
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Exit
              </button>
            </div>
          </div>

          {/* Test Body */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Progress counter */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Question {currentQuestionIndex + 1} of {activeAssessment.questions.length}
              </span>
              <span>
                Passing Threshold: {activeAssessment.passingScore}%
              </span>
            </div>

            {/* Active Question */}
            {activeAssessment.questions[currentQuestionIndex] && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white leading-relaxed">
                  {activeAssessment.questions[currentQuestionIndex].question}
                </h3>

                <div className="space-y-2.5 pt-2">
                  {activeAssessment.questions[currentQuestionIndex].options.map((opt: string, optIdx: number) => {
                    const qId = activeAssessment.questions[currentQuestionIndex].id;
                    const isSelected = selectedAnswers[qId] === optIdx;

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(qId, optIdx)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs font-mono ${
                          isSelected ? 'border-indigo-400 bg-indigo-600 text-white font-bold' : 'border-slate-700 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span className="text-xs leading-relaxed">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <button
                onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
              >
                Previous Question
              </button>

              {currentQuestionIndex < activeAssessment.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(i => i + 1)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleSubmitTest}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md transition-colors"
                >
                  {isSubmitting ? 'Evaluating Submission...' : 'Submit Assessment'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Result Card when test completed */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              {result.passed ? (
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <span className="text-xs text-slate-400">Assessment Result</span>
                <h2 className="text-xl font-bold text-white">
                  {result.passed ? 'Verified Competency Attained!' : 'Verification Threshold Missed'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  {result.score}%
                </span>
                <div className="text-[11px] text-slate-400">
                  Passing: {result.passingScore}% ({result.correctCount}/{result.totalQuestions} correct)
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveAssessment(null);
                  setResult(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              >
                Back to Tests
              </button>
            </div>
          </div>

          {result.passed ? (
            <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-xs text-emerald-300 space-y-1">
              <strong>Verified Badge Granted:</strong> Your student skill inventory has been automatically upgraded to <em>Verified</em> status at {result.score >= 85 ? 'Advanced' : 'Intermediate'} level. Employers in the recruitment pipeline now see verified authenticity.
            </div>
          ) : (
            <div className="p-4 bg-rose-950/30 border border-rose-900/50 rounded-xl text-xs text-rose-300 space-y-1">
              <strong>Keep Going:</strong> You achieved {result.score}%, just short of the {result.passingScore}% verification cutoff. Review the question explanations below and consult the personalized roadmap to reinforce key areas before retesting.
            </div>
          )}

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">Question Breakdown & Explanations</h3>

            <div className="space-y-3">
              {result.feedback.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border ${
                    item.isCorrect
                      ? 'bg-emerald-950/10 border-emerald-900/30'
                      : 'bg-rose-950/10 border-rose-900/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {idx + 1}. {item.question}
                    </span>
                    {item.isCorrect ? (
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 shrink-0 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-rose-400 flex items-center gap-1 shrink-0 font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                    <strong>Technical Explanation:</strong> {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List of Available Assessments */}
      {!activeAssessment && !result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Available Skill Certifications</h3>
            <span className="text-xs text-slate-400">
              {assessments.length} Standardized Technical Evaluations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {assessments.map(asm => (
              <div
                key={asm.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {asm.category}
                  </span>
                  <h4 className="text-base font-bold text-white mb-2">{asm.skillName}</h4>
                  <div className="space-y-1 text-xs text-slate-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{asm.durationMinutes} Minutes Time Limit</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span>{asm.questionCount} Objective Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span>{asm.passingScore}% Passing Threshold</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleStartAssessment(asm.id)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>Start Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Disclaimer per prompt guidelines */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              <strong>Scientific Disclaimer:</strong> Skill assessments provide an objective indicator of conceptual fluency and algorithmic problem-solving under timed constraints. They are designed to complement—not replace—verifiable project repositories and technical interviews.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
