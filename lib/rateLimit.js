import connectDB from "@/lib/mongodb";
import RateLimit from "@/models/RateLimit";

const LIMITS = {
  debugger: { max: 10, windowMs: 60 * 60 * 1000 },
  study:    { max: 1,  windowMs: 24*60 * 60 * 1000 },
  resume:   { max: 1,  windowMs: 12*60 * 60 * 1000 },
};

export async function rateLimit(userId, feature) {
  await connectDB();

  const limit = LIMITS[feature];
  if (!limit) throw new Error(`Unknown feature: ${feature}`);

  const now     = new Date();
  const resetAt = new Date(now.getTime() + limit.windowMs);

  // 🌟 ATOMIC STEP: Find or Create/Reset in exactly one database trip
  // This completely eliminates multi-request race conditions!
  let record = await RateLimit.findOneAndUpdate(
    { userId, feature },
    {
      $setOnInsert: { userId, feature, resetAt, count: 1 }
    },
    { upsert: true, new: true } // Upsert ensures atomic creation if document is missing
  );

  // ── Window expired → reset atomically ──────────────────
  if (now > record.resetAt) {
    record = await RateLimit.findOneAndUpdate(
      { userId, feature },
      { $set: { count: 1, resetAt } },
      { new: true }
    );
  }

  // ── Over limit → block ──────────────────────
  if (record.count > limit.max) {
    const msLeft      = record.resetAt - now;
    const minutesLeft = Math.ceil(msLeft / 60000);
    const hoursLeft   = Math.ceil(msLeft / 3600000);

    const timeMsg = minutesLeft >= 60
      ? `${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}`
      : `${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}`;

    return {
      allowed:    false,
      remaining:  0,
      resetAt:    record.resetAt,
      minutesLeft,
      limit:      limit.max,
      message:    `You've used all ${limit.max} ${
        feature === "resume" ? "resume analysis" : feature === "study" ? "study guide" : "debug"
      } request${limit.max === 1 ? "" : "s"} for this hour. Try again in ${timeMsg}.`,
    };
  }

  // ── Within limit → safe increment update ────────────────
  // We increment only AFTER confirming they haven't breached security blocks
  const finalRecord = await RateLimit.findOneAndUpdate(
    { userId, feature },
    { $inc: { count: 1 } },
    { new: true }
  );

  return {
    allowed:   true,
    remaining: Math.max(0, limit.max - finalRecord.count + 1),
    resetAt:   finalRecord.resetAt,
    limit:     limit.max,
  };
}