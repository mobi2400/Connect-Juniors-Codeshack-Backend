import Answer from '../models/answer.model.js';
import Doubt from '../models/doubt.model.js';
import User from '../models/user.model.js';
import Upvote from '../models/upvote.model.js';

export const createAnswer = async (req, res) => {
  try {
    const { doubtId } = req.params;
    const { userId: mentorId, role } = req.user;
    const { content } = req.body;

    if (role !== 'mentor') {
      return res.status(403).json({
        success: false,
        message: 'Only mentors can post answers',
        code: 'UNAUTHORIZED'
      });
    }

    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found',
        code: 'DOUBT_NOT_FOUND'
      });
    }

    // Check if mentor is approved (optional based on PRD, but good practice if field exists)
    // const mentor = await User.findById(mentorId);
    // if (!mentor.isMentorApproved) ... (Assuming auth middleware or login handles basic checks, but "approved" is specific)
    // For now, simple role check is consistent with PRD "Signup -> Login -> Answer".
    // Wait, PRD says "Admin can approve mentor accounts". If they sign up as mentor, are they approved?
    // My register logic sets isMentorApproved = false for mentors. So we MUST check this here.

    const mentor = await User.findById(mentorId);
    if (!mentor.isMentorApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your mentor account is not approved yet',
        code: 'NOT_APPROVED'
      });
    }

    const answer = new Answer({
      content,
      doubtId,
      mentorId,
      upvoteCount: 0
    });

    await answer.save();

    if (doubt.status === 'open') {
      doubt.status = 'answered';
      await doubt.save();
    }

    res.status(201).json({
      success: true,
      message: 'Answer posted successfully',
      data: answer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating answer',
      error: error.message
    });
  }
};

export const getAnswersByDoubt = async (req, res) => {
  try {
    const { doubtId } = req.params;
    const { page = 1, limit = 10, sortBy = 'upvoteCount' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const doubtExists = await Doubt.findById(doubtId);
    if (!doubtExists) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found',
        code: 'DOUBT_NOT_FOUND'
      });
    }

    const answers = await Answer.find({ doubtId })
      .populate('mentorId', 'name email bio role')
      .sort({ [sortBy === 'upvoteCount' ? 'upvoteCount' : 'createdAt']: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Answer.countDocuments({ doubtId });

    res.status(200).json({
      success: true,
      data: answers,
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
      message: 'Error fetching answers',
      error: error.message
    });
  }
};

export const getAnswerById = async (req, res) => {
  try {
    const { answerId } = req.params;

    const answer = await Answer.findById(answerId)
      .populate('mentorId', 'name email bio')
      .populate('doubtId', 'title description');

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found',
        code: 'ANSWER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: answer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching answer',
      error: error.message
    });
  }
};

export const updateAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { content } = req.body;

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found',
        code: 'ANSWER_NOT_FOUND'
      });
    }

    if (answer.mentorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this answer',
        code: 'FORBIDDEN'
      });
    }

    const updatedAnswer = await Answer.findByIdAndUpdate(
      answerId,
      { content },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Answer updated successfully',
      data: updatedAnswer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating answer',
      error: error.message
    });
  }
};

export const deleteAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found',
        code: 'ANSWER_NOT_FOUND'
      });
    }

    if (answer.mentorId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this answer',
        code: 'FORBIDDEN'
      });
    }

    await Answer.findByIdAndDelete(answerId);

    await Upvote.deleteMany({ answerId });

    res.status(200).json({
      success: true,
      message: 'Answer deleted successfully',
      data: { answerId: answer._id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting answer',
      error: error.message
    });
  }
};

export const getAnswersByMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const mentorExists = await User.findById(mentorId);
    if (!mentorExists) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const answers = await Answer.find({ mentorId })
      .populate('doubtId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Answer.countDocuments({ mentorId });

    res.status(200).json({
      success: true,
      data: answers,
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
      message: 'Error fetching mentor answers',
      error: error.message
    });
  }
};

export const getMostHelpfulAnswers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const answers = await Answer.find()
      .populate('mentorId', 'name email')
      .populate('doubtId', 'title')
      .sort({ upvoteCount: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: answers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching helpful answers',
      error: error.message
    });
  }
};
