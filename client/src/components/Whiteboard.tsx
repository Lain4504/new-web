import { useSync } from "@tldraw/sync";
import { useState } from "react";
import {
  AssetRecordType,
  getHashForString,
  type TLAssetStore,
  type TLBookmarkAsset,
  Tldraw,
  uniqueId,
  type TLUserPreferences,
  useTldrawUser,
} from "tldraw";
import { useSyncRoomContext } from "../contexts/SyncRoomContext";
import "tldraw/tldraw.css";
import "../styles/tldraw-custom.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

// Convert HTTP URL to WebSocket URL
const getWebSocketUrl = (serverUrl: string) => {
  const url = new URL(serverUrl);
  // Replace http/https with ws/wss
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString().replace(/\/$/, ""); // Remove trailing slash
};

const WS_BASE_URL = getWebSocketUrl(SERVER_URL);

export function Whiteboard() {
  const { roomId, userId, userName, userColor } = useSyncRoomContext();
  const [userPreferences] = useState<TLUserPreferences>({
    id: userId,
    name: userName,
    color: userColor,
  });

  // Create a store connected to multiplayer.
  const store = useSync({
    // We need to know the websocket's URI...
    uri: `${WS_BASE_URL}/tldraw/connect/${roomId}`,
    // ...and how to handle static assets like images & videos
    assets: multiplayerAssets,
    userInfo: userPreferences,
  });

  const user = useTldrawUser({ userPreferences });

  return (
    <>
      <div className="h-full w-full bg-white shadow-lg overflow-hidden">
        <Tldraw
          className="tldraw__editor"
          // we can pass the connected store into the Tldraw component which will handle
          // loading states & enable multiplayer UX like cursors & a presence menu
          store={store}
          user={user}
          onMount={(editor) => {
            // @ts-expect-error: Exposing editor instance on window for debugging
            window.editor = editor;
            // when the editor is ready, we need to register out bookmark unfurling service
            editor.registerExternalAssetHandler("url", unfurlBookmarkUrl);
          }}
        />
      </div>
    </>
  );
}

// How does our server handle assets like images and videos?
const multiplayerAssets: TLAssetStore = {
  // to upload an asset, we prefix it with a unique id, POST it to our worker, and return the URL
  async upload(_asset, file) {
    const id = uniqueId();

    const objectName = `${id}-${file.name}`;
    const url = `${SERVER_URL}/tldraw/uploads/${encodeURIComponent(objectName)}`;

    const response = await fetch(url, {
      method: "PUT",
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload asset: ${response.statusText}`);
    }

    return { src: url };
  },
  // to retrieve an asset, we can just use the same URL. you could customize this to add extra
  // auth, or to serve optimized versions / sizes of the asset.
  resolve(asset) {
    return asset.props.src;
  },
};

// How does our server handle bookmark unfurling?
async function unfurlBookmarkUrl({
  url,
}: {
  url: string;
}): Promise<TLBookmarkAsset> {
  const asset: TLBookmarkAsset = {
    id: AssetRecordType.createId(getHashForString(url)),
    typeName: "asset",
    type: "bookmark",
    meta: {},
    props: {
      src: url,
      description: "",
      image: "",
      favicon: "",
      title: "",
    },
  };

  try {
    const response = await fetch(
      `${SERVER_URL}/tldraw/unfurl?url=${encodeURIComponent(url)}`
    );
    const data = await response.json();

    asset.props.description = data?.description ?? "";
    asset.props.image = data?.image ?? "";
    asset.props.favicon = data?.favicon ?? "";
    asset.props.title = data?.title ?? "";
  } catch (e) {
    console.error(e);
  }

  return asset;
}
