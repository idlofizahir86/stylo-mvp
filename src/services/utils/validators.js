export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      message: 'Please upload a valid image file (JPEG, PNG, WebP, GIF)'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      message: 'Image size should be less than 10MB'
    };
  }

  return { isValid: true, message: '' };
};

export const validateHexColor = (color) => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};