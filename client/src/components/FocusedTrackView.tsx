import { VideoTrack, type TrackReference, ParticipantName, ConnectionQualityIndicator } from "@livekit/components-react";
import { Track } from "livekit-client";
import { getColorFromIdentity } from "../utils/color";
import { Shrink } from "lucide-react";
import { useState } from "react";

interface FocusedTrackViewProps {
    trackRef: TrackReference;
    onUnfocus?: () => void;
}

export function FocusedTrackView({ trackRef, onUnfocus }: FocusedTrackViewProps) {
    const [showUnfocusButton, setShowUnfocusButton] = useState(false);

    const participantName = trackRef.participant.name || "Guest";
    const userColor = getColorFromIdentity(participantName);

    // Check if this is a screen share or if there's an active video track
    const isScreenShare = trackRef.source === Track.Source.ScreenShare;
    const hasVideoTrack = trackRef.publication && trackRef.publication.track;

    // Show video if:
    // 1. It's a screen share (always has video)
    // 2. It's a camera track AND camera is enabled
    const shouldShowVideo = isScreenShare || (trackRef.participant.isCameraEnabled && hasVideoTrack);

    // Get initials from name (first letter of first and last name)
    const getInitials = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const initials = getInitials(participantName);

    const handleViewClick = (e: React.MouseEvent) => {
        // Prevent click if clicking on button
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        // Toggle unfocus button visibility
        setShowUnfocusButton(!showUnfocusButton);
    };

    const handleUnfocusClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onUnfocus?.();
        setShowUnfocusButton(false);
    };

    return (
        <div
            className="w-full h-full bg-gray-900 flex items-center justify-center relative cursor-pointer"
            onClick={handleViewClick}
        >
            {/* Unfocus Button - Only visible when clicked */}
            {onUnfocus && showUnfocusButton && (
                <button
                    onClick={handleUnfocusClick}
                    className="absolute top-4 right-4 z-20 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors"
                    title="Return to grid view"
                >
                    <Shrink className="w-5 h-5" />
                </button>
            )}

            {/* Connection Quality - Bottom right */}
            <div
                className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm rounded p-1 z-10"
                title="Connection Quality"
            >
                <ConnectionQualityIndicator participant={trackRef.participant} className="h-5 w-5 text-white" />
            </div>

            {/* Screen Share Label */}
            {isScreenShare && (
                <div className="absolute top-4 left-4 z-20 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg">
                    🖥️ Screen Share - {participantName}
                </div>
            )}

            {shouldShowVideo ? (
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
