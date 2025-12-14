import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';

export interface PollOption {
    text: string;
    votes: number;
}

export interface Poll {
    id: string;
    question: string;
    options: PollOption[];
    isActive: boolean;
    totalVotes: number;
}

interface PollsContextType {
    polls: Poll[];
    activePoll: Poll | null;
    createPoll: (question: string, options: string[]) => Promise<void>;
    votePoll: (pollId: string, optionIndex: number) => Promise<void>;
    endPoll: (pollId: string) => Promise<void>;
    hasVoted: (pollId: string) => boolean;
}

const PollsContext = createContext<PollsContextType | undefined>(undefined);

export function PollsProvider({ children }: { children: ReactNode }) {
    const room = useRoomContext();
    const [polls, setPolls] = useState<Poll[]>([]);
    const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());

    const activePoll = polls.find(p => p.isActive) || null;

    const createPoll = async (question: string, options: string[]) => {
        const newPoll: Poll = {
            id: Date.now().toString(),
            question,
            options: options.map(text => ({ text, votes: 0 })),
            isActive: true,
            totalVotes: 0,
        };

        const payload = JSON.stringify({ type: 'POLL_CREATE', poll: newPoll });
        const encoder = new TextEncoder();
        await room.localParticipant.publishData(encoder.encode(payload), {
            reliable: true,
            topic: 'polls'
        });

        setPolls(prev => [...prev, newPoll]);
    };

    const votePoll = async (pollId: string, optionIndex: number) => {
        if (votedPolls.has(pollId)) return;

        const payload = JSON.stringify({ type: 'POLL_VOTE', pollId, optionIndex });
        const encoder = new TextEncoder();
        await room.localParticipant.publishData(encoder.encode(payload), {
            reliable: true,
            topic: 'polls'
        });

        setVotedPolls(prev => new Set(prev).add(pollId));

        // Update local state immediately logic if desired, or wait for echo
        setPolls(prev => prev.map(p => {
            if (p.id !== pollId) return p;
            const newOptions = [...p.options];
            newOptions[optionIndex].votes++;
            return { ...p, options: newOptions, totalVotes: p.totalVotes + 1 };
        }));
    };

    const endPoll = async (pollId: string) => {
        const payload = JSON.stringify({ type: 'POLL_END', pollId });
        const encoder = new TextEncoder();
        await room.localParticipant.publishData(encoder.encode(payload), {
            reliable: true,
            topic: 'polls'
        });

        setPolls(prev => prev.map(p => p.id === pollId ? { ...p, isActive: false } : p));
    };

    const hasVoted = (pollId: string) => votedPolls.has(pollId);

    useEffect(() => {
        const handleData = (payload: Uint8Array, _participant: any, _kind: any, topic?: string) => {
            if (topic !== 'polls') return; // Only process poll messages

            const decoder = new TextDecoder();
            const str = decoder.decode(payload);
            try {
                const data = JSON.parse(str);

                if (data.type === 'POLL_CREATE') {
                    setPolls(prev => {
                        if (prev.some(p => p.id === data.poll.id)) return prev;
                        return [...prev, data.poll];
                    });
                }
                else if (data.type === 'POLL_VOTE') {
                    setPolls(prev => prev.map(p => {
                        if (p.id !== data.pollId) return p;
                        const newOptions = [...p.options];
                        newOptions[data.optionIndex].votes++;
                        return { ...p, options: newOptions, totalVotes: p.totalVotes + 1 };
                    }));
                }
                else if (data.type === 'POLL_END') {
                    setPolls(prev => prev.map(p => p.id === data.pollId ? { ...p, isActive: false } : p));
                }

            } catch (e) {
                console.error('Error parsing poll data:', e);
            }
        };

        room.on(RoomEvent.DataReceived, handleData);
        return () => {
            room.off(RoomEvent.DataReceived, handleData);
        };
    }, [room]);

    return (
        <PollsContext.Provider value={{ polls, activePoll, createPoll, votePoll, endPoll, hasVoted }}>
            {children}
        </PollsContext.Provider>
    );
}

export function usePolls() {
    const context = useContext(PollsContext);
    if (!context) {
        throw new Error('usePolls must be used within PollsProvider');
    }
    return context;
}
