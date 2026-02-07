import { create } from 'zustand';
import { designerAPI } from '../api/designer';

const useDesignerStore = create((set, get) => ({
    dashboardStats: null,
    tasks: [],
    currentTask: null,
    taskStats: null,
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
    },

    // Fetch dashboard statistics
    fetchDashboardStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await designerAPI.getDashboardStats();
            set({
                dashboardStats: data.data,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.message || 'Failed to fetch dashboard stats',
                isLoading: false,
            });
        }
    },

    // Fetch my tasks
    fetchMyTasks: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const data = await designerAPI.getMyTasks(params);
            set({
                tasks: data.data.tasks || data.data,
                pagination: data.data.pagination || get().pagination,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.message || 'Failed to fetch tasks',
                isLoading: false,
            });
        }
    },

    // Fetch task by ID
    fetchTaskById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const data = await designerAPI.getTaskById(id);
            set({
                currentTask: data.data,
                isLoading: false,
            });
            return data.data;
        } catch (error) {
            set({
                error: error.message || 'Failed to fetch task',
                isLoading: false,
            });
            return null;
        }
    },

    // Start task
    startTask: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const data = await designerAPI.startTask(id);
            set((state) => ({
                tasks: state.tasks.map((task) =>
                    task.id === id ? data.data : task
                ),
                currentTask: state.currentTask?.id === id ? data.data : state.currentTask,
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error.message || 'Failed to start task';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Submit for review
    submitForReview: async (id, notes, workLink) => {
        set({ isLoading: true, error: null });
        try {
            const data = await designerAPI.submitForReview(id, notes, workLink);
            set((state) => ({
                tasks: state.tasks.map((task) =>
                    task.id === id ? data.data : task
                ),
                currentTask: state.currentTask?.id === id ? data.data : state.currentTask,
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error.message || 'Failed to submit for review';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Update task status
    updateTaskStatus: async (id, status, notes = null) => {
        set({ isLoading: true, error: null });
        try {
            const data = await designerAPI.updateTaskStatus(id, status, notes);
            set((state) => ({
                tasks: state.tasks.map((task) =>
                    task.id === id ? data.data : task
                ),
                currentTask: state.currentTask?.id === id ? data.data : state.currentTask,
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            const errorMessage = error.message || 'Failed to update task status';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Upload design files
    uploadDesignFiles: async (requestId, files) => {
        set({ isLoading: true, error: null });
        try {
            const data = await designerAPI.uploadDesignFiles(requestId, files);
            return { success: true, data: data.data };
        } catch (error) {
            const errorMessage = error.message || 'Failed to upload files';
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
        }
    },

    // Fetch task statistics
    fetchTaskStats: async () => {
        try {
            const data = await designerAPI.getTaskStats();
            set({ taskStats: data.data });
        } catch (error) {
            console.error('Failed to fetch task stats:', error);
        }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Clear current task
    clearCurrentTask: () => set({ currentTask: null }),
}));

export default useDesignerStore;
