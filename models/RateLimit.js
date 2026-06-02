import mongoose from "mongoose";

const RateLimitSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    feature: {
      type:     String,
      enum:     ["debugger", "study", "resume"],
      required: true,
    },
    count: {
      type:    Number,
      default: 0,
    },
    resetAt: {
      type:     Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index — fast lookup by userId + feature
RateLimitSchema.index({ userId: 1, feature: 1 }, { unique: true });

// Auto delete expired documents
RateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.RateLimit ||
  mongoose.model("RateLimit", RateLimitSchema);