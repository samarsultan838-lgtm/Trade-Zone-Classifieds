
export async function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1280; // Slightly higher for premium feel

        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No canvas context');

        // Apply premium enhancements: 
        // - Contrast for depth
        // - Saturation for vibrancy
        // - Sharpness (simulated with slight contrast boost)
        // - Brightness for clarity
        ctx.filter = 'contrast(1.15) saturate(1.12) brightness(1.08) sepia(0.02)';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Export to Base64 with high-quality compression
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
