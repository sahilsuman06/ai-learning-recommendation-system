import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Award, Calendar, BookOpen, BrainCircuit, Activity, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import API from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('user_name') || 'Student';
  const [stats, setStats] = useState({ average_score: 0, highest_score: 0, total_quizzes: 0 });
  const [history, setHistory] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch progress details
        const progressRes = await API.get('/progress');
        setStats(progressRes.data.stats);
        setHistory(progressRes.data.history);

        // Fetch recommendation
        try {
          const recRes = await API.get('/recommendation');
          setRecommendation(recRes.data);
        } catch (recErr) {
          // If 404 (no quizzes taken yet), recommendation stays null
          if (recErr.response?.status !== 404) {
            console.error('Failed to fetch recommendation', recErr);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Inline markdown renderer helper to format Gemini output beautifully
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h4 key={index} className="text-md font-bold text-white mt-4 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={index} className="text-lg font-bold text-white mt-5 mb-3 border-b border-slate-800 pb-1">
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h2 key={index} className="text-xl font-extrabold text-white mt-6 mb-4">
            {line.replace('# ', '')}
          </h2>
        );
      }
      // Lists
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const itemText = line.trim().substring(2);
        // Parse bold text inside list items
        return (
          <li key={index} className="text-slate-300 ml-6 list-disc mb-2 text-sm leading-relaxed">
            {parseBoldText(itemText)}
          </li>
        );
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      }
      // Paragraph with bold text parsing
      return (
        <p key={index} className="text-slate-300 text-sm leading-relaxed mb-3">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  const parseBoldText = (text) => {
    if (!text.includes('**')) return text;
    const parts = text.split('**');
    return parts.map((part, i) => 
      i % 2 === 1 ? (
        <strong key={i} className="text-emerald-400 font-semibold">{part}</strong>
      ) : (
        part
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-[calc(105vh-4rem)] bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          <span className="text-slate-400 text-sm">Loading learning analytics...</span>
        </div>
      </div>
    );
  }

  // Determine latest score
  const latestScore = history.length > 0 ? history[0].score : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Welcome Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 p-6 md:p-8 mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="h-4 w-4" />
                Personalized Learning Space
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Hello, {userName}!
              </h1>
              <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
                Track your study progress, take learning evaluation quizzes, and let your Gemini AI Coach tailor study paths to your learning level.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link
                to="/quiz"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all duration-300 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <BookOpen className="h-5 w-5" />
                <span>Take Quiz</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Latest Quiz Score */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Latest Quiz Score</p>
                <h3 className="text-3xl font-black text-white mt-2">
                  {latestScore !== null ? `${latestScore.toFixed(1)}%` : 'No Attempts'}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Award className="h-5 w-5" />
              </div>
            </div>
            {latestScore !== null && (
              <div className="mt-4">
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full" 
                    style={{ width: `${latestScore}%` }}
                  ></div>
                </div>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-3">
              {latestScore !== null ? 'Your most recent quiz performance' : 'Take a quiz to see your score'}
            </p>
          </div>

          {/* Progress Percentage */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Progress (Avg Score)</p>
                <h3 className="text-3xl font-black text-white mt-2">
                  {stats.total_quizzes > 0 ? `${stats.average_score.toFixed(1)}%` : '0.0%'}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            {stats.total_quizzes > 0 && (
              <div className="mt-4">
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div 
                    className="bg-teal-500 h-1.5 rounded-full" 
                    style={{ width: `${stats.average_score}%` }}
                  ></div>
                </div>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-3">
              Average score across all attempts
            </p>
          </div>

          {/* Highest Score */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Highest Score</p>
                <h3 className="text-3xl font-black text-white mt-2">
                  {stats.total_quizzes > 0 ? `${stats.highest_score.toFixed(1)}%` : '0.0%'}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <BrainCircuit className="h-5 w-5" />
              </div>
            </div>
            {stats.total_quizzes > 0 && (
              <div className="mt-4">
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div 
                    className="bg-purple-500 h-1.5 rounded-full" 
                    style={{ width: `${stats.highest_score}%` }}
                  ></div>
                </div>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-3">
              Total attempts: <strong className="text-slate-300">{stats.total_quizzes}</strong>
            </p>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Recommendation panel */}
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl relative">
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-5 mb-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AI Learning Coach Recommendation</h2>
                <p className="text-xs text-slate-400">Tailored learning material and next milestones from Gemini</p>
              </div>
            </div>

            {recommendation ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {renderMarkdown(recommendation.recommendation_text)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-14 w-14 rounded-2xl bg-slate-850 flex items-center justify-center text-slate-500 mb-4 border border-slate-800">
                  <BrainCircuit className="h-7 w-7 animate-pulse text-emerald-500" />
                </div>
                <h3 className="text-base font-bold text-white">No Learning Plan Generated</h3>
                <p className="text-slate-500 text-xs mt-2 max-w-sm">
                  Complete your first evaluation quiz, and the AI coach will generate a personalized roadmap for you.
                </p>
                <Link
                  to="/quiz"
                  className="mt-6 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer"
                >
                  Start First Quiz
                </Link>
              </div>
            )}
          </div>

          {/* Quiz History panel */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-400" />
              Quiz Performance History
            </h2>
            
            {history.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {history.map((attempt) => {
                  const dateStr = new Date(attempt.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div 
                      key={attempt.id} 
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 hover:border-slate-800 transition-all duration-200"
                    >
                      <div>
                        <p className="text-slate-400 text-xs">{dateStr}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">Attempt ID: #{attempt.id}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${
                          attempt.score < 40 
                            ? 'text-red-400' 
                            : attempt.score <= 70 
                              ? 'text-yellow-400' 
                              : 'text-emerald-400'
                        }`}>
                          {attempt.score.toFixed(1)}%
                        </span>
                        <p className="text-[10px] text-slate-500">
                          {attempt.score < 40 ? 'Beginner' : attempt.score <= 70 ? 'Intermediate' : 'Advanced'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-500 text-xs">No quizzes taken yet</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
