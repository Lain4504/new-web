import { ControlBar } from "@livekit/components-react";
import { LogOut, MessageSquare, PenTool, Settings } from "lucide-react";
import { useSyncRoomContext } from "../contexts/SyncRoomContext";
import { ReactionButton } from "./ReactionButton";
import { HandRaiseButton } from "./HandRaiseButton";
import { RecordButton } from "./RecordButton";

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



  const handleChatToggle = () => {
    showChat((prev) => !prev);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full p-2 bg-gray-100 border-t border-gray-300">
      <div className="flex justify-between items-center">
        <div className="ml-4 text-gray-700 font-bold hidden sm:block">{userName}</div>
        <ControlBar
          className="h-10 p-0 m-0"
          variation="minimal"
          controls={{
            microphone: true,
            camera: true,
            screenShare: true,
            leave: false,
          }}
        />
        <div className="text-right flex gap-2 items-center">
          <HandRaiseButton />
          <div className="hidden sm:block">
            <RecordButton />
          </div>
          <ReactionButton />
          <button
            className="w-8 h-8 hidden sm:flex items-center justify-center p-0 bg-transparent border-none hover:bg-gray-200 rounded"
            onClick={showSettings}
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-700" />
          </button>
          <button
            className="w-8 h-8 hidden sm:flex items-center justify-center p-0 bg-transparent border-none hover:bg-gray-200 rounded"
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
            onClick={() => {
              if (window.confirm("정말 나가시겠습니까?")) {
                window.location.href = "/";
              }
            }}
          >
            <LogOut className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
