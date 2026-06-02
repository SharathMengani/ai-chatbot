import { create } from "zustand";
import { profileService, UserProfile } from "./profile.service";

interface ProfileState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  uploadImage: (file: File) => Promise<void>;
  deleteImage: () => Promise<void>;

  clearProfile: () => void;
}

export const useProfileStore =
  create<ProfileState>((set) => ({
    user: null,
    loading: false,
    error: null,

    fetchProfile: async () => {
      try {
        set({ loading: true });

        const profile =
          await profileService.getProfile();

        set({
          user: profile,
          loading: false,
        });
      } catch (error) {
        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Something went wrong",
        });
      }
    },

    uploadImage: async (file) => {
      const image =
        await profileService.uploadImage(file);

      set((state) => ({
        user: state.user
          ? {
              ...state.user,
              image,
            }
          : null,
      }));
    },

    deleteImage: async () => {
      await profileService.deleteImage();

      set((state) => ({
        user: state.user
          ? {
              ...state.user,
              image: "",
            }
          : null,
      }));
    },

    clearProfile: () =>
      set({
        user: null,
        error: null,
        loading: false,
      }),
  }));