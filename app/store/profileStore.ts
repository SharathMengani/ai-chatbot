import { create } from "zustand";
import { profileService, UserProfile } from "./profile.service";

interface ProfileState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  fetched: boolean,

  fetchProfile: () => Promise<void>;
  uploadImage: (file: File) => Promise<void>;
  deleteImage: () => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  fetched: false,

  fetchProfile: async () => {
    if (get().fetched) return; // ✅ prevents multiple calls
    try {
      set({ loading: true, error: null });

      const profile = await profileService.getProfile();

      set({
        user: profile,
        loading: false,
        fetched: true,
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

      const { image, imagePath } = await profileService.uploadImage(file);

      set((state) => ({
        user: state.user
          ? {
            ...state.user,
            image,
            imagePath,
          }
          : {
            name: "",
            email: "",
            image,
            imagePath,
          },
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

      set({ loading: true, error: null });

      await profileService.deleteImage({
        email: user.email,
        imageUrl: user.image,
      });

      set((state: any) => {
        if (!state.user) return state;

        const { image, imagePath, ...rest } = state.user;

        return {
          user: {
            ...rest,
            image: undefined,
            imagePath: undefined,
          },
          loading: false,
        };
      });
    } catch (error) {
      set({
        loading: false,
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