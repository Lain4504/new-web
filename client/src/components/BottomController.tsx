import { ControlBar, TrackToggle } from "@livekit/components-react";
import { LogOut, MessageSquare, PenTool, Settings, MoreHorizontal, X } from "lucide-react";
import { useSyncRoomContext } from "../contexts/SyncRoomContext";
import { ReactionButton } from "./ReactionButton";
import { HandRaiseButton } from "./HandRaiseButton";
import { RecordButton } from "./RecordButton";
import { Track } from "livekit-client";
import { useState } from "react";

interface BottomControllerProps {
  showChat: React.Dispatch<React.SetStateAction<boolean>>;
  showWhiteboard: () => void;
  showSettings: () => void;
}

export function BottomController({
  showChat,
  showWhiteboard,
  showSettings
}: BottomControllerProps) {
  const { userName } = useSyncRoomContext();
  const [showDrawer, setShowDrawer] = useState(false);

  const handleChatToggle = () => {
    showChat((prev) => !prev);
    setShowDrawer(false);
  };

  const handleLeave = () => {
    if (window.confirm("Are you sure you want to leave?")) {
      window.location.href = "/";
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full p-2 bg-gray-100 border-t border-gray-300 z-50">

        {/* Mobile Toolbar (Visible < sm) */}
        <div className="flex sm:hidden justify-between items-center px-2">
          {/* Custom Track Toggles for Mobile to ensure consistent styling */}
          <div className="flex gap-2">
            <TrackToggle source={Track.Source.Microphone} showIcon={true} className="lk-button" />
            <TrackToggle source={Track.Source.Camera} showIcon={true} className="lk-button" />
          </div>

          <ReactionButton />

          <button
            onClick={() => setShowDrawer(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            <MoreHorizontal size={24} />
          </button>

          <button
            onClick={handleLeave}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white"
          >
            <LogOut size={20} />
          </button>
        </div>


        {/* Desktop Toolbar (Hidden < sm) */}
        <div className="hidden sm:flex justify-between items-center">
          <div className="ml-4 text-gray-700 font-bold">{userName}</div>
          <ControlBar
            className="h-10 p-0 m-0"
            variation="minimal"
            controls={{
              microphone: true,
              camera: true,
              screenShare: true,
              leave: false, // We use custom leave button
            }}
          />
          <div className="text-right flex gap-2 items-center">
            <HandRaiseButton />
            <RecordButton />
            <ReactionButton />
            <button
              className="w-8 h-8 flex items-center justify-center p-0 bg-transparent border-none hover:bg-gray-200 rounded"
              onClick={showSettings}
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-700" />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center p-0 bg-transparent border-none hover:bg-gray-200 rounded"
              onClick={showWhiteboard}
              title="Toggle Whiteboard"
            >
              <PenTool className="w-5 h-5 text-gray-700" />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center p-0 bg-transparent border-none hover:bg-gray-200 rounded"
              onClick={handleChatToggle}
            >
              <MessageSquare className="w-5 h-5 text-gray-700" />
            </button>

            <button
              className="w-8 h-8 flex items-center justify-center p-0 bg-transparent border-none hover:bg-red-100 rounded"
              onClick={handleLeave}
            >
              <LogOut className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Basic Mobile Bottom Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-[100] sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowDrawer(false)}
          />

          {/* Drawer Content */}
          <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl p-6 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 m-0">Options</h3>
              <button onClick={() => setShowDrawer(false)} className="p-1 bg-gray-100 rounded-full">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {/* Chat Item */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleChatToggle}
                  className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-2xl"
                >
                  <MessageSquare size={24} />
                </button>
                <span className="text-xs font-medium text-gray-600">Chat</span>
              </div>

              {/* Hand Raise Item */}
              <div className="flex flex-col items-center gap-2">
                <div className="scale-125 origin-center">
                  <HandRaiseButton />
                </div>
                <span className="text-xs font-medium text-gray-600 mt-1">Hand</span>
              </div>

              {/* Whiteboard Item */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => { showWhiteboard(); setShowDrawer(false); }}
                  className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-2xl"
                >
                  <PenTool size={24} />
                </button>
                <span className="text-xs font-medium text-gray-600">Board</span>
              </div>

              {/* Settings Item */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => { showSettings(); setShowDrawer(false); }}
                  className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-700 rounded-2xl"
                >
                  <Settings size={24} />
                </button>
                <span className="text-xs font-medium text-gray-600">Settings</span>
              </div>

              {/* Record Item */}
              <div className="flex flex-col items-center gap-2">
                <div className="scale-125 origin-center" onClick={() => setShowDrawer(false)}>
                  <RecordButton />
                </div>
                <span className="text-xs font-medium text-gray-600 mt-1">Rec</span>
              </div>
            </div>

            <div className="h-4" /> {/* Spacer */}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
