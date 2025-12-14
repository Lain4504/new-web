import { useEffect, useState, useRef } from 'react';
import { useParticipants, useLocalParticipant } from '@livekit/components-react';
import { ParticipantEvent } from 'livekit-client';

interface Toast {
    id: string;
    name: string;
    identity: string;
}

export function useHandRaiseNotifications() {
    const remoteParticipants = useParticipants();
    const { localParticipant } = useLocalParticipant();
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Use Ref to store previous metadata by participant identity
    // This persists across re-renders even if participant objects change
    const prevMetadataRef = useRef<Map<string, string>>(new Map());

    // Combine local and remote participants
    const allParticipants = localParticipant
        ? [localParticipant, ...remoteParticipants]
        : remoteParticipants;

    useEffect(() => {
        const handlers = new Map<string, () => void>();

        allParticipants.forEach((participant) => {
            const handleMetadataChanged = (metadata?: string) => {
                // Fallback if metadata argument is missing (sometimes event doesn't pass it immediately or correctly in some SDK versions)
                const currentMetadata = metadata || participant.metadata;

                if (!currentMetadata) return;

                try {
                    const meta = JSON.parse(currentMetadata);

                    // Get previous metadata from Ref
                    const prevMetaJson = prevMetadataRef.current.get(participant.identity) || '{}';
                    const prevMeta = JSON.parse(prevMetaJson);

                    console.log(`[HandRaise] ${participant.identity} - Current:`, meta, 'Prev:', prevMeta);

                    // Check if hand was just raised (changed from falsy to true)
                    // Also explicitly check it wasn't already true to avoid duplicates
                    if (meta.handRaised === true && prevMeta.handRaised !== true) {
                        console.log('[HandRaise] ✋ HAND RAISED BY:', participant.name);

                        const toastId = `${participant.identity}-${Date.now()}`;
                        setToasts(prev => {
                            // Avoid duplicate toasts for same event if React StrictMode fires twice
                            if (prev.some(t => t.identity === participant.identity && Date.now() - parseInt(t.id.split('-')[1]) < 1000)) {
                                return prev;
                            }
                            return [...prev, {
                                id: toastId,
                                name: participant.name || participant.identity,
                                identity: participant.identity,
                            }];
                        });

                        setTimeout(() => {
                            setToasts(prev => prev.filter(t => t.id !== toastId));
                        }, 4000);
                    }

                    // Update previous metadata in Ref
                    prevMetadataRef.current.set(participant.identity, currentMetadata);

                } catch (e) {
                    console.error('[HandRaise] Error:', e);
                }
            };

            handlers.set(participant.identity, handleMetadataChanged);

            // Listen to both metadata changes
            participant.on(ParticipantEvent.ParticipantMetadataChanged, handleMetadataChanged);

            // Also check on mount/update in case we missed an event or it's the initial state
            // (Optional: usually we only want notifications for *changes*, not initial state)
            // But we need to initialize the ref
            if (!prevMetadataRef.current.has(participant.identity) && participant.metadata) {
                prevMetadataRef.current.set(participant.identity, participant.metadata);
            }
        });

        return () => {
            handlers.forEach((handler, identity) => {
                const participant = allParticipants.find(p => p.identity === identity);
                if (participant) {
                    participant.off(ParticipantEvent.ParticipantMetadataChanged, handler);
                }
            });
        };
    }, [allParticipants, localParticipant, remoteParticipants]);

    return toasts;
}
