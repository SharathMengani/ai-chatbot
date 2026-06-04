import axios from "axios";
import api from "../lib/api";

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
    const res = await api.get("/profile");

    return res.data;
  },

  async uploadImage(
    file: File
  ): Promise<{ image: string; imagePath: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const res = await api.post("/profile/upload-image", formData);
    return {
      image: res.data.image,
      imagePath: res.data.imagePath,
    };
  },



  async deleteImage({
    email,
    imageUrl,
  }: {
    email: string;
    imageUrl: string;
  }): Promise<{ message: string }> {
    const res = await api.post(
      "/profile/delete-image",
      {
        email,
        imageUrl,
      }
    );

    return res.data;
  }
};