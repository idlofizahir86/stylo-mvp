# Stylo MVP - Digital Wardrobe & Virtual Try-On

Stylo adalah platform wardrobe digital dengan fitur personal mix & match dan virtual try-on menggunakan teknologi AR dan pose detection.

## ✨ Fitur Utama

### 1. Digital Wardrobe
- Upload pakaian dengan background removal otomatis (Remove.bg API)
- Organize by type, color, dan category
- Penyimpanan permanen dengan Firebase Firestore

### 2. Mix & Match
- Buat kombinasi outfit dari wardrobe digital
- Simpan outfit favorit
- Random outfit generator

### 3. Virtual Try-On
- Live camera AR dengan pose detection (MediaPipe)
- Photo upload untuk try-on
- Real-time clothing positioning dengan Three.js
- Save snapshot hasil try-on

## 🚀 Teknologi yang Digunakan

- **Frontend**: React 18, Vite, Tailwind CSS
- **3D & AR**: Three.js, @react-three/fiber
- **Pose Detection**: MediaPipe, TensorFlow.js
- **Background Removal**: Remove.bg API
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS 3

## 📦 Instalasi

1. Clone repository:
```bash
git clone <your-repo-url>
cd stylo-mvp-new