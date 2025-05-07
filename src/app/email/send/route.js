import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Setup transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// email route

export async function POST(req) {
  let {to,subject,text} = await req.json();
  if (!to && !subject && !text) {
    return NextResponse.json(
      { error: "please provide some data" },
      { status: 500 }
    );
  }
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };
    let data = await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Success email was send" });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
