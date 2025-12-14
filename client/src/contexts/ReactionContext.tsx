import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface Reaction {
    emoji: string;
    id: number;
    left: number;
}

interface ReactionContextType {
    reactions: Reaction[];
    addReaction: (emoji: string) => void;
}

const ReactionContext = createContext<ReactionContextType | undefined>(undefined);

export function ReactionProvider({ children }: { children: ReactNode }) {
    const [reactions, setReactions] = useState<Reaction[]>([]);

    const addReaction = useCallback((emoji: string) => {
        const newReaction = {
            emoji,
            id: Date.now() + Math.random(), // Ensure unique ID
            left: Math.random() * 80 + 10,
        };

        setReactions(prev => [...prev, newReaction]);

        // Remove after 4 seconds
        setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== newReaction.id));
        }, 4000);
    }, []);

    return (
        <ReactionContext.Provider value={{ reactions, addReaction }}>
            {children}
        </ReactionContext.Provider>
    );
}

export function useReaction() {
    const context = useContext(ReactionContext);
    if (!context) {
        throw new Error('useReaction must be used within ReactionProvider');
    }
    return context;
}
