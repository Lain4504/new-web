import { Room, VideoPresets } from "livekit-client";

const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
const liveKitHostUrl = import.meta.env.VITE_LIVEKIT_URL;

export class LiveKitService {
  private room: Room;

  constructor() {
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
      publishDefaults: {
        videoSimulcastLayers: [VideoPresets.h540, VideoPresets.h216],
      },
    });
  }

  async connect(
    roomId: string,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      const res = await fetch(
        `${serverUrl}/livekit/token?room=${encodeURIComponent(
          roomId
        )}&identity=${encodeURIComponent(userId)}&name=${encodeURIComponent(
          userName
        )}`
      );
      const { token } = await res.json();
      await this.room.connect(liveKitHostUrl, token);
    } catch (error) {
      console.error("Failed to connect to LiveKit:", error);
      throw new Error("Connection failed");
    }
  }

  disconnect(): void {
    this.room.disconnect();
  }

  getRoom(): Room {
    return this.room;
  }

  async sendReaction(emoji: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify({ type: "reaction", emoji }));
    await this.room.localParticipant.publishData(data, {
      reliable: false,
      topic: "reaction",
    });
  }

  async setHandRaised(raised: boolean) {
    await this.room.localParticipant.setMetadata(
      JSON.stringify({ handRaised: raised })
    );
  }
}
