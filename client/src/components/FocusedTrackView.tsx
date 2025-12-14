import { VideoTrack, type TrackReference, ParticipantName } from "@livekit/components-react";
import { getColorFromIdentity } from "../utils/color";

interface FocusedTrackViewProps {
    trackRef: TrackReference;
}

export function FocusedTrackView({ trackRef }: FocusedTrackViewProps) {
    const isCameraEnabled = trackRef.participant.isCameraEnabled;
    const participantName = trackRef.participant.name || "Guest";
    const userColor = getColorFromIdentity(participantName);

    // Get initials from name (first letter of first and last name)
    const getInitials = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const initials = getInitials(participantName);

    return (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
            {isCameraEnabled ? (
                <VideoTrack
                    trackRef={trackRef}
                    className="w-full h-full object-contain"
                />
            ) : (
                // Avatar placeholder when camera is off
                <div className="flex flex-col items-center justify-center gap-4">
                    <div
                        className="w-48 h-48 rounded-full flex items-center justify-center text-white text-6xl font-bold shadow-2xl"
                        style={{ backgroundColor: userColor }}
                    >
                        {initials}
                    </div>
                    <div className="text-white text-2xl font-medium">
                        <ParticipantName participant={trackRef.participant} />
                    </div>
                    <div className="text-gray-400 text-sm">
                        Camera is off
                    </div>
                </div>
            )}
        </div>
    );
}
