import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initNearWallet } from "./lib/near";
import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Initialize NEAR wallet integration
initNearWallet();


createRoot(document.getElementById("root")!).render(<App />);
