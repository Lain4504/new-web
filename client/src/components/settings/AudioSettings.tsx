import { useMediaDeviceSelect, useRoomContext } from "@livekit/components-react";
import { KrispNoiseFilter, type KrispNoiseFilterProcessor } from "@livekit/krisp-noise-filter";
import { useState } from "react";
import { Mic, Volume2 } from "lucide-react";
import { Track } from "livekit-client";

export function AudioSettings() {
    const room = useRoomContext();
    const { devices: micDevices, activeDeviceId: activeMicId, setActiveMediaDevice: setMic } =
        useMediaDeviceSelect({ kind: "audioinput" });
    const { devices: speakerDevices, activeDeviceId: activeSpeakerId, setActiveMediaDevice: setSpeaker } =
        useMediaDeviceSelect({ kind: "audiooutput" });

    const [isNoiseCancellationEnabled, setIsNoiseCancellationEnabled] = useState(false);
    const [processor, setProcessor] = useState<KrispNoiseFilterProcessor | undefined>(undefined);

    const toggleNoiseCancellation = async (checked: boolean) => {
        setIsNoiseCancellationEnabled(checked);
        // Get microphone track correctly
        const publication = room.localParticipant.getTrackPublication(Track.Source.Microphone);
        const audioTrack = publication?.track;

        if (!audioTrack) {
            console.warn("No microphone track found");
            return;
        }

        if (checked) {
            if (!processor) {
                try {
                    const krisp = KrispNoiseFilter();
                    // @ts-ignore
                    if (!krisp.isSupported()) {
                        console.warn("Krisp not supported");
                        return;
                    }
                    // @ts-ignore
                    const proc = await krisp.createProcessor();
                    // @ts-ignore - livekit types mismatch
                    await audioTrack.setProcessor(proc);
                    setProcessor(proc);
                    // @ts-ignore
                    await proc.enable();
                } catch (e) {
                    console.error("Failed to enable noise cancellation", e);
                    setIsNoiseCancellationEnabled(false);
                }
            } else {
                // @ts-ignore
                await processor.enable();
            }
        } else {
            if (processor) {
                // @ts-ignore
                await processor.disable();
            }
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Mic className="w-4 h-4" /> Microphone
                </h3>
                <select
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={activeMicId}
                    onChange={(e) => setMic(e.target.value)}
                >
                    {micDevices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
                    ))}
                </select>
            </section>

            <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" /> Speakers
                </h3>
                <select
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={activeSpeakerId}
                    onChange={(e) => setSpeaker(e.target.value)}
                >
                    {speakerDevices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
                    ))}
                </select>
            </section>

            <section className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-gray-900">Noise Cancellation</h4>
                        <p className="text-sm text-gray-500">Filter out background noise using AI</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isNoiseCancellationEnabled}
                            onChange={(e) => toggleNoiseCancellation(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </section>
        </div>
    );
}
