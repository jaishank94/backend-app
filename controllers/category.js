import { asyncError } from "../middlewares/error.js";
import { Category } from "../models/category.js";
import { User } from "../models/user.js";

export const getAllCategories = asyncError(async (req, res, next) => {
  try {
    if (req.user) {
      // Fetch categories based on user interests
      const user = await User.findById(req.user._id);
      const userInterests = user.interests;
      const categories = await Category.find({ name: { $in: userInterests } });
      res.status(200).json({
        success: true,
        interests: categories,
      });
    } else {
      // Fetch all categories if user is not passed
      const categories = await Category.find();
      res.status(200).json({
        success: true,
        interests: categories,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
