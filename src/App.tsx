import { useState } from 'react';
import { truthQuestions, dareQuestions, truthQuestionsAdvanced, dareQuestionsAdvanced } from './data/questions';
import { PlayerSetup } from './components/PlayerSetup';
import { Wheel } from './components/Wheel';

type GameMode = 'truth' | 'dare' | null;
type Level = 'normal' | 'advanced';
type Step = 'setup' | 'spin' | 'choice' | 'question';

// Simple SVG Icons
const TruthIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const DareIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

function App() {
  const [step, setStep] = useState<Step>('setup');
  const [gameType, setGameType] = useState<'wheel' | 'card'>('wheel');
  const [players, setPlayers] = useState<string[]>(['他', '她']);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);

  const [mode, setMode] = useState<GameMode>(null);
  const [level, setLevel] = useState<Level>('normal');
  const [question, setQuestion] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  const startWheel = () => {
    setGameType('wheel');
    setStep('spin');
  };

  const startQuickMode = () => {
    setGameType('card');
    setStep('choice');
    setCurrentPlayer(null);
  };

  const handleSpinEnd = (winner: string) => {
    setCurrentPlayer(winner);
    setTimeout(() => {
      setStep('choice');
    }, 1000);
  };

  // Track used questions to prevent repeats
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());

  const getQuestion = (type: 'truth' | 'dare') => {
    let questions;
    if (level === 'advanced') {
      questions = type === 'truth' ? truthQuestionsAdvanced : dareQuestionsAdvanced;
    } else {
      questions = type === 'truth' ? truthQuestions : dareQuestions;
    }

    // Filter out used questions
    const availableQuestions = questions.filter(q => !usedQuestions.has(q));

    // If all questions used, reset for this specific pool (effectively allowing repeats after exhaustion)
    // Or we could just clear the whole set? Let's just use the full pool if available is empty
    let pool = availableQuestions;
    if (availableQuestions.length === 0) {
      pool = questions;
      // We might want to remove these from usedQuestions so they can be picked again
      // But doing that selectively is hard with a single Set. 
      // Simplest strategy: if pool is empty, just pick from original and strictly speaking we are repeating now.
      // User asked "before refresh", implying until exhaustion. 
      // TO strictly follow "no repeat", we must allow picking from full list again only when exhausted.
    }

    const randomQuestion = pool[Math.floor(Math.random() * pool.length)];

    // Add to used set
    setUsedQuestions(prev => {
      const newSet = new Set(prev);
      newSet.add(randomQuestion);
      // Optimization: if set gets too big, maybe clear it? 
      // For now, browser memory can handle a few hundred strings easily.
      return newSet;
    });

    return randomQuestion;
  };

  const handleSelect = (selectedMode: 'truth' | 'dare') => {
    setMode(selectedMode);
    setQuestion(getQuestion(selectedMode));
    setStep('question');
    setKey(prev => prev + 1);
  };

  const handleNextTurn = () => {
    if (gameType === 'card' && mode) {
      setQuestion(getQuestion(mode));
      setKey(prev => prev + 1);
    } else {
      setStep('spin');
      setMode(null);
      setQuestion(null);
      setCurrentPlayer(null);
    }
  };

  const handleReset = () => {
    setStep('setup');
    setCurrentPlayer(null);
    setMode(null);
  };

  return (
    <div className={`app-wrapper ${level}`} style={{ position: 'relative' }}>
      {step !== 'setup' && (
        <button
          className="exit-btn"
          onClick={handleReset}
          aria-label="退出游戏"
        >
          ✕
        </button>
      )}
      <div className={`container ${step}`}>
        {/* Header is always visible unless in specific sub-states if needed, but let's keep it */}
        <div className="title-section">
          <h1 className="main-title">
            真心话 <span className="title-or">or</span> 大冒险
          </h1>
          {step === 'setup' && <div className="subtitle">选择游戏模式</div>}
          {step === 'spin' && <div className="subtitle">命运之轮转动中...</div>}
          {step === 'choice' && (
            <div className="subtitle">
              {gameType === 'wheel' ? <b>{currentPlayer} 的选择</b> : '选择挑战类型'}
            </div>
          )}
        </div>

        {/* Global Level Toggle (Only visible in setup or spin/choice to change difficulty mid-game) */}
        {step !== 'question' && (
          <div className="level-toggle-container">
            <button
              className={`level-btn ${level === 'normal' ? 'active' : ''}`}
              onClick={() => setLevel('normal')}
            >
              经典模式
            </button>
            <button
              className={`level-btn ${level === 'advanced' ? 'active' : ''}`}
              onClick={() => setLevel('advanced')}
            >
              情侣模式
            </button>
          </div>
        )}

        {step === 'setup' && (
          <>
            <PlayerSetup
              players={players}
              setPlayers={setPlayers}
              onStart={startWheel}
            />

            <div className="divider">
              <span>或者</span>
            </div>

            <button className="quick-mode-btn" onClick={startQuickMode}>
              题库模式
            </button>
          </>
        )}

        {step === 'spin' && (
          <Wheel players={players} onSpinEnd={handleSpinEnd} />
        )}

        {step === 'choice' && (
          <div className="choices">
            <button
              className="choice-btn truth"
              onClick={() => handleSelect('truth')}
            >
              <div className="choice-icon"><TruthIcon /></div>
              真心话
            </button>
            <button
              className="choice-btn dare"
              onClick={() => handleSelect('dare')}
            >
              <div className="choice-icon"><DareIcon /></div>
              大冒险
            </button>
          </div>
        )}

        {step === 'question' && (
          <div className="question-card-wrapper">
            <div key={key} className="question-card">
              {currentPlayer && <div className="glass-pill">{currentPlayer} 的回合</div>}
              <div className={`type-label ${mode === 'truth' ? 'type-truth' : 'type-dare'}`}>
                {level === 'advanced' && <span className="mode-badge">情侣</span>}
                {mode === 'truth' ? 'Truth · 真心话' : 'Dare · 大冒险'}
              </div>

              <div className="question-text">
                {question}
              </div>

              <div className="controls">
                <button
                  className="action-btn btn-secondary"
                  onClick={gameType === 'card' ? () => {
                    setStep('choice');
                    setMode(null);
                    setQuestion(null);
                  } : handleReset}
                >
                  {gameType === 'card' ? '返回' : '结束游戏'}
                </button>
                <button className="action-btn btn-primary" onClick={handleNextTurn}>
                  下一题
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
