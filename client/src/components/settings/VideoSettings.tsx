import { useMediaDeviceSelect } from "@livekit/components-react";
import { Video } from "lucide-react";

export function VideoSettings() {
    const { devices: cameraDevices, activeDeviceId: activeCameraId, setActiveMediaDevice: setCamera } =
        useMediaDeviceSelect({ kind: "videoinput" });

    return (
        <div className="flex flex-col gap-6">
            <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Video className="w-4 h-4" /> Camera
                </h3>
                <select
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={activeCameraId}
                    onChange={(e) => setCamera(e.target.value)}
                >
                    {cameraDevices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
                    ))}
                </select>

                <div className="mt-4 p-4 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm h-40">
                    {/* Placeholder for camera preview if needed, or effects select */}
                    Camera Preview (Effects Selection Placeholder)
                </div>
            </section>
        </div>
    );
}
