
export async function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // STRICT CONSTRAINTS: 
        // 800px is optimal for mobile-first classifieds.
        // Keeping string length minimal to fit into 5MB localStorage limits.
        const maxDim = 800; 

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

        // Apply slight visual enhancements to the compressed preview
        ctx.filter = 'contrast(1.05) brightness(1.02) saturate(1.02)';
        ctx.drawImage(img, 0, 0, width, height);
        
        // 0.5 Quality creates highly compact Base64 strings (~50-80kb per image)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
