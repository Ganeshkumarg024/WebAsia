import { Request, User, RequestActivity, File } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Get all requests for admin
 * GET /api/admin/requests
 */
export const getAllRequests = async (req, res) => {
    try {
        const { status, serviceType, priority, search } = req.query;

        const where = {};

        // Only add filters if they're not "All" values
        if (status && !status.startsWith('All')) where.status = status;
        if (serviceType && !serviceType.startsWith('All')) where.serviceType = serviceType;
        if (priority && !priority.startsWith('All')) where.priority = priority;

        if (search && search.trim()) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const requests = await Request.findAll({
            where,
            include: [
                { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
                { model: User, as: 'designer', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            data: {
                requests,
                total: requests.length
            }
        });
    } catch (error) {
        console.error('Get all requests error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch requests'
            }
        });
    }
};

export const getRequestDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await Request.findByPk(id, {
            include: [
                { model: User, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
                { model: User, as: 'designer', attributes: ['id', 'firstName', 'lastName', 'email'], required: false },
                { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'], required: false }
            ]
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Request not found'
                }
            });
        }

        // Get files separately to avoid association errors
        let files = [];
        try {
            files = await File.findAll({
                where: {
                    requestId: id,
                    isActive: true
                },
                include: [
                    { model: User, as: 'uploader', attributes: ['id', 'firstName', 'lastName', 'role'], required: false }
                ]
            });
        } catch (fileError) {
            console.error('Error fetching files:', fileError);
            // Continue without files if there's an error
        }

        // Get activity timeline
        const activities = await RequestActivity.findAll({
            where: { requestId: id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'role'], required: false }
            ],
            order: [['created_at', 'DESC']],
            limit: 50
        });

        // Add files to request object
        const requestData = request.toJSON();
        requestData.files = files;

        res.json({
            success: true,
            data: {
                request: requestData,
                activities
            }
        });
    } catch (error) {
        console.error('Get request details error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch request details'
            }
        });
    }
};

/**
 * Update request status (admin only)
 * PUT /api/admin/requests/:id/status
 */
export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        const request = await Request.findByPk(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Request not found'
                }
            });
        }

        const previousStatus = request.status;
        const updates = { status };

        // Update timestamps based on status
        if (status === 'in_progress' && !request.startedAt) {
            updates.startedAt = new Date();
        }

        if (status === 'completed' && !request.completedAt) {
            updates.completedAt = new Date();
        }

        await request.update(updates);

        // Create activity
        await RequestActivity.create({
            requestId: request.id,
            userId: req.user.id,
            activityType: 'status_changed',
            description: note || `Status changed from ${previousStatus} to ${status}`,
            metadata: { previousStatus, newStatus: status, changedBy: 'admin' },
            isSystemGenerated: false
        });

        res.json({
            success: true,
            message: 'Request status updated successfully',
            data: request
        });
    } catch (error) {
        console.error('Update request status error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to update request status'
            }
        });
    }
};

/**
 * Assign designer to request
 * PUT /api/admin/requests/:id/assign-designer
 */
export const assignDesigner = async (req, res) => {
    try {
        const { id } = req.params;
        const { designerId } = req.body;

        const request = await Request.findByPk(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Request not found'
                }
            });
        }

        // Verify designer exists and has designer role
        const designer = await User.findOne({
            where: {
                id: designerId,
                role: 'designer',
                status: 'active'
            }
        });

        if (!designer) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_DESIGNER',
                    message: 'Invalid designer or designer not active'
                }
            });
        }

        const previousDesignerId = request.assignedDesignerId;
        await request.update({ assignedDesignerId: designerId });

        // Create activity
        await RequestActivity.create({
            requestId: request.id,
            userId: req.user.id,
            activityType: 'designer_assigned',
            description: `Designer assigned: ${designer.firstName} ${designer.lastName}`,
            metadata: {
                previousDesignerId,
                newDesignerId: designerId,
                designerName: `${designer.firstName} ${designer.lastName}`
            },
            isSystemGenerated: false
        });

        // Fetch updated request with designer info
        const updatedRequest = await Request.findByPk(id, {
            include: [
                { model: User, as: 'designer', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ]
        });

        res.json({
            success: true,
            message: 'Designer assigned successfully',
            data: updatedRequest
        });
    } catch (error) {
        console.error('Assign designer error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to assign designer'
            }
        });
    }
};

/**
 * Assign manager to request
 * PUT /api/admin/requests/:id/assign-manager
 */
export const assignManager = async (req, res) => {
    try {
        const { id } = req.params;
        const { managerId } = req.body;

        const request = await Request.findByPk(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Request not found'
                }
            });
        }

        // Verify manager exists and has manager role
        const manager = await User.findOne({
            where: {
                id: managerId,
                role: 'manager',
                status: 'active'
            }
        });

        if (!manager) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_MANAGER',
                    message: 'Invalid manager or manager not active'
                }
            });
        }

        const previousManagerId = request.assignedManagerId;
        await request.update({ assignedManagerId: managerId });

        // Create activity
        await RequestActivity.create({
            requestId: request.id,
            userId: req.user.id,
            activityType: 'manager_assigned',
            description: `Manager assigned: ${manager.firstName} ${manager.lastName}`,
            metadata: {
                previousManagerId,
                newManagerId: managerId,
                managerName: `${manager.firstName} ${manager.lastName}`
            },
            isSystemGenerated: false
        });

        // Fetch updated request with manager info
        const updatedRequest = await Request.findByPk(id, {
            include: [
                { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ]
        });

        res.json({
            success: true,
            message: 'Manager assigned successfully',
            data: updatedRequest
        });
    } catch (error) {
        console.error('Assign manager error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to assign manager'
            }
        });
    }
};

/**
 * Add admin note to request
 * POST /api/admin/requests/:id/notes
 */
export const addRequestNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note, isInternal = true } = req.body;

        if (!note || note.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Note cannot be empty'
                }
            });
        }

        const request = await Request.findByPk(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Request not found'
                }
            });
        }

        // Create activity
        const activity = await RequestActivity.create({
            requestId: request.id,
            userId: req.user.id,
            activityType: isInternal ? 'internal_note' : 'note_added',
            description: note,
            metadata: { isInternal, addedBy: 'admin' },
            isSystemGenerated: false
        });

        // Fetch activity with user info
        const activityWithUser = await RequestActivity.findByPk(activity.id, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'role'] }
            ]
        });

        res.json({
            success: true,
            message: 'Note added successfully',
            data: activityWithUser
        });
    } catch (error) {
        console.error('Add request note error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to add note'
            }
        });
    }
};

/**
 * Get available designers
 * GET /api/admin/designers/available
 */
export const getAvailableDesigners = async (req, res) => {
    try {
        const designers = await User.findAll({
            where: {
                role: 'designer',
                status: 'active'
            },
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            order: [['firstName', 'ASC']]
        });

        res.json({
            success: true,
            data: designers
        });
    } catch (error) {
        console.error('Get available designers error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch designers'
            }
        });
    }
};

/**
 * Get available managers
 * GET /api/admin/managers/available
 */
export const getAvailableManagers = async (req, res) => {
    try {
        const managers = await User.findAll({
            where: {
                role: 'manager',
                status: 'active'
            },
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            order: [['firstName', 'ASC']]
        });

        res.json({
            success: true,
            data: managers
        });
    } catch (error) {
        console.error('Get available managers error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch managers'
            }
        });
    }
};

/**
 * Get request timeline/activity
 * GET /api/admin/requests/:id/timeline
 */
export const getRequestTimeline = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await Request.findByPk(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Request not found'
                }
            });
        }

        const activities = await RequestActivity.findAll({
            where: { requestId: id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'role', 'email'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        console.error('Get request timeline error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch request timeline'
            }
        });
    }
};
