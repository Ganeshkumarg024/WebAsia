export const getAvatarUrl = (user) => {
    if (!user) return null;

    // Handle photoUrl (often from Google OAuth)
    if (user.photoUrl && (user.photoUrl.startsWith('http') || user.photoUrl.startsWith('https'))) {
        return user.photoUrl;
    }

    // Handle avatar (often from local uploads)
    if (user.avatar) {
        if (user.avatar.startsWith('http') || user.avatar.startsWith('https')) {
            return user.avatar;
        }
        return `${import.meta.env.VITE_API_URL}${user.avatar}`;
    }

    // Fallback to photoUrl even if it might be relative
    if (user.photoUrl) {
        return `${import.meta.env.VITE_API_URL}${user.photoUrl}`;
    }

    return null;
};
