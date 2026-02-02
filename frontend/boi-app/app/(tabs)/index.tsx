import { useEffect, useState } from "react";
import { Text, View } from "react-native";

// cmd -> ipconfig
// Wireless LAN adapter Wi-Fi: IPv4 Address
const API_BASE = "http://{YOUR_IP}:8080";

export default function TabOneScreen() {
  const [msg, setMsg] = useState("loading...");

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.text())
      .then(setMsg)
      .catch((e) => setMsg("error: " + (e?.message ?? String(e))));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "white", justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "black", fontSize: 24 }}>{msg}</Text>
    </View>
  );
}