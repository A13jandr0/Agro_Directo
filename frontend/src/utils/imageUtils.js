export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const handleImageError = (e) => {
  e.target.style.display = 'none';
  if (e.target.nextElementSibling) {
    e.target.nextElementSibling.style.display = 'flex';
  }
};
