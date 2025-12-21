import Doubt from '../models/doubt.model.js';
import Answer from '../models/answer.model.js';
import Comment from '../models/comment.model.js';
import User from '../models/user.model.js';

export const createDoubt = async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, description, tags } = req.body;

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const doubt = new Doubt({
      title,
      description,
      tags: tags.map(tag => tag.toLowerCase()),
      juniorId: userId,
      status: 'open'
    });

    await doubt.save();

    res.status(201).json({
      success: true,
      message: 'Doubt posted successfully',
      data: doubt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating doubt',
      error: error.message
    });
  }
};

export const getDoubtById = async (req, res) => {
  try {
    const { doubtId } = req.params;

    const doubt = await Doubt.findById(doubtId)
      .populate('juniorId', 'name email bio')
      .lean();

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found',
        code: 'DOUBT_NOT_FOUND'
      });
    }

    const answers = await Answer.find({ doubtId })
      .populate('mentorId', 'name email bio')
      .sort({ createdAt: -1 })
      .lean();

    doubt.answers = answers;

    res.status(200).json({
      success: true,
      data: doubt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doubt',
      error: error.message
    });
  }
};

export const getAllDoubts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, tags, sortBy = 'createdAt' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status) filter.status = status;
    if (tags) {
      const tagArray = typeof tags === 'string' ? [tags] : tags;
      filter.tags = { $in: tagArray };
    }

    const doubts = await Doubt.find(filter)
      .populate('juniorId', 'name email')
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Doubt.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: doubts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doubts',
      error: error.message
    });
  }
};

export const updateDoubt = async (req, res) => {
  try {
    const { doubtId } = req.params;
    const { title, description, tags, status } = req.body;

    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found',
        code: 'DOUBT_NOT_FOUND'
      });
    }

    // Check authorization
    if (doubt.juniorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this doubt',
        code: 'FORBIDDEN'
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (tags) updateData.tags = tags.map(tag => tag.toLowerCase());
    if (status) updateData.status = status;

    const updatedDoubt = await Doubt.findByIdAndUpdate(
      doubtId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Doubt updated successfully',
      data: updatedDoubt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating doubt',
      error: error.message
    });
  }
};

export const deleteDoubt = async (req, res) => {
  try {
    const { doubtId } = req.params;

    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found',
        code: 'DOUBT_NOT_FOUND'
      });
    }

    // Check authorization
    if (doubt.juniorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this doubt',
        code: 'FORBIDDEN'
      });
    }

    await Doubt.findByIdAndDelete(doubtId);

    await Answer.deleteMany({ doubtId });
    await Comment.deleteMany({ doubtId });

    res.status(200).json({
      success: true,
      message: 'Doubt deleted successfully',
      data: { doubtId: doubt._id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting doubt',
      error: error.message
    });
  }
};

export const getDoubtsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const doubts = await Doubt.find({ juniorId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Doubt.countDocuments({ juniorId: userId });

    res.status(200).json({
      success: true,
      data: doubts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user doubts',
      error: error.message
    });
  }
};

export const getDoubtsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const doubts = await Doubt.find({ tags: tag.toLowerCase() })
      .populate('juniorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Doubt.countDocuments({ tags: tag.toLowerCase() });

    res.status(200).json({
      success: true,
      data: doubts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doubts by tag',
      error: error.message
    });
  }
};

export const getDoubtStats = async (req, res) => {
  try {
    const totalDoubts = await Doubt.countDocuments();
    const openDoubts = await Doubt.countDocuments({ status: 'open' });
    const answeredDoubts = await Doubt.countDocuments({ status: 'answered' });
    const resolvedDoubts = await Doubt.countDocuments({ status: 'resolved' });
    const closedDoubts = await Doubt.countDocuments({ status: 'closed' });

    const tagStats = await Doubt.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalDoubts,
        byStatus: {
          open: openDoubts,
          answered: answeredDoubts,
          resolved: resolvedDoubts,
          closed: closedDoubts
        },
        topTags: tagStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doubt statistics',
      error: error.message
    });
  }
};
