import { RoomAudioRenderer, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { ParticipantLayout } from "./ParticipantLayout";
import "../styles/livekit-custom.css";

interface ConferenceProps {
  onTrackClick?: (track: any) => void;
  layout?: "grid" | "filmstrip";
}

export function Conference({ onTrackClick, layout = "grid" }: ConferenceProps) {
  return (
    <div className="w-full h-full">
      {/* Your custom component with basic video conferencing functionality. */}
      <MyVideoConference onTrackClick={onTrackClick} layout={layout} />
      {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
      <RoomAudioRenderer />
    </div>
  );
}

function MyVideoConference({ onTrackClick, layout }: { onTrackClick?: (track: any) => void, layout: "grid" | "filmstrip" }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  if (tracks.length === 0) {
    return null;
  }

  return <ParticipantLayout tracks={tracks} onTrackClick={onTrackClick} layoutMode={layout} />;
}
