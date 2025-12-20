import MentorProfile from '../models/mentorProfile.model.js';
import User from '../models/user.model.js';
import Answer from '../models/answer.model.js';

export const createMentorProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { badge, expertiseTags } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.role !== 'mentor') {
      return res.status(403).json({
        success: false,
        message: 'Only mentors can create mentor profiles',
        code: 'UNAUTHORIZED'
      });
    }

    const existingProfile = await MentorProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: 'Mentor profile already exists for this user',
        code: 'PROFILE_EXISTS'
      });
    }

    const mentorProfile = new MentorProfile({
      userId,
      badge: badge || 'Mentor',
      expertiseTags: expertiseTags.map(tag => tag.toLowerCase()),
      totalUpvotes: 0,
      approvedByAdmin: false
    });

    await mentorProfile.save();

    res.status(201).json({
      success: true,
      message: 'Mentor profile created successfully',
      data: mentorProfile
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Mentor profile already exists for this user',
        code: 'PROFILE_EXISTS'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating mentor profile',
      error: error.message
    });
  }
};

export const getMentorProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const mentorProfile = await MentorProfile.findOne({ userId })
      .populate('userId', 'name email bio role createdAt');

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found',
        code: 'PROFILE_NOT_FOUND'
      });
    }

    const answersCount = await Answer.countDocuments({ mentorId: userId });

    res.status(200).json({
      success: true,
      data: {
        ...mentorProfile.toObject(),
        answersCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching mentor profile',
      error: error.message
    });
  }
};

export const updateMentorProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { badge, expertiseTags } = req.body;

    const mentorProfile = await MentorProfile.findOne({ userId });
    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found',
        code: 'PROFILE_NOT_FOUND'
      });
    }

    const updateData = {};
    if (badge) updateData.badge = badge;
    if (expertiseTags) updateData.expertiseTags = expertiseTags.map(tag => tag.toLowerCase());

    const updatedProfile = await MentorProfile.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Mentor profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating mentor profile',
      error: error.message
    });
  }
};

export const getAllApprovedMentors = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'totalUpvotes' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const mentors = await MentorProfile.find({ approvedByAdmin: true })
      .populate('userId', 'name email bio')
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await MentorProfile.countDocuments({ approvedByAdmin: true });

    res.status(200).json({
      success: true,
      data: mentors,
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
      message: 'Error fetching mentors',
      error: error.message
    });
  }
};

export const getPendingMentorApprovals = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pendingMentors = await MentorProfile.find({ approvedByAdmin: false })
      .populate('userId', 'name email bio createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await MentorProfile.countDocuments({ approvedByAdmin: false });

    res.status(200).json({
      success: true,
      data: pendingMentors,
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
      message: 'Error fetching pending mentor approvals',
      error: error.message
    });
  }
};

export const getMentorsByExpertise = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const mentors = await MentorProfile.find({
      expertiseTags: tag.toLowerCase(),
      approvedByAdmin: true
    })
      .populate('userId', 'name email bio')
      .sort({ totalUpvotes: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await MentorProfile.countDocuments({
      expertiseTags: tag.toLowerCase(),
      approvedByAdmin: true
    });

    res.status(200).json({
      success: true,
      data: mentors,
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
      message: 'Error fetching mentors by expertise',
      error: error.message
    });
  }
};

export const getTopMentors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topMentors = await MentorProfile.find({ approvedByAdmin: true })
      .populate('userId', 'name email bio')
      .sort({ totalUpvotes: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: topMentors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top mentors',
      error: error.message
    });
  }
};

export const deleteMentorProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const mentorProfile = await MentorProfile.findOneAndDelete({ userId });
    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found',
        code: 'PROFILE_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mentor profile deleted successfully',
      data: { userId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting mentor profile',
      error: error.message
    });
  }
};
