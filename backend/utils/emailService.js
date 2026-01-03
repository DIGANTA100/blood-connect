/**
 * Email Service using Resend API
 * Free tier: 3,000 emails/month, 100 emails/day
 * Alternative: Can use Nodemailer with Gmail SMTP
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'BloodConnect <noreply@bloodconnect.bd>';

/**
 * Send email notification using Resend API
 */
export const sendEmailNotification = async ({ to, subject, html }) => {
  try {
    // If no API key, log to console (development mode)
    if (!RESEND_API_KEY) {
      console.log('📧 EMAIL (DEV MODE - Would send to):', to);
      console.log('📧 Subject:', subject);
      console.log('📧 Email service not configured. Set RESEND_API_KEY in .env');
      return { success: true, mode: 'development' };
    }

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: subject,
        html: html
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      throw new Error('Failed to send email');
    }

    const data = await response.json();
    console.log('✅ Email sent successfully to:', to);
    return { success: true, id: data.id };

  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
};

/**
 * Alternative: Send email using Nodemailer (Gmail SMTP)
 * Uncomment and configure if you prefer Gmail
 */
/*
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
  }
});

export const sendEmailNotification = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"BloodConnect Bangladesh" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, id: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};
*/