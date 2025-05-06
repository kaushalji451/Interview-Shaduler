import connectMongo from "@/lib/db";
import { Interview } from "@/models/hr";
import { google } from "googleapis";
import { Readable } from "stream";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 6;
    const skip = (page - 1) * limit;

    const interviews = await Interview.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Interview.countDocuments();

    return NextResponse.json({ interviews, total });
  } catch (err) {
    console.error("Fetch interviews error:", err);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectMongo();

    const formData = await req.formData();
    const file = formData.get("resume");
    const interviewer = formData.getAll("interviewer");

    if (!file) {
      return NextResponse.json(
        { error: "No resume uploaded" },
        { status: 400 }
      );
    }

    // Google Drive Auth
    const keyFile = JSON.parse(
      Buffer.from(process.env.GOOGLE_DRIVE_SERVICE_KEY, "base64").toString()
    );

    const auth = new google.auth.GoogleAuth({
      credentials: keyFile,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });

    const buffer = Buffer.from(await file.arrayBuffer());
    const bufferStream = new Readable();
    // const bufferStream = Readable.from(buffer);//new
    bufferStream.push(buffer);
    bufferStream.push(null);

    const driveResponse = await drive.files.create({
      requestBody: {
        name: `${formData.get("candidateName")}_Resume.pdf`,
        mimeType: file.type,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: file.type,
        body: bufferStream,
      },
      fields: "id",
    });
    const fileId = driveResponse.data.id;
    const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    const downloadUrl = `https://drive.google.com/uc?id=${fileId}`;

    const newInterview = await Interview.create({
      candidateName: formData.get("candidateName"),
      email: formData.get("email"),
      position: formData.get("position"),
      interviewDate: formData.get("interviewDate"),
      interviewer: interviewer,
      resumePreviewUrl: previewUrl,
      resumeDownloadUrl: downloadUrl,
    });

    return NextResponse.json({
      message: "Interview scheduled",
      data: newInterview,
    });
  } catch (err) {
    console.error("Error scheduling interview:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  let { id, status } = await req.json();
  if (!id || !status) {
    return NextResponse.json(
      { error: "Please provide id And status " },
      { status: 500 }
    );
  }
  try {
    let result = await Interview.findOneAndUpdate(
      { _id: id },
      { status: status },
      { new: true }
    );
    return NextResponse.json({ message: "Interview Updated" });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  let { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Please provide id  " }, { status: 500 });
  }
  // Google Drive Auth
  const keyFile = JSON.parse(
    Buffer.from(process.env.GOOGLE_DRIVE_SERVICE_KEY, "base64").toString()
  );

  const auth = new google.auth.GoogleAuth({
    credentials: keyFile,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  const drive = google.drive({ version: "v3", auth });

  try {
    let data = await Interview.findByIdAndDelete(id);
    let fileId = data.resumeDownloadUrl.split("id=")[1];
    await drive.files.delete({
      fileId: fileId,
    });
    return NextResponse.json({ message: "Interview Deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const formData = await req.formData();
  const file = formData.get("resume");
  const id = formData.get("id");
  const name = formData.get("name");

  // Google Drive Auth
  const keyFile = JSON.parse(
    Buffer.from(process.env.GOOGLE_DRIVE_SERVICE_KEY, "base64").toString()
  );

  const auth = new google.auth.GoogleAuth({
    credentials: keyFile,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  const drive = google.drive({ version: "v3", auth });

  const buffer = Buffer.from(await file.arrayBuffer());
  const bufferStream = new Readable();
  // const bufferStream = Readable.from(buffer);//new
  bufferStream.push(buffer);
  bufferStream.push(null);

  try {
    const driveResponse = await drive.files.create({
      requestBody: {
        name: `${name}_Resume.pdf`,
        mimeType: file.type,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: file.type,
        body: bufferStream,
      },
      fields: "id",
    });
    const fileId = driveResponse.data.id;
    const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    const downloadUrl = `https://drive.google.com/uc?id=${fileId}`;

    const data = await Interview.findOneAndUpdate(
      { _id: id },
      { resumePreviewUrl: previewUrl, resumeDownloadUrl: downloadUrl }
    );

    let deleteFieldId = data.resumeDownloadUrl.split("id=")[1];
    await drive.files.delete({
      fileId: deleteFieldId,
    });
    return NextResponse.json({ message: "Resume Updated" });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
