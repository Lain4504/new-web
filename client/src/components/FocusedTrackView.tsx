import { VideoTrack, type TrackReference } from "@livekit/components-react";

interface FocusedTrackViewProps {
    trackRef: TrackReference;
}

export function FocusedTrackView({ trackRef }: FocusedTrackViewProps) {
    return (
        <div className="w-full h-full bg-black flex items-center justify-center">
            <VideoTrack
                trackRef={trackRef}
                className="w-full h-full object-contain"
            />
        </div>
    );
}
