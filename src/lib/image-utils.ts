/**
 * Utility functions for handling image uploads and processing
 */

/**
 * Resizes an image to a maximum width and height while maintaining aspect ratio
 * @param file The image file to resize
 * @param maxWidth The maximum width of the resized image
 * @param maxHeight The maximum height of the resized image
 * @returns A promise that resolves to the resized image as a Blob
 */
export async function resizeImage(
  file: File,
  maxWidth = 300,
  maxHeight = 300
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      
      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        file.type || 'image/jpeg',
        0.9 // Quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Load image from file
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Converts a Blob to a base64 string
 * @param blob The Blob to convert
 * @returns A promise that resolves to the base64 string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => {
      reject(new Error('Failed to convert blob to base64'));
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Processes an image file by resizing it and converting to base64
 * @param file The image file to process
 * @returns A promise that resolves to the processed image data
 */
export async function processImageFile(file: File): Promise<{
  base64: string;
  mimeType: string;
  originalName: string;
}> {
  try {
    const resizedBlob = await resizeImage(file);
    const base64 = await blobToBase64(resizedBlob);
    
    return {
      base64,
      mimeType: file.type || 'image/jpeg',
      originalName: file.name,
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}
