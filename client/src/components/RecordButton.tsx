import { Circle, StopCircle } from "lucide-react";
import { useState } from "react";
import { useRoomContext } from "@livekit/components-react";

export function RecordButton() {
    const room = useRoomContext();
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Using import.meta.env for server URL, fallback to window.location
    const serverUrl = import.meta.env.VITE_AUTH_SERVER_URL || "";

    const toggleRecording = async () => {
        setIsLoading(true);
        try {
            const roomName = room.name;
            if (!isRecording) {
                // Start
                await fetch(`${serverUrl}/rooms/${roomName}/recording/start`, { method: "POST" });
                setIsRecording(true);
            } else {
                // Stop
                await fetch(`${serverUrl}/rooms/${roomName}/recording/stop`, { method: "POST" });
                setIsRecording(false);
            }
        } catch (e) {
            console.error("Failed to toggle recording", e);
            alert("Failed to toggle recording. Ensure server is configured.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            className={`w-8 h-8 flex items-center justify-center p-0 bg-transparent border-none rounded hover:bg-gray-200 ${isRecording ? 'text-red-500' : 'text-gray-700'}`}
            onClick={toggleRecording}
            title={isRecording ? "Stop Recording" : "Start Recording"}
            disabled={isLoading}
        >
            {isRecording ? <StopCircle className="w-5 h-5 animate-pulse" /> : <Circle className="w-5 h-5" />}
        </button>
    );
}
