import cron from "node-cron";
import { connectDB } from "@/app/(backend)/lib/mongodb";
import { User } from "@/app/(backend)/models/User";

export async function cleanupResetTokens() {
  await connectDB();

  return await User.updateMany(
    {
      resetPasswordToken: { $ne: null },
      resetPasswordExpires: { $lt: new Date() },
    },
    {
      $unset: {
        resetPasswordToken: "",
        resetPasswordExpires: "",
      },
    }
  );
}