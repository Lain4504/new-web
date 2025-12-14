import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRoomContext } from '@livekit/components-react';

interface RecordingContextType {
    isRecording: boolean;
    egressId: string | null;
    recordingStartTime: Date | null;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<void>;
    isLoading: boolean;
}

const RecordingContext = createContext<RecordingContextType | undefined>(undefined);

const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export function RecordingProvider({ children }: { children: ReactNode }) {
    const room = useRoomContext();
    const [isRecording, setIsRecording] = useState(false);
    const [egressId, setEgressId] = useState<string | null>(null);
    const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Check recording status on mount
    useEffect(() => {
        const checkStatus = async () => {
            if (!room.name) return;

            try {
                const response = await fetch(`${serverUrl}/recording/status?roomName=${encodeURIComponent(room.name)}`);
                const data = await response.json();

                if (data.isRecording) {
                    setIsRecording(true);
                    setEgressId(data.egressId);
                    setRecordingStartTime(data.startedAt ? new Date(data.startedAt) : null);
                }
            } catch (error) {
                console.error('Failed to check recording status:', error);
            }
        };

        checkStatus();
    }, [room.name]);

    const startRecording = useCallback(async () => {
        if (!room.name || isRecording) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${serverUrl}/recording/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomName: room.name,
                    layout: 'speaker',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to start recording');
            }

            const data = await response.json();
            setIsRecording(true);
            setEgressId(data.egressId);
            setRecordingStartTime(new Date());
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('Failed to start recording. Please check server configuration.');
        } finally {
            setIsLoading(false);
        }
    }, [room.name, isRecording]);

    const stopRecording = useCallback(async () => {
        if (!egressId || !isRecording) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${serverUrl}/recording/stop/${egressId}`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to stop recording');
            }

            setIsRecording(false);
            setEgressId(null);
            setRecordingStartTime(null);
        } catch (error) {
            console.error('Failed to stop recording:', error);
            alert('Failed to stop recording.');
        } finally {
            setIsLoading(false);
        }
    }, [egressId, isRecording]);

    return (
        <RecordingContext.Provider
            value={{
                isRecording,
                egressId,
                recordingStartTime,
                startRecording,
                stopRecording,
                isLoading,
            }}
        >
            {children}
        </RecordingContext.Provider>
    );
}

export function useRecording() {
    const context = useContext(RecordingContext);
    if (!context) {
        throw new Error('useRecording must be used within RecordingProvider');
    }
    return context;
}
