import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { supabase } from "../lib/supabase";

/** ---------- Privacy helpers ---------- **/

function snapToHundredMeters(n) {
  const p = 10 ** 3; // 3 decimals ~110m
  return Math.round(n * p) / p;
}

function jitter(lat, lng, meters = 35) {
  const dLat = (meters / 111320) * (Math.random() - 0.5) * 2;
  const dLng =
    (meters / (111320 * Math.cos((lat * Math.PI) / 180))) *
    (Math.random() - 0.5) * 2;
  return [lat + dLat, lng + dLng];
}

function transformCoords(lat, lng, mode) {
  if (mode === "precise") return [lat, lng];
  let lat2 = snapToHundredMeters(lat);
  let lng2 = snapToHundredMeters(lng);
  [lat2, lng2] = jitter(lat2, lng2, 30);
  return [lat2, lng2];
}

/** ---------- Avatar marker ---------- **/
function avatarIcon(url, size = 56) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;height:${size}px;border-radius:9999px;
        overflow:hidden;box-shadow:0 0 0 2px rgba(255,255,255,.6);
      ">
        <img src="${url}" style="width:100%;height:100%;object-fit:cover"/>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export default function MapPage() {
  const [meId] = useState(() => crypto.randomUUID());
  const [precision, setPrecision] = useState(() => {
    return localStorage.getItem("stiffies.locPrecision") || "fuzzy";
  });

  const [me, setMe] = useState(null);     // shown coords
  const [raw, setRaw] = useState(null);   // raw GPS
  const [others, setOthers] = useState([]); // from DB

  const meIcon = useMemo(() => avatarIcon("https://i.pravatar.cc/200?img=5", 64), []);

  // Initial load
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("live_locations")
        .select("*")
        .order("updated_at", { ascending: false });
      if (!error && data) setOthers(data);
      if (error) console.error(error);
    })();
  }, []);

  // Realtime subscribe
  useEffect(() => {
    const ch = supabase
      .channel("live_locations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_locations" },
        (payload) => {
          const row = payload.new ?? payload.old;
          setOthers((prev) => {
            if (payload.eventType === "DELETE") return prev.filter((r) => r.id !== row.id);
            const i = prev.findIndex((r) => r.id === row.id);
            if (i === -1) return [row, ...prev];
            const copy = [...prev];
            copy[i] = row;
            return copy;
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // Watch geolocation and upsert transformed coords
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation not available");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setRaw({ lat, lng });

        const [tLat, tLng] = transformCoords(lat, lng, precision);
        setMe({ lat: tLat, lng: tLng });

        const { error } = await supabase.from("live_locations").upsert({
          id: meId,
          username: "You",
          avatar: "https://i.pravatar.cc/200?img=5",
          lat: tLat,
          lng: tLng,
          updated_at: new Date().toISOString(),
        });
        if (error) console.error("upsert error:", error);
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [meId, precision]);

  const center = me ? [me.lat, me.lng] : [37.7749, -122.4194];
  const otherIcon = (url) => avatarIcon(url || "https://i.pravatar.cc/200?img=14", 56);

  function togglePrecision() {
    const next = precision === "fuzzy" ? "precise" : "fuzzy";
    setPrecision(next);
    localStorage.setItem("stiffies.locPrecision", next);

    if (raw) {
      const [tLat, tLng] = transformCoords(raw.lat, raw.lng, next);
      setMe({ lat: tLat, lng: tLng });
      supabase.from("live_locations").upsert({
        id: meId,
        username: "You",
        avatar: "https://i.pravatar.cc/200?img=5",
        lat: tLat,
        lng: tLng,
        updated_at: new Date().toISOString(),
      }).then(({ error }) => error && console.error(error));
    }
  }

  return (
    <div className="h-[100vh] w-full">
      <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {me && (
          <Marker position={[me.lat, me.lng]} icon={meIcon}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">You</div>
                <div>Mode: <span className="uppercase">{precision}</span></div>
                {raw && (
                  <div className="mt-1 opacity-70">
                    <div>Raw: {raw.lat.toFixed(5)}, {raw.lng.toFixed(5)}</div>
                    <div>Shown: {me.lat.toFixed(5)}, {me.lng.toFixed(5)}</div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {others
          .filter((u) => u.id !== meId && typeof u.lat === "number" && typeof u.lng === "number")
          .map((u) => (
            <Marker key={u.id} position={[u.lat, u.lng]} icon={otherIcon(u.avatar)}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{u.username || "User"}</div>
                  <a className="text-blue-600 underline" href={`/chat/${u.id}`}>Open chat</a>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Fixed top-right toggle (high z-index) */}
      <div className="fixed right-4 top-4 z-[9999]">
        <button
          onClick={togglePrecision}
          className="rounded-full bg-black/80 px-4 py-2 text-xs font-semibold text-white backdrop-blur border border-white/20 hover:bg-black"
          title="Toggle location precision"
        >
          Location: {precision === "fuzzy" ? "Approximate (~100m)" : "Precise (GPS)"}
        </button>
      </div>
    </div>
  );
}
