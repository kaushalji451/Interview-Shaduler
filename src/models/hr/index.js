import mongoose from "mongoose";
const InterviewSchema = new mongoose.Schema({
    candidateName: String,
    email: String,
    position: String,
    interviewDate: Date,
    interviewer: [String],
    status: {
        type: String,
        enum: ["Scheduled", "Selected", "Rejected", "On Hold"],
        default: "Scheduled",
    },
    resumePreviewUrl: String,
    resumeDownloadUrl: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Interview = mongoose.models.Interview || mongoose.model("Interview", InterviewSchema);