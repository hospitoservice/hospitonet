import { storage, ID } from '@/src/lib/appwriteConfig';

// Create a bucket named "profile-images" in your Appwrite dashboard
// and set its permissions to allow file creation for "Any" role.
const BUCKET_ID = 'profile-images';

class ImageUploadService {
  async uploadProfileImage(file: File): Promise<string> {
    const compressed = await this.compressImage(file, 600);
    const result = await storage.createFile(BUCKET_ID, ID.unique(), compressed);
    const url = storage.getFileView(BUCKET_ID, result.$id);
    return url.toString();
  }

  private compressImage(file: File, maxPx: number): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
        img.onload = () => {
          const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file),
            'image/jpeg',
            0.82
          );
        };
      };
      reader.readAsDataURL(file);
    });
  }
}

export default new ImageUploadService();
