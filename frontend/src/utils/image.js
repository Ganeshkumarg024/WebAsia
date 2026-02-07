export const getAvatarUrl = (user) => {
    if (!user) return null;

    // Handle photoUrl (often from Google OAuth)
    if (user.photoUrl && (user.photoUrl.startsWith('http') || user.photoUrl.startsWith('https'))) {
        return user.photoUrl;
    }

    // Handle avatar (often from local or Cloudinary uploads)
    if (user.avatar) {
        if (user.avatar.startsWith('http') || user.avatar.startsWith('https')) {
            return user.avatar;
        }
        // If it starts with /uploads, it's a local relative path
        if (user.avatar.startsWith('/uploads')) {
            return `${import.meta.env.VITE_API_URL}${user.avatar}`;
        }
        // Otherwise, it might be a Cloudinary public ID or something else,
        // but for now, we assume absolute URLs are handled above.
        return user.avatar;
    }

    // Fallback to photoUrl even if it might be relative
    if (user.photoUrl) {
        if (user.photoUrl.startsWith('http') || user.photoUrl.startsWith('https')) {
            return user.photoUrl;
        }
        return `${import.meta.env.VITE_API_URL}${user.photoUrl}`;
    }

    return null;
};
