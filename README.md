# 🚨 Sathi.ai — Tactical Emergency Intelligence

### *"Built for the Worst Moments"*

Sathi.ai is an **autonomous, local-first emergency intelligence system** designed to function in **high-risk, low-connectivity scenarios**. It delivers real-time assistance during crises using **on-device AI**, ensuring **zero dependency on cloud infrastructure**.

---

## 🧠 Overview

Sathi.ai acts as a **personal emergency companion**, capable of:

* Understanding voice commands like *"SOS"* or *"Help"*
* Providing **instant tactical guidance**
* Locating nearby emergency services
* Sending distress signals without internet
* Operating entirely **offline**

---

## ⚙️ Core Architecture

### 🔹 Edge Intelligence

* Powered by `@runanywhere/web` and `web-llamacpp`
* Fully **on-device inference**:

  * Speech-to-Text (STT)
  * Language Model (LLM)
  * Text-to-Speech (TTS)

### 🔹 Zero-Cloud Protocol

* No external API calls required
* All processing is **local and encrypted**
* Works in **network blackout scenarios**

### 🔹 Resilient UI/UX

* Emergency-focused **Alert Mode (Dark/Red Theme)**
* HUD-style **model loading indicators**
* Optimized for **low visibility + panic situations**

---

## 🔧 Feature Modules

### 🎙️ Voice Protocol

* Uses `VoicePipeline` + `AudioCapture`
* Hands-free activation via keywords:

  * `"SOS"`
  * `"Emergency"`
* Automatically triggers safety workflows

---

### 📡 Tactical Mesh

* Built with **Web Bluetooth (BLE)**
* Detects nearby Sathi-enabled devices (~50m range)
* Enables **peer-to-peer emergency signaling**
* Works without internet or mobile network

---

### 🗺️ Map Intelligence

* Powered by **Overpass API + LocalStorage**
* Offline-first emergency mapping
* Detects nearby:

  * 🏥 Hospitals
  * 🚓 Police Stations
  * 🚇 Transport hubs
* Includes **compass + heading support (iOS compatible)**

---

### 💬 Rapid Triage Chat

* Uses `TextGeneration` via LlamaCpp
* Ultra-fast (<100ms) emergency responses
* Outputs:

  * Exactly **3-step actionable instructions**
  * Short, clear, and panic-friendly

---

### 🚨 Automated SOS

* Uses **Geolocation + SMS URI**
* Sends emergency messages with:

  * 📍 Live GPS coordinates
  * 🔗 Google Maps link
* Works via **native SMS fallback**

---

## 🧩 Emergency Intelligence System

### 🧠 Intent Detection

Automatically classifies user input into:

* 🏥 Medical
* 🚨 Safety
* 🌪️ Disaster
* 🧘 Mental Health

---

### ⚡ The "3-Step Rule"

* Every response follows:

  * Exactly **3 steps**
  * Max **40 words**
  * Imperative, actionable instructions

---

### 🛡️ Safety Safeguards

* Filters harmful advice
* Prioritizes medically safe practices:

  * RICE method for injuries
  * Controlled breathing for panic
* Designed for **real-world reliability**

---

## 🛠️ Tech Stack

### Frontend

* React
* Tailwind CSS
* Framer Motion

### AI & Processing

* `@runanywhere/web`
* `web-llamacpp`
* VAD (Voice Activity Detection)

### Hardware / APIs

* Web Bluetooth (BLE)
* Geolocation API
* Overpass API

### UI Components

* Lucide Icons:

  * Mic
  * Cpu
  * HeartPulse
  * ShieldAlert
  * Radio

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/Anuj-165/Sathi.AI.git

# Navigate to project
cd sathi-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📌 Use Cases

* 🚗 Road accidents
* 🌊 Natural disasters
* 🧍 Personal safety threats
* 🧠 Panic attacks
* 📡 Network outage scenarios

---

## 🔒 Privacy First

* 100% **offline capable**
* No user data leaves the device
* Fully **secure + encrypted local inference**

---

## 🧪 Project Status

> 🟢 **SYSTEM STATUS: MAX_GAIN**
> 🔗 **SATHI NEURAL LINK: ACTIVE**

All modules are fully integrated and operational under simulated emergency conditions.

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repo, raise issues, or submit pull requests.

---

## 📄 License

MIT License

---

## 💡 Vision

To create a **resilient, intelligent, and decentralized emergency system** that works when everything else fails.

---

### ⚠️ *Because in critical moments, seconds matter — and networks fail.*
