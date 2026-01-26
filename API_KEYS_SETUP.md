# API Keys Setup for Stylo

## Required APIs for Full Functionality

### 1. Remove.bg API (Background Removal)
- Sign up at: https://www.remove.bg/api
- Get free API key (50 images/month free)
- Add to `.env.local`:

### 2. Firebase (Database & Storage)
- Create project at: https://console.firebase.google.com
- Enable Firestore Database and Storage
- Get configuration from Project Settings
- Add to `.env.local`

### 3. Optional: Clipdrop API (Alternative Background Removal)
- Sign up at: https://clipdrop.co/apis
- Get API key (100 free images)
- Add to `.env.local`:


## Testing Without API Keys

The app will work without API keys using:
- Local storage fallback for wardrobe
- Simple background removal simulation
- Basic pose detection simulation

## Troubleshooting

### Background Removal Not Working:
1. Check API key in `.env.local`
2. Ensure internet connection
3. Try smaller image files (<5MB)

### Pose Detection Issues:
1. Allow camera permissions
2. Ensure good lighting
3. Stand 2-3 meters from camera
4. Wear contrasting clothing