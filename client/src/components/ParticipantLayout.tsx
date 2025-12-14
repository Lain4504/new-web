import {
    ParticipantTile,
    useTracks,
    ConnectionQualityIndicator,
    ParticipantName
} from "@livekit/components-react";
import { Expand, MicOff, ChevronLeft, ChevronRight } from "lucide-react";
import { Track } from "livekit-client";
import { useState } from "react";

interface ParticipantLayoutProps {
    tracks: ReturnType<typeof useTracks>;
    onTrackClick?: (track: (ReturnType<typeof useTracks>)[0]) => void;
    layoutMode: "grid" | "filmstrip";
}

export function ParticipantLayout({ tracks, onTrackClick, layoutMode }: ParticipantLayoutProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedTrackSid, setSelectedTrackSid] = useState<string | null>(null);

    if (tracks.length === 0) return null;

    // Render logic for single tile with overlays
    const renderTile = (trackRef: (ReturnType<typeof useTracks>)[0]) => {
        const isScreenShare = trackRef.source === Track.Source.ScreenShare;
        const isSpeaking = trackRef.participant.isSpeaking;
        const trackSid = trackRef.publication?.trackSid || trackRef.participant.sid;
        const isSelected = selectedTrackSid === trackSid;

        const handleTileClick = (e: React.MouseEvent) => {
            // Prevent click if clicking on button
            if ((e.target as HTMLElement).closest('button')) {
                return;
            }
            // Toggle selected state
            setSelectedTrackSid(isSelected ? null : trackSid);
        };

        const handleFocusClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            onTrackClick?.(trackRef);
            setSelectedTrackSid(null); // Clear selection after focus
        };

        return (
            <div
                key={trackSid}
                className={
                    layoutMode === "grid"
                        ? `relative overflow-hidden rounded-xl bg-gray-800 shadow-md group ${isSpeaking ? "ring-4 ring-green-500" :
                            "border border-gray-700/50"
                        }`
                        : `flex-shrink-0 w-40 h-24 relative rounded-lg overflow-hidden bg-gray-800 shadow-sm group ${isSpeaking ? "ring-2 ring-green-500" : "ring-1 ring-gray-700/50"
                        }`
                }
                style={layoutMode === "grid" ? { minHeight: '200px' } : undefined}
                onClick={handleTileClick}
            >
                {/* ParticipantTile renders video/avatar automatically */}
                <ParticipantTile
                    trackRef={trackRef}
                    className="w-full h-full"
                />

                {/* Screen Share Indicator */}
                {isScreenShare && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold z-10">
                        🖥️ Screen Share
                    </div>
                )}

                {/* Connection Quality - Always bottom right */}
                <div
                    className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm rounded p-0.5 z-10"
                    title="Connection Quality"
                >
                    <ConnectionQualityIndicator participant={trackRef.participant} className="h-4 w-4 text-white" />
                </div>

                {/* Expand/Focus Button - Only visible when selected, top right */}
                {isSelected && (
                    <div className="absolute top-2 right-2 z-20">
                        <button
                            onClick={handleFocusClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
                            title="Focus / Pin"
                        >
                            <Expand size={20} />
                        </button>
                    </div>
                )}

                {/* Bottom Name/Mic Overlay - No background */}
                <div className="absolute bottom-0 left-0 w-full p-2 flex items-end justify-between z-10">
                    <div className="flex items-center gap-2 text-white overflow-hidden w-full">
                        {/* Microphone Status - Only show if muted */}
                        {!trackRef.participant.isMicrophoneEnabled && (
                            <div className="flex-shrink-0">
                                <div className="p-1 rounded-full bg-red-500">
                                    <MicOff className="w-3 h-3 text-white" />
                                </div>
                            </div>
                        )}

                        {/* Name */}
                        <span className="text-sm font-bold truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex-1">
                            <ParticipantName participant={trackRef.participant} />
                            {isScreenShare && "'s Screen"}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    if (layoutMode === "grid") {
        // Grid Layout Logic
        const isMobile = window.innerWidth < 640; // sm breakpoint

        // Mobile pagination: 2 items per page
        const ITEMS_PER_PAGE_MOBILE = 2;
        const totalPages = isMobile ? Math.ceil(tracks.length / ITEMS_PER_PAGE_MOBILE) : 1;

        // Get tracks for current page (mobile only)
        const displayTracks = isMobile && tracks.length > 2
            ? tracks.slice(currentPage * ITEMS_PER_PAGE_MOBILE, (currentPage + 1) * ITEMS_PER_PAGE_MOBILE)
            : tracks;

        let gridCols;
        if (isMobile && tracks.length === 2) {
            gridCols = "grid-cols-1"; // Vertical stack on mobile for 2 people
        } else if (isMobile && tracks.length > 2) {
            gridCols = "grid-cols-1"; // Vertical stack for pagination
        } else {
            gridCols = tracks.length === 1 ? "grid-cols-1" :
                tracks.length <= 4 ? "grid-cols-2" :
                    tracks.length <= 9 ? "grid-cols-3" : "grid-cols-4";
        }

        return (
            <div className="relative w-full h-full flex flex-col">
                {/* Grid Container */}
                <div
                    className={`grid ${gridCols} gap-2 w-full p-2 flex-1 ${isMobile && tracks.length > 2 ? '' : 'overflow-y-auto'}`}
                    style={{
                        gridAutoRows: isMobile && tracks.length > 2 ? 'minmax(250px, 1fr)' : '1fr',
                        height: isMobile && tracks.length > 2 ? 'auto' : '100%',
                        maxHeight: isMobile && tracks.length > 2 ? 'none' : '100vh'
                    }}
                >
                    {displayTracks.map(renderTile)}
                </div>

                {/* Mobile Pagination Controls */}
                {isMobile && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 p-4 bg-gray-900/50 backdrop-blur-sm">
                        <button
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                            className="p-2 rounded-full bg-gray-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <span className="text-white text-sm font-medium">
                            {currentPage + 1} / {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="p-2 rounded-full bg-gray-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        );
    } else {
        // Filmstrip Layout Logic
        return (
            <div className="flex gap-2 p-2 overflow-x-auto h-full w-full items-center">
                {tracks.map(renderTile)}
            </div>
        );
    }
}
