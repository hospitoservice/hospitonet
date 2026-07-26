// Backed by MongoDB GridFS on user-service (UserImageController) — replaces
// the previous direct-to-Appwrite upload now that userdb has its own file store.
const UPLOAD_URL = '/api/users/image';

class ImageUploadService {
  async uploadProfileImage(file: File): Promise<string> {
    const compressed = await this.compressImage(file, 600);

    const formData = new FormData();
    formData.append('file', compressed);

    const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`Failed to upload profile image: ${res.status}`);

    const { url } = await res.json();
    return url;
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
