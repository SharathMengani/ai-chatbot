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

export const useProfileStore = create<ProfileState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    try {
      set({ loading: true, error: null });

      const profile = await profileService.getProfile();

      set({
        user: profile,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Something went wrong",
      });
    }
  },

  uploadImage: async (file: File) => {
    try {
      set({ loading: true, error: null });

      const image = await profileService.uploadImage(file);

      set((state) => ({
        user: state.user
          ? {
              ...state.user,
              image,
            }
          : null,
        loading: false,
      }));
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  },

  deleteImage: async () => {
    try {
      const user = get().user;

      if (!user?.image) return;

      // ⚠️ you MUST store filePath in DB for this to work properly
      const filePath = user.image; // recommended field

      await profileService.deleteImage({ email: user.email, filePath });

      set((state) => ({
        user: state.user
          ? {
              ...state.user,
              image: undefined,
              imagePath: undefined,
            }
          : null,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Delete failed",
      });
    }
  },

  clearProfile: () =>
    set({
      user: null,
      error: null,
      loading: false,
    }),
}));