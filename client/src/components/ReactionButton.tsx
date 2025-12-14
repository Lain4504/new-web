import { Smile } from "lucide-react";
import { useRoomContext } from "@livekit/components-react";
import { useState } from "react";
import { useReaction } from "../contexts/ReactionContext";


export function ReactionButton() {
    const room = useRoomContext();
    const { addReaction } = useReaction();
    const [isOpen, setIsOpen] = useState(false);

    const sendReaction = async (emoji: string) => {
        // Add reaction locally for sender
        addReaction(emoji);

        // Send to other participants
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify({ type: "reaction", emoji }));
        await room.localParticipant.publishData(data, {
            reliable: false,
            topic: "reaction",
        });
        setIsOpen(false);
    };

    const reactions = ["👍", "❤️", "👏", "🎉", "🤔", "👎"];

    return (
        <div className="relative">
            {isOpen && (
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-lg flex gap-2 border border-gray-200">
                    {reactions.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => sendReaction(emoji)}
                            className="text-2xl hover:scale-125 transition-transform"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
            <button
                className="w-8 h-8 flex items-center justify-center p-0 bg-transparent border-none hover:bg-gray-200 rounded"
                onClick={() => setIsOpen(!isOpen)}
                title="Reactions"
            >
                <Smile className="w-5 h-5 text-gray-700" />
            </button>
        </div>
    );
}
