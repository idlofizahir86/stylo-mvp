// Clothing types and categories
export const CLOTHING_TYPES = [
  { value: 'top', label: 'Top', icon: '👕' },
  { value: 'bottom', label: 'Bottom', icon: '👖' },
  { value: 'dress', label: 'Dress', icon: '👗' },
  { value: 'outerwear', label: 'Outerwear', icon: '🧥' },
  { value: 'shoes', label: 'Shoes', icon: '👟' },
  { value: 'accessories', label: 'Accessories', icon: '👒' },
];

export const CLOTHING_CATEGORIES = [
  { value: 'casual', label: 'Casual', color: 'bg-blue-100 text-blue-800' },
  { value: 'formal', label: 'Formal', color: 'bg-gray-100 text-gray-800' },
  { value: 'sport', label: 'Sport', color: 'bg-green-100 text-green-800' },
  { value: 'party', label: 'Party', color: 'bg-purple-100 text-purple-800' },
  { value: 'work', label: 'Work', color: 'bg-indigo-100 text-indigo-800' },
];

// Pose detection keypoints
export const POSE_KEYPOINTS = [
  'nose',
  'left_eye', 'right_eye',
  'left_ear', 'right_ear',
  'left_shoulder', 'right_shoulder',
  'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist',
  'left_hip', 'right_hip',
  'left_knee', 'right_knee',
  'left_ankle', 'right_ankle'
];

// AR Configuration
export const AR_CONFIG = {
  MIN_DETECTION_CONFIDENCE: 0.5,
  MIN_TRACKING_CONFIDENCE: 0.5,
  SMOOTHING_FACTOR: 0.1,
  CLOTHING_SCALE_FACTOR: 1.2,
};

// Firebase collections
export const COLLECTIONS = {
  WARDROBE: 'wardrobe',
  OUTFITS: 'outfits',
  USERS: 'users',
  TRYON_SESSIONS: 'tryon_sessions',
};

// API Endpoints (for future expansion)
export const API_ENDPOINTS = {
  REMOVE_BG: 'https://api.remove.bg/v1.0/removebg',
  AI_SEGMENTATION: '/api/segment', // Your own API endpoint
};