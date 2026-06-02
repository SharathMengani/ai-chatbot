export interface UserProfile {
  name: string;
  email: string;
  image?: string;
  provider?: string;
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const res = await fetch("/api/profile");

    if (!res.ok) {
      throw new Error("Failed to fetch profile");
    }

    return res.json();
  },

  async uploadImage(file: File): Promise<string> {
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

    return data.image;
  },

  async deleteImage(): Promise<void> {
    const res = await fetch("/api/profile/delete-image", {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete image");
    }
  },
};