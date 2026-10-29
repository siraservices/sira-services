import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Recurring invoices: 13:05 UTC ≈ 9:05am Eastern (8:05 in winter).
crons.daily("books recurring invoices", { hourUTC: 13, minuteUTC: 5 }, internal.booksRecurring.run, {});

export default crons;
