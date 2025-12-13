import { useState } from "react";
import { X, Mic, Video } from "lucide-react";
import { AudioSettings } from "./AudioSettings";
import { VideoSettings } from "./VideoSettings";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<"audio" | "video" | "general">("audio");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-[800px] max-h-[80vh] flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-gray-50 p-4 border-r border-gray-200 flex flex-col gap-2">
                    <h2 className="text-xl font-bold mb-4 px-2">Settings</h2>

                    <button
                        onClick={() => setActiveTab("audio")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "audio" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-200 text-gray-700"
                            }`}
                    >
                        <Mic className="w-5 h-5" />
                        <span className="font-medium">Audio</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("video")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "video" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-200 text-gray-700"
                            }`}
                    >
                        <Video className="w-5 h-5" />
                        <span className="font-medium">Video</span>
                    </button>

                    {/* Placeholder for General/Recording if needed */}
                    {/* <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === "general" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">General</span>
          </button> */}
                </div>

                {/* Content */}
                <div className="flex-1 p-8 overflow-y-auto bg-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>

                    <div className="max-w-xl mx-auto">
                        {activeTab === "audio" && <AudioSettings />}
                        {activeTab === "video" && <VideoSettings />}
                        {activeTab === "general" && <div>General Settings</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
