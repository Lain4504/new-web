import { Circle, StopCircle } from "lucide-react";
import { useRecording } from "../contexts/RecordingContext";

export function RecordButton() {
    const { isRecording, startRecording, stopRecording, isLoading } = useRecording();

    const toggleRecording = async () => {
        if (isRecording) {
            await stopRecording();
        } else {
            await startRecording();
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
