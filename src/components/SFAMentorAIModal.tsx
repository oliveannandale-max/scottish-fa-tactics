import React, { useState } from 'react';
import { LicenceTier, TacticalPhase, TeamUnit } from '../types/tactics';
import { 
  Sparkles, 
  X, 
  Bot, 
  Send, 
  CheckCircle2, 
  Brain, 
  Lightbulb, 
  BookOpen, 
  Award,
  Zap
} from 'lucide-react';

interface SFAMentorAIModalProps {
  licenceTier: LicenceTier;
  phase: TacticalPhase;
  focusedUnit: TeamUnit;
  primaryObjective: string;
  onClose: () => void;
  onApplyBridgedAlternative?: (solution: string) => void;
}

export const SFAMentorAIModal: React.FC<SFAMentorAIModalProps> = ({
  licenceTier,
  phase,
  focusedUnit,
  primaryObjective,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; action?: string }>>([
    {
      sender: 'ai',
      text: `Greetings Coach. I am your Scottish FA UEFA Technical Advisor. I am currently evaluating your ${licenceTier.replace('_', ' ')} setup focusing on the ${focusedUnit.replace('_', ' ')} in ${phase} phase. How can I assist you with session constraints, bridged alternatives, or UEFA criteria verification?`
    }
  ]);

  const handleAskAI = (promptText?: string) => {
    const question = promptText || query;
    if (!question.trim()) return;

    const userMsg = { sender: 'user' as const, text: question };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    setTimeout(() => {
      let aiResponse = '';
      if (question.toLowerCase().includes('bridged') || question.toLowerCase().includes('alternative')) {
        aiResponse = `Scottish FA Bridged Alternative for ${focusedUnit}: When the opponent's defensive midfielder steps up to block the central penetrative pass to your No. 6, coach the ball-carrier to disguise an outside-of-the-foot pass to the overlapping Inverted Full-Back (No. 3/2) who moves into the vacated half-space channel. This draws out the opposing wide winger and creates a 3rd-man direct vertical channel to the striker.`;
      } else if (question.toLowerCase().includes('constraint') || question.toLowerCase().includes('drill')) {
        aiResponse = `Recommended UEFA ${licenceTier.slice(-1)} Session Constraints:\n1. 3-Second Transition Counter-Press: The moment possession is turned over in the middle third, the nearest 3 players must press the ball within 3 seconds.\n2. Zone Locking: Center-backs cannot cross the defensive third line without releasing a forward pass into the half-space.\n3. Scoring Incentive: Bypassing the opponent's midfield line within 2 passes earns 2 points in the conditioned game.`;
      } else if (question.toLowerCase().includes('uefa') || question.toLowerCase().includes('licence') || question.toLowerCase().includes('criteria')) {
        aiResponse = `UEFA Assessment Checklist for ${licenceTier}:\n✓ Objective Clarity: "${primaryObjective}" matches unit requirements.\n✓ Scaffolding: Enforcing ${licenceTier === 'UEFA_C' ? '16 players and half-pitch' : 'Variable pitch zones & functional interactions'}.\n✓ Coaching Intervention: Ensure you use "Coaching in the Game" rather than freezing play constantly, to preserve natural game rhythm.`;
      } else {
        aiResponse = `Analysis of your current ${focusedUnit} configuration: Ensure that the distance between your defensive and midfield line does not exceed 12 meters in OOP. When transitioning to IP, demand immediate width from wingers to stretch the opponent's back four horizontally.`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Scottish FA AI Coaching Advisor & Assessor
              </h2>
              <p className="text-[11px] text-slate-400">
                Trained on UEFA Coaching Convention & SFA 4-Pillars Methodology
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 p-3 bg-slate-950/60 border-b border-slate-800 overflow-x-auto text-xs">
          <button
            onClick={() => handleAskAI('Auto-generate a Bridged Alternative for this unit')}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-sky-950 text-slate-300 hover:text-sky-300 border border-slate-700 hover:border-sky-500/50 shrink-0 transition-all flex items-center gap-1.5"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Suggest Bridged Alternative
          </button>

          <button
            onClick={() => handleAskAI('Recommend session constraints for this practice')}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-sky-950 text-slate-300 hover:text-sky-300 border border-slate-700 hover:border-sky-500/50 shrink-0 transition-all flex items-center gap-1.5"
          >
            <Brain className="w-3.5 h-3.5 text-emerald-400" />
            Session Constraints
          </button>

          <button
            onClick={() => handleAskAI('Evaluate setup against UEFA Licence Criteria')}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-sky-950 text-slate-300 hover:text-sky-300 border border-slate-700 hover:border-sky-500/50 shrink-0 transition-all flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-sky-400" />
            UEFA Criteria Check
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-sky-950 border border-sky-500/50 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-sky-400" />
                </div>
              )}
              <div
                className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
              <span>Analyzing tactical geometry and SFA coaching parameters...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
            placeholder="Ask SFA Advisor for coaching cues, constraints, or tactical interventions..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
          />
          <button
            onClick={() => handleAskAI()}
            className="p-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
