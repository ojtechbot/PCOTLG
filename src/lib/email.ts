
'use server';

import nodemailer from 'nodemailer';
import { config } from 'dotenv';

// Ensure environment variables are loaded
config();

interface EmailPayload {
    to: string;
    subject: string;
    heading: string;
    body: string; // HTML content
    button?: {
        text: string;
        url: string;
    }
}

const createTransport = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error('SMTP environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) are not set in the .env file. Email functionality is disabled.');
    throw new Error('Email service is not configured. Please set SMTP environment variables.');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    // Add a connection timeout to prevent long waits on failure
    connectionTimeout: 5000, 
    // Add a logger for more detailed debugging if needed
    logger: process.env.NODE_ENV === 'development',
  });
};


const generateEmailHtml = (payload: EmailPayload) => {
    const { heading, body, button } = payload;
    const headerBg = "hsl(var(--primary))";
    const buttonBg = "#2A3D8F"; 
    const buttonColor = "#FFFFFF";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Serif:wght@700&display=swap');
        body { margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E9E5F3; }
        .header { background-color: ${headerBg}; padding: 24px; text-align: center; }
        .header img { height: 50px; }
        .content { padding: 32px; color: #1A1A2E; line-height: 1.6; }
        .content h1 { font-family: 'Noto Serif', serif; color: #1A1A2E; font-size: 24px; margin-top: 0; }
        .button-container { text-align: center; margin: 32px 0; }
        .button { background-color: ${buttonBg}; color: ${buttonColor}; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
        .footer { background-color: #f7f7f7; padding: 16px; text-align: center; font-size: 12px; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${"appUrl"}/images/logo.png" alt="PCOTLG Logo">
        </div>
        <div class="content">
            <h1>${heading}</h1>
            ${body}
            ${button ? `
            <div class="button-container">
                <a href="${button.url}" class="button">${button.text}</a>
            </div>` : ''}
            <p style="margin-top: 32px;">Blessings,<br/>The PCOTLG Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} PCOTLG. All rights reserved.</p>
             <p><a href="${appUrl}">Visit our app</a></p>
        </div>
    </div>
</body>
</html>
    `;
}

export const sendEmail = async (payload: EmailPayload) => {
    let transporter;
    try {
        transporter = createTransport();
    } catch (error: any) {
        console.error("Failed to create email transport:", error.message);
        // Re-throw the configuration error so the calling flow knows about it.
        throw error;
    }

    const html = generateEmailHtml(payload);
    
    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'PCOTLG'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: payload.to,
        subject: payload.subject,
        html: html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error: any) {
        // Improved logging for better diagnostics
        console.error('Error sending email via Nodemailer. This is likely an SMTP configuration issue.');
        console.error('Error Code:', error.code);
        console.error('Error Response:', error.response);
        throw new Error('Failed to send email. Please check the SMTP credentials and server logs.');
    }
};
