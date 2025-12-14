import  { useState } from 'react';
import { usePolls } from '../contexts/PollsContext';
import { Plus, Trash2, BarChart2 } from 'lucide-react';

export function Polls() {
    const { activePoll, createPoll, votePoll, endPoll, hasVoted } = usePolls();
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [isCreating, setIsCreating] = useState(false);

    // If there is an active poll, show it regardless of creation mode
    if (activePoll) {
        return (
            <div className="flex flex-col h-full bg-white p-4">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-800 m-0">{activePoll.question}</h3>
                        {/* Allowing anyone to end poll for simplicity, ideally only creator */}
                        <button
                            onClick={() => endPoll(activePoll.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50"
                        >
                            End Poll
                        </button>
                    </div>

                    <div className="space-y-3">
                        {activePoll.options.map((option, index) => {
                            const percentage = activePoll.totalVotes > 0
                                ? Math.round((option.votes / activePoll.totalVotes) * 100)
                                : 0;
                            const voted = hasVoted(activePoll.id);

                            return (
                                <div key={index} className="relative">
                                    <button
                                        onClick={() => !voted && votePoll(activePoll.id, index)}
                                        disabled={voted}
                                        className={`w-full text-left p-3 rounded-md border transition-all relative overflow-hidden ${voted
                                                ? 'border-gray-200 bg-gray-50 cursor-default'
                                                : 'border-blue-200 bg-white hover:border-blue-400 hover:shadow-sm'
                                            }`}
                                    >
                                        {/* Progress Bar Background */}
                                        <div
                                            className="absolute left-0 top-0 bottom-0 bg-blue-100 opacity-50 transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />

                                        <div className="relative z-10 flex justify-between items-center">
                                            <span className="font-medium text-gray-700">{option.text}</span>
                                            {voted && (
                                                <span className="text-sm text-gray-500 font-semibold">{percentage}% ({option.votes})</span>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 text-xs text-gray-500 text-center">
                        Total votes: {activePoll.totalVotes}
                    </div>
                </div>
            </div>
        );
    }

    // Create Poll View
    if (isCreating) {
        const handleAddOption = () => setOptions([...options, '']);
        const handleOptionChange = (idx: number, val: string) => {
            const newOpts = [...options];
            newOpts[idx] = val;
            setOptions(newOpts);
        };
        const handleRemoveOption = (idx: number) => {
            setOptions(options.filter((_, i) => i !== idx));
        };

        const handleCreate = async () => {
            if (!question.trim() || options.some(o => !o.trim())) return;
            await createPoll(question, options);
            setIsCreating(false);
            setQuestion('');
            setOptions(['', '']);
        };

        return (
            <div className="flex flex-col h-full bg-white p-4 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Create a Poll</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                        <textarea
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder="Ask a question..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                        <div className="space-y-2">
                            {options.map((opt, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={e => handleOptionChange(idx, e.target.value)}
                                        placeholder={`Option ${idx + 1}`}
                                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    {options.length > 2 && (
                                        <button
                                            onClick={() => handleRemoveOption(idx)}
                                            className="text-gray-400 hover:text-red-500 p-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {options.length < 5 && (
                            <button
                                onClick={handleAddOption}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                            >
                                <Plus size={16} /> Add Option
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={!question.trim() || options.some(o => !o.trim())}
                            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            Launch Poll
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Initial View
    return (
        <div className="flex flex-col h-full bg-white items-center justify-center p-6 text-center">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
                <BarChart2 size={48} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Polls</h3>
            <p className="text-gray-500 mb-6">Create polls to gather feedback and opinions from participants.</p>
            <button
                onClick={() => setIsCreating(true)}
                className="py-2.5 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm transition-colors"
            >
                Start a Poll
            </button>
        </div>
    );
}
