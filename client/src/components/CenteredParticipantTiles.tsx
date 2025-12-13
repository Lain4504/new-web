import { ParticipantTile, type useTracks } from "@livekit/components-react";
import { getColorFromIdentity } from "../utils/color";
import { Hand } from "lucide-react";
import { useEffect, useState } from "react";

import { ChevronDown, ChevronUp, Users } from "lucide-react";

export function CenteredParticipantTiles({
  tracks,
  onTrackClick,
}: {
  tracks: ReturnType<typeof useTracks>;
  onTrackClick?: (track: (ReturnType<typeof useTracks>)[0]) => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (tracks.length === 0) return null;

  return (
    <>
      <div className={`absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 z-50 pointer-events-auto transition-all duration-300 ${isCollapsed ? "bottom-4" : "bottom-8"}`}>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-full p-1.5 shadow-md backdrop-blur-sm transition-colors mb-2"
          title={isCollapsed ? "Show Participants" : "Hide Participants"}
        >
          {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Tiles Container */}
        <div
          className={`flex gap-2 overflow-x-auto max-w-[90vw] p-2 transition-all duration-300 origin-bottom ${isCollapsed
              ? "opacity-0 scale-y-0 h-0 p-0 overflow-hidden"
              : "opacity-100 scale-y-100"
            }`}
        >
          {tracks.map((trackRef) => (
            <div
              key={trackRef.publication?.trackSid || trackRef.participant.sid}
              className="w-28 h-28 flex-shrink-0 rounded-full overflow-hidden border-4 shadow-lg shadow-gray-500/50 cursor-pointer hover:scale-105 transition-transform relative group"
              style={{
                borderColor: getColorFromIdentity(trackRef.participant.identity),
              }}
              onClick={() => onTrackClick?.(trackRef)}
            >
              {trackRef.publication && !trackRef.publication.isMuted ? (
                <ParticipantTile
                  trackRef={trackRef}
                  className="w-full h-full object-cover rounded-full"
                  disableSpeakingIndicator={true}
                  style={{ borderRadius: '9999px' }}
                />
              ) : (
                <NamePlaceholderTile name={trackRef.participant.name} />
              )}

              {/* Name Overlay on Hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium text-center px-1 pointer-events-none">
                {trackRef.participant.name || trackRef.participant.identity}
              </div>

              {/* Hand Raise Icon */}
              <HandIndicator participant={trackRef.participant} />
            </div>
          ))}
        </div>

        {/* Collapsed Badge (Optional - shows count when hidden) */}
        {isCollapsed && (
          <div className="flex items-center gap-2 bg-gray-900/90 text-white px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md cursor-pointer hover:bg-gray-800" onClick={() => setIsCollapsed(false)}>
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{tracks.length}</span>
          </div>
        )}
      </div>
    </>
  );
}

function getInitials(name?: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function NamePlaceholderTile({ name }: { name?: string }) {
  const initials = getInitials(name);
  return (
    <div className="w-full h-full rounded-full bg-gray-700 text-white flex items-center justify-center text-4xl font-semibold">
      {initials}
    </div>
  );
}

function HandIndicator({ participant }: { participant: any }) {
  const [isRaised, setIsRaised] = useState(false);

  useEffect(() => {
    const checkMetadata = () => {
      if (participant.metadata) {
        try {
          const meta = JSON.parse(participant.metadata);
          setIsRaised(!!meta.handRaised);
        } catch (e) {
          setIsRaised(false);
        }
      } else {
        setIsRaised(false);
      }
    };

    checkMetadata();
    const handleUpdate = () => checkMetadata();
    // listening to custom metadata update
    // Note: LiveKit Participant emits "metadataChanged"
    participant.on("metadataChanged", handleUpdate);
    return () => {
      participant.off("metadataChanged", handleUpdate);
    };
  }, [participant]);

  if (!isRaised) return null;

  return (
    <div className="absolute top-1 left-1 bg-blue-500 rounded-full p-1 shadow-md z-10">
      <Hand className="w-4 h-4 text-white" />
    </div>
  );
}
