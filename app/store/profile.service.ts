export interface UserProfile {
  name: string;
  email: string;
  image: string;       // public URL (display)
  imagePath: string;    // GitHub repo path (delete)
  provider?: string;
  hasPassword?: boolean;
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const res = await fetch("/api/profile");

    if (!res.ok) {
      throw new Error("Failed to fetch profile");
    }

    return res.json();
  },

  async uploadImage(
    file: File
  ): Promise<{ image: string; imagePath: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/profile/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await res.json();

    return {
      image: data.image,
      imagePath: data.imagePath,
    };
  },

  async deleteImage({
    email,
    imageUrl,
  }: {
    email: string;
    imageUrl: string;
  }) {
    const res = await fetch("/api/profile/delete-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        imageUrl,
      }),
    });

    if (!res.ok) {
      throw new Error("Delete failed");
    }
  },
};