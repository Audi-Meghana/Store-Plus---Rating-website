import { body, param, query, validationResult } from "express-validator";

// ── Helper — run after any validator chain ────────────────────────────────────
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors:  errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Create review ─────────────────────────────────────────────────────────────
export const validateCreateReview = [
  param("shopId")
    .isMongoId()
    .withMessage("Invalid shop ID"),

  body("rating")
    .notEmpty().withMessage("Rating is required")
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),

  body("title")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 }).withMessage("Title must be 100 characters or less"),

  // Accept either "comment" or "body" — service uses: data.comment ?? data.text ?? ""
  body("comment")
    .if((value, { req }) => !req.body.body)        // only required if "body" not present
    .notEmpty().withMessage("Review text is required")
    .isString()
    .trim()
    .isLength({ min: 10 }).withMessage("Review must be at least 10 characters")
    .isLength({ max: 1000 }).withMessage("Review must be 1000 characters or less"),

  body("body")
    .if((value, { req }) => !req.body.comment)     // only required if "comment" not present
    .notEmpty().withMessage("Review text is required")
    .isString()
    .trim()
    .isLength({ min: 10 }).withMessage("Review must be at least 10 characters")
    .isLength({ max: 1000 }).withMessage("Review must be 1000 characters or less"),

  // At least one of comment or body must be present
  body().custom((_, { req }) => {
    const text = req.body.comment || req.body.body;
    if (!text || text.trim().length < 10) {
      throw new Error("Review text is required (min 10 characters)");
    }
    return true;
  }),

  validate,
];

// ── Update review ─────────────────────────────────────────────────────────────
export const validateUpdateReview = [
  param("id")
    .isMongoId()
    .withMessage("Invalid review ID"),

  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),

  body("title")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 }).withMessage("Title must be 100 characters or less"),

  body("comment")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10 }).withMessage("Review must be at least 10 characters")
    .isLength({ max: 1000 }).withMessage("Review must be 1000 characters or less"),

  body("body")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 10 }).withMessage("Review must be at least 10 characters")
    .isLength({ max: 1000 }).withMessage("Review must be 1000 characters or less"),

  body().custom((_, { req }) => {
    const { rating, title, body, comment } = req.body;
    if (!rating && !title && !body && !comment) {
      throw new Error("At least one field (rating, title, comment) is required");
    }
    return true;
  }),

  validate,
];

// ── Owner reply ───────────────────────────────────────────────────────────────
export const validateOwnerReply = [
  param("id")
    .isMongoId()
    .withMessage("Invalid review ID"),

  body("text")
    .notEmpty().withMessage("Reply text is required")
    .isString()
    .trim()
    .isLength({ min: 5 }).withMessage("Reply must be at least 5 characters")
    .isLength({ max: 1000 }).withMessage("Reply must be 1000 characters or less"),

  validate,
];

// ── Review ID param only ──────────────────────────────────────────────────────
export const validateReviewId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid review ID"),

  validate,
];

// ── List / pagination query ───────────────────────────────────────────────────
export const validateReviewQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),

  query("rating")
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage("Rating filter must be between 1 and 5"),

  query("sort")
    .optional()
    .isIn(["newest", "oldest", "highest", "lowest", "helpful"])
    .withMessage("Sort must be one of: newest, oldest, highest, lowest, helpful"),

  validate,
];

// ── Photo upload ──────────────────────────────────────────────────────────────
export const validatePhotoUpload = [
  param("id")
    .isMongoId()
    .withMessage("Invalid review ID"),

  body("photoIndex")
    .optional()
    .isInt({ min: 0, max: 4 }).withMessage("Photo index must be between 0 and 4"),

  validate,
];