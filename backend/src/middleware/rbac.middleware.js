export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required'
                }
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Insufficient permissions'
                }
            });
        }

        next();
    };
};

// Specific role checks
export const isClient = authorize('client');
export const isDesigner = authorize('designer');
export const isManager = authorize('manager', 'admin');
export const isAdmin = authorize('admin');
export const isAffiliate = authorize('affiliate');

// Multiple role authorization
export const isClientOrAdmin = authorize('client', 'admin');
export const isDesignerOrManager = authorize('designer', 'manager', 'admin');
