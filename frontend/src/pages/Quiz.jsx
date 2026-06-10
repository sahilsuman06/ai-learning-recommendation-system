import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, ChevronLeft, Send, Sparkles, CheckCircle2, Award, ArrowRight, BrainCircuit } from 'lucide-react';
import API from '../services/api';

const QUESTIONS = [
  {
    id: 1,
    question: "What is the average time complexity of looking up a value in a Hash Map?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correct: 0
  },
  {
    id: 2,
    question: "Which data structure operates on a Last In, First Out (LIFO) basis?",
    options: ["Queue", "Stack", "Binary Search Tree", "Linked List"],
    correct: 1
  },
  {
    id: 3,
    question: "What is recursion in computer science?",
    options: [
      "A loops that iterates a set number of times",
      "An encryption algorithm for local storage",
      "A programming technique where a function calls itself",
      "A database indexing system"
    ],
    correct: 2
  },
  {
    id: 4,
    question: "In Python, which list method adds an element to the end of a list?",
    options: [".add()", ".insert()", ".push()", ".append()"],
    correct: 3
  },
  {
    id: 5,
    question: "What does the abbreviation API stand for?",
    options: [
      "Application Programming Interface",
      "Algorithmic Protocol Integration",
      "Auto Process Installer",
      "Advanced Program Instruction"
    ],
    correct: 0
  },
  {
    id: 6,
    question: "Which internet protocol is designed to transmit encrypted, secure web traffic?",
    options: ["FTP", "HTTP", "HTTPS", "SMTP"],
    correct: 2
  },
  {
    id: 7,
    question: "In Python, what is the output of the statement: print(10 // 3)?",
    options: ["3.333...", "3", "1", "0"],
    correct: 1
  },
  {
    id: 8,
    question: "Which of the following is a non-relational (NoSQL) database engine?",
    options: ["PostgreSQL", "SQLite", "MongoDB", "MySQL"],
    correct: 2
  },
  {
    id: 9,
    question: "What does JWT stand for in security authentication?",
    options: [
      "Java Web Technology",
      "JSON Web Token",
      "Joint Work Team",
      "JavaScript Wire Transfer"
    ],
    correct: 1
  },
  {
    id: 10,
    question: "In modern JavaScript, how is a block-scoped local variable declared?",
    options: ["var", "define", "global", "let"],
    correct: 3
  }
];

const Quiz = () => {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSelectOption = (optIdx) => {
    const updated = [...answers];
    updated[currentIdx] = optIdx;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate that all questions are answered
    if (answers.includes(null)) {
      alert("Please answer all questions before submitting!");
      return;
    }

    setSubmitting(true);

    // Calculate score
    let correctCount = 0;
    QUESTIONS.forEach((q, idx) => {
      if (answers[idx] === q.correct) {
        correctCount += 1;
      }
    });
    
    const score = (correctCount / QUESTIONS.length) * 100;

    try {
      const response = await API.post('/quiz/submit', { score });
      setResult(response.data);
    } catch (err) {
      console.error("Failed to submit quiz score", err);
      alert("Error submitting score. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Render question selection progress
  const progressPercent = ((answers.filter(a => a !== null).length) / QUESTIONS.length) * 100;

  if (result) {
    const score = result.quiz_result.score;
    const category = score < 40 ? 'Beginner' : score <= 70 ? 'Intermediate' : 'Advanced';
    
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
        {/* Glow BG */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-xl bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl text-center relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight">Quiz Submitted!</h1>
          <p className="text-slate-400 mt-2 text-sm">Your learning level has been calculated.</p>

          <div className="my-8 py-6 px-4 bg-slate-950/60 rounded-2xl border border-slate-850 grid grid-cols-2 gap-4">
            <div className="text-center border-r border-slate-800">
              <span className="block text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Your Score</span>
              <span className="block text-3xl font-black text-emerald-400 mt-1">{score.toFixed(1)}%</span>
            </div>
            <div className="text-center">
              <span className="block text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Assigned Level</span>
              <span className="block text-3xl font-black text-teal-400 mt-1">{category}</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg cursor-pointer"
            >
              <Sparkles className="h-5 w-5" />
              <span>View AI Recommendations</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/tutor')}
              className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            >
              <BrainCircuit className="h-5 w-5" />
              <span>Discuss Topics with AI Tutor</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = QUESTIONS[currentIdx];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <div className="max-w-3xl mx-auto px-4 pt-12">
        
        {/* Header progress */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Quiz Evaluation
            </span>
            <h1 className="text-xl font-bold text-white mt-1">Programming Fundamentals</h1>
          </div>
          <span className="text-slate-500 text-sm font-semibold">
            Question {currentIdx + 1} of {QUESTIONS.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2.5 mb-8 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative mb-6">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-40 h-40 rounded-full bg-emerald-500/5 blur-[50px] pointer-events-none"></div>
          
          <h2 className="text-lg md:text-xl font-bold text-white mb-6 leading-relaxed relative z-10">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="space-y-4">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = answers[currentIdx] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 cursor-pointer text-sm font-medium ${
                    isSelected 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/5' 
                      : 'bg-slate-950/40 border-slate-850 text-slate-300 hover:border-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all duration-200 ${
                      isSelected 
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                        : 'border-slate-800 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-850 hover:border-slate-800 hover:text-white transition-all text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-sm font-semibold"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {currentIdx === QUESTIONS.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || answers.includes(null)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl font-bold transition-all shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={answers[currentIdx] === null}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-750 text-white rounded-xl font-semibold transition-all border border-slate-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Quiz;
