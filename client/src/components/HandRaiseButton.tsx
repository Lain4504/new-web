import { Hand } from "lucide-react";
import { useLocalParticipant } from "@livekit/components-react";
import { useCallback, useEffect, useState } from "react";

export function HandRaiseButton() {
    const { localParticipant } = useLocalParticipant();
    const [isRaised, setIsRaised] = useState(false);

    useEffect(() => {
        if (localParticipant?.metadata) {
            try {
                const meta = JSON.parse(localParticipant.metadata);
                setIsRaised(!!meta.handRaised);
            } catch (e) {
                // ignore
            }
        }
    }, [localParticipant?.metadata]);

    const toggleHand = useCallback(async () => {
        if (!localParticipant) return;
        const newState = !isRaised;
        await localParticipant.setMetadata(JSON.stringify({ handRaised: newState }));
        setIsRaised(newState);
    }, [localParticipant, isRaised]);

    return (
        <button
            className={`w-8 h-8 flex items-center justify-center p-0 bg-transparent border-none rounded ${isRaised ? "bg-blue-100 text-blue-600" : "hover:bg-gray-200 text-gray-700"
                }`}
            onClick={toggleHand}
            title={isRaised ? "Lower Hand" : "Raise Hand"}
        >
            <Hand className="w-5 h-5" />
        </button>
    );
}
