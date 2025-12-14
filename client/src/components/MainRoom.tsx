import { useCallback, useState, useEffect } from "react";
import { BottomController } from "./BottomController";
import { Whiteboard } from "./Whiteboard";
import { FocusedTrackView } from "./FocusedTrackView";
import { SettingsModal } from "./settings/SettingsModal";
import { type TrackReference, useRoomContext, RoomContext } from "@livekit/components-react";
import { RoomEvent, DataPacket_Kind } from "livekit-client";

import { Conference } from "./Conference";
import { LiveKitService } from "../services/LiveKitService";
import { SyncRoomProvider } from "../contexts/SyncRoomContext";
import { RecordingProvider, useRecording } from "../contexts/RecordingContext";
import "@livekit/components-styles";
import { ChatRoom } from "./ChatRoom";
import { generateUserId, getColorFromIdentity } from "../utils/color";
import { useChatSendJoinMessage } from "../hooks/useChatSendJoinMessage";
import { useHandRaiseNotifications } from "../hooks/useHandRaiseNotifications";
import { HandRaiseToast } from "./HandRaiseToast";
import { ReactionProvider, useReaction } from "../contexts/ReactionContext";
import { PollsProvider } from "../contexts/PollsContext";

interface MainRoomProps {
  roomId: string;
  userName: string;
}

export function MainRoom({ roomId, userName }: MainRoomProps) {
  const [liveKitService] = useState(() => new LiveKitService());
  const [userId, setUserId] = useState<string>("");
  const [userColor, setUserColor] = useState<string>("");

  useEffect(() => {
    setUserId(generateUserId());
    setUserColor(getColorFromIdentity(userName));
  }, [userName]);

  useEffect(() => {
    if (!roomId || !userName || !userId) {
      return;
    }

    const connect = async () => {
      await liveKitService.connect(roomId, userId, userName);
    };
    connect();

    return () => {
      liveKitService.disconnect();
    };
  }, [liveKitService, roomId, userId, userName]);

  return (
    <RoomContext.Provider value={liveKitService.getRoom()}>
      <SyncRoomProvider
        userInfo={{
          id: userId,
          name: userName,
          color: userColor,
        }}
      >
        <RecordingProvider>
          <ReactionProvider>
            <PollsProvider>
              <Content />
            </PollsProvider>
          </ReactionProvider>
        </RecordingProvider>
      </SyncRoomProvider>
    </RoomContext.Provider>
  );
}

function Content() {
  const [showChat, setShowChat] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [focusTrack, setFocusTrack] = useState<TrackReference | null>(null);
  const { isRecording } = useRecording();
  const handRaiseToasts = useHandRaiseNotifications();
  const { reactions, addReaction } = useReaction();

  useChatSendJoinMessage();

  const handleToggleChat = useCallback(() => {
    setShowChat((prev) => !prev);
  }, []);

  const [showSettings, setShowSettings] = useState(false);
  const handleToggleSettings = () => setShowSettings(!showSettings);
  const handleToggleWhiteboard = useCallback(() => {
    setShowWhiteboard((prev) => !prev);
    // If opening whiteboard, clear focus track
    if (!showWhiteboard) {
      setFocusTrack(null);
    }
  }, [showWhiteboard]);

  const handleTrackClick = useCallback((track: TrackReference) => {
    setFocusTrack(track);
    setShowWhiteboard(false); // Close whiteboard when focusing a track
  }, []);

  const handleCloseChat = useCallback(() => {
    setShowChat(false);
  }, []);

  const showLeftPane = showChat;
  const room = useRoomContext();

  // Handle reactions from other participants
  useEffect(() => {
    const handleData = (payload: Uint8Array, _participant: any, kind: any) => {
      if (kind === DataPacket_Kind.RELIABLE) return;
      const decoder = new TextDecoder();
      const str = decoder.decode(payload);
      try {
        const data = JSON.parse(str);
        if (data.type === "reaction") {
          addReaction(data.emoji);
        }
      } catch (e) {
        // ignore
      }
    };
    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room, addReaction]);

  return (
    <div className="flex flex-col h-screen relative">
      {/* Recording Border Indicator */}
      {isRecording && (
        <div
          className="fixed inset-0 pointer-events-none z-[10000]"
          style={{
            border: '4px solid #ef4444',
            animation: 'pulse-border 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Reaction Overlay */}
      <div className="absolute bottom-20 left-4 pointer-events-none z-[100]">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-0 text-4xl animate-bounce transition-opacity duration-1000"
            style={{
              left: `${r.left}px`,
              animation: "floatUp 4s ease-out forwards",
            }}
          >
            {r.emoji}
          </div>
        ))}
        <style>{`
          @keyframes floatUp {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-300px); opacity: 0; }
          }
          @keyframes pulse-border {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>

      {/* Hand Raise Toast Notifications */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-auto">
        {handRaiseToasts.map((toast) => (
          <HandRaiseToast
            key={toast.id}
            name={toast.name}
            onClose={() => {
              // Toast will auto-remove via timeout
            }}
          />
        ))}
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex w-full h-full">
          {/* Left pane: Chat/Polls */}
          <div
            className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-[60] ${showLeftPane
              ? "absolute inset-0 w-full sm:relative sm:w-[360px] flex-shrink-0"
              : "w-0 overflow-hidden relative"
              }`}
          >
            <div className="h-full w-full sm:w-[360px]">
              {showChat && (
                <ChatRoom isOpen={showChat} onClose={handleCloseChat} />
              )}
            </div>
          </div>

          {/* Right pane: Main Content */}
          <div className="flex-1 min-w-0 h-full overflow-hidden bg-gray-900 relative z-0 flex flex-col">
            {(showWhiteboard || focusTrack) ? (
              <>
                <div className="flex-1 relative min-h-0">
                  {showWhiteboard ? (
                    <Whiteboard />
                  ) : (
                    focusTrack && <FocusedTrackView trackRef={focusTrack} />
                  )}
                </div>
                {/* Filmstrip View at Bottom */}
                <div className="flex-shrink-0 h-[140px] border-t border-gray-800 bg-gray-900 z-10 w-full relative">
                  <Conference onTrackClick={handleTrackClick} layout="filmstrip" />
                </div>
              </>
            ) : (
              // Grid View
              <div className="flex-1 relative min-h-0 w-full">
                <Conference onTrackClick={handleTrackClick} layout="grid" />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="min-h-[50px]">
        <BottomController
          showChat={handleToggleChat}
          showWhiteboard={handleToggleWhiteboard}
          showSettings={handleToggleSettings}
        />
      </div>
    </div >
  );
}
