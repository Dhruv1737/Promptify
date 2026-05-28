import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:     { type: String, enum: ["debugger", "study", "recommend"], required: true },
    input:    { type: String, required: true },
    output:   { type: String, required: true },
    saved:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.History || mongoose.model("History", HistorySchema);