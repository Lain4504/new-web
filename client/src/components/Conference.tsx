import { RoomAudioRenderer, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { CenteredParticipantTiles } from "./CenteredParticipantTiles";
import "../styles/livekit-custom.css";

interface ConferenceProps {
  onTrackClick?: (track: any) => void;
}

export function Conference({ onTrackClick }: ConferenceProps) {
  return (
    <div>
      {/* Your custom component with basic video conferencing functionality. */}
      <MyVideoConference onTrackClick={onTrackClick} />
      {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
      <RoomAudioRenderer />
    </div>
  );
}

function MyVideoConference({ onTrackClick }: { onTrackClick?: (track: any) => void }) {
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

  return <CenteredParticipantTiles tracks={tracks} onTrackClick={onTrackClick} />;
}
