import {
    ParticipantTile,
    useTracks,
    ConnectionQualityIndicator,
    ParticipantName
} from "@livekit/components-react";
import { Maximize2, MicOff } from "lucide-react";
import { Track } from "livekit-client";

interface ParticipantLayoutProps {
    tracks: ReturnType<typeof useTracks>;
    onTrackClick?: (track: (ReturnType<typeof useTracks>)[0]) => void;
    layoutMode: "grid" | "filmstrip";
}

export function ParticipantLayout({ tracks, onTrackClick, layoutMode }: ParticipantLayoutProps) {
    if (tracks.length === 0) return null;

    // Render logic for single tile with overlays
    const renderTile = (trackRef: (ReturnType<typeof useTracks>)[0]) => {
        const isScreenShare = trackRef.source === Track.Source.ScreenShare;
        const isSpeaking = trackRef.participant.isSpeaking;

        return (
            <div
                key={trackRef.publication?.trackSid || trackRef.participant.sid}
                className={
                    layoutMode === "grid"
                        ? `relative overflow-hidden rounded-xl bg-gray-800 shadow-md group ${isSpeaking ? "ring-4 ring-green-500" : "border border-gray-700/50"
                        }`
                        : `flex-shrink-0 w-48 h-32 relative rounded-lg overflow-hidden bg-gray-800 shadow-sm group ${isSpeaking ? "ring-2 ring-green-500" : "ring-1 ring-gray-700/50"
                        }`
                }
                onClick={() => onTrackClick?.(trackRef)}
            >
                {/* ParticipantTile renders video/avatar automatically */}
                <ParticipantTile
                    trackRef={trackRef}
                    className="w-full h-full"
                />

                {/* Top Right: Connection Quality */}
                <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm rounded p-0.5 z-10" title="Connection Quality">
                    <ConnectionQualityIndicator participant={trackRef.participant} className="h-4 w-4" />
                </div>

                {/* Center: Expand/Focus Button (Visible on Hover) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-black/60 text-white p-2 rounded-full cursor-pointer pointer-events-auto hover:bg-black/80 transition-colors" title="Focus / Pin">
                        <Maximize2 size={24} />
                    </div>
                </div>

                {/* Bottom Gradient Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between z-10">
                    <div className="flex items-center gap-2 text-white overflow-hidden w-full">
                        {/* Microphone Status - Only show if muted */}
                        {!trackRef.participant.isMicrophoneEnabled && (
                            <div className="flex-shrink-0">
                                <div className="p-1 rounded-full bg-red-500/80">
                                    <MicOff className="w-3 h-3 text-white" />
                                </div>
                            </div>
                        )}

                        {/* Name */}
                        <span className="text-sm font-medium truncate shadow-black drop-shadow-md flex-1">
                            <ParticipantName participant={trackRef.participant} />
                            {isScreenShare && " (Presenting)"}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    if (layoutMode === "grid") {
        // Grid Layout Logic
        const gridCols = tracks.length === 1 ? "grid-cols-1" :
            tracks.length <= 4 ? "grid-cols-2" :
                tracks.length <= 9 ? "grid-cols-3" : "grid-cols-4";

        return (
            <div className={`grid ${gridCols} gap-2 w-full h-full p-2 auto-rows-fr`}>
                {tracks.map(renderTile)}
            </div>
        );
    } else {
        // Filmstrip Layout Logic
        return (
            <div className="flex gap-2 p-2 overflow-x-auto h-full w-full items-center bg-gray-900/50 backdrop-blur-sm">
                {tracks.map(renderTile)}
            </div>
        );
    }
}
