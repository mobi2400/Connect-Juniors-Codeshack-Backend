import Upvote from '../models/upvote.model.js';
import Answer from '../models/answer.model.js';
import User from '../models/user.model.js';

export const upvoteAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { userId } = req.user;

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found',
        code: 'ANSWER_NOT_FOUND'
      });
    }

    // Check if user exists (already mostly guaranteed by auth middleware, but okay)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const existingUpvote = await Upvote.findOne({ userId, answerId });
    if (existingUpvote) {
      return res.status(409).json({
        success: false,
        message: 'User has already upvoted this answer',
        code: 'ALREADY_UPVOTED'
      });
    }

    const upvote = new Upvote({
      userId,
      answerId
    });

    await upvote.save();

    answer.upvoteCount += 1;
    await answer.save();

    res.status(201).json({
      success: true,
      message: 'Answer upvoted successfully',
      data: {
        upvoteCount: answer.upvoteCount,
        upvoteId: upvote._id
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User has already upvoted this answer',
        code: 'ALREADY_UPVOTED'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error upvoting answer',
      error: error.message
    });
  }
};

export const removeUpvote = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { userId } = req.user;

    const upvote = await Upvote.findOne({ userId, answerId });
    if (!upvote) {
      return res.status(404).json({
        success: false,
        message: 'Upvote not found',
        code: 'UPVOTE_NOT_FOUND'
      });
    }

    await Upvote.deleteOne({ _id: upvote._id });

    const answer = await Answer.findById(answerId);
    if (answer && answer.upvoteCount > 0) {
      answer.upvoteCount -= 1;
      await answer.save();
    }

    res.status(200).json({
      success: true,
      message: 'Upvote removed successfully',
      data: {
        upvoteCount: answer.upvoteCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing upvote',
      error: error.message
    });
  }
};

export const getUpvotesByAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found',
        code: 'ANSWER_NOT_FOUND'
      });
    }

    const upvotes = await Upvote.find({ answerId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Upvote.countDocuments({ answerId });

    res.status(200).json({
      success: true,
      data: upvotes,
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
      message: 'Error fetching upvotes',
      error: error.message
    });
  }
};

export const getUpvotesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const upvotes = await Upvote.find({ userId })
      .populate('answerId', 'content upvoteCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Upvote.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: upvotes,
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
      message: 'Error fetching user upvotes',
      error: error.message
    });
  }
};

export const checkIfUpvoted = async (req, res) => {
  try {
    const { answerId, userId } = req.params;

    const upvote = await Upvote.findOne({ userId, answerId });

    res.status(200).json({
      success: true,
      data: {
        isUpvoted: !!upvote
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking upvote status',
      error: error.message
    });
  }
};

export const getUpvoteStats = async (req, res) => {
  try {
    const totalUpvotes = await Upvote.countDocuments();

    const topAnswers = await Upvote.aggregate([
      { $group: { _id: '$answerId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'answers',
          localField: '_id',
          foreignField: '_id',
          as: 'answerDetails'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUpvotes,
        topAnswers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching upvote statistics',
      error: error.message
    });
  }
};
