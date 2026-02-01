import { create } from 'zustand';
import { brandAssetsAPI } from '../api/brandAssets';

const useBrandAssetStore = create((set, get) => ({
    brandAssets: [],
    isLoading: false,
    error: null,

    // Fetch brand assets for a specific client
    fetchBrandAssets: async (clientId) => {
        set({ isLoading: true, error: null });
        try {
            const data = await brandAssetsAPI.getBrandAssets(clientId);
            set({
                brandAssets: data.data,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.message || 'Failed to fetch brand assets',
                isLoading: false,
            });
        }
    },

    // Add a new brand asset
    addBrandAsset: async (formData) => {
        set({ isLoading: true, error: null });
        try {
            const data = await brandAssetsAPI.create(formData);
            set((state) => ({
                brandAssets: [data.data, ...state.brandAssets],
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error.message || 'Failed to add brand asset';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Update an existing brand asset
    updateBrandAsset: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await brandAssetsAPI.update(id, data);
            set((state) => ({
                brandAssets: state.brandAssets.map((asset) =>
                    asset.id === id ? response.data : asset
                ),
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error.message || 'Failed to update brand asset';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Delete a brand asset
    deleteBrandAsset: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await brandAssetsAPI.delete(id);
            set((state) => ({
                brandAssets: state.brandAssets.filter((asset) => asset.id !== id),
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error.message || 'Failed to delete brand asset';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useBrandAssetStore;
