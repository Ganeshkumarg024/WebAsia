import nodemailer from 'nodemailer';
import config from '../config/index.js';

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

// Verify transporter
if (process.env.NODE_ENV !== 'test') {
  transporter.verify()
    .then(() => console.log('✅ Email server is ready'))
    .catch(error => {
      console.error('❌ Email transporter error (likely auth or connection):', error.message);
      console.log('⚠️ Emails will not be sent, but server will continue to run.');
    });
}

export const sendEmail = async (to, subject, html, text = null) => {
  try {
    const mailOptions = {
      from: `${config.email.fromName} <${config.email.fromEmail}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to WebAsia Creative Services!';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to WebAsia! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.firstName},</h2>
          <p>Thank you for joining WebAsia Creative Services Platform!</p>
          <p>We're excited to have you on board. Your account has been successfully created and you can now access all our creative services.</p>
          <p><strong>Your Account Details:</strong></p>
          <ul>
            <li>Email: ${user.email}</li>
            <li>Role: ${user.role}</li>
          </ul>
          <a href="${config.frontendUrl}/login" class="button">Get Started</a>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The WebAsia Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 WebAsia IT Solutions. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(user.email, subject, html);
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request 🔐</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.firstName},</h2>
          <p>We received a request to reset your password for your WebAsia account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          <div class="warning">
            <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
          </div>
          <p>Best regards,<br>The WebAsia Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(user.email, subject, html);
};

export const sendEmailVerification = async (user, verificationToken) => {
  const verificationUrl = `${config.frontendUrl}/verify-email?token=${verificationToken}`;
  const subject = 'Verify Your Email Address';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email ✉️</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.firstName},</h2>
          <p>Thank you for signing up with WebAsia! Please verify your email address to activate your account.</p>
          <a href="${verificationUrl}" class="button">Verify Email</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>The WebAsia Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(user.email, subject, html);
};

export const sendRequestAssignedEmail = async (designer, request, client) => {
  const subject = 'New Request Assigned to You';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .info-box { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Request Assigned 🎨</h1>
        </div>
        <div class="content">
          <h2>Hi ${designer.firstName},</h2>
          <p>A new request has been assigned to you!</p>
          <div class="info-box">
            <p><strong>Request:</strong> ${request.title}</p>
            <p><strong>Service Type:</strong> ${request.serviceType.replace('_', ' ')}</p>
            <p><strong>Client:</strong> ${client.firstName} ${client.lastName}</p>
            <p><strong>Deadline:</strong> ${new Date(request.deadline).toLocaleDateString()}</p>
          </div>
          <a href="${config.frontendUrl}/designer/tasks/${request.id}" class="button">View Request</a>
          <p>Best regards,<br>The WebAsia Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(designer.email, subject, html);
};

export const sendRequestCompletedEmail = async (client, request) => {
  const subject = 'Your Request is Complete!';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Request Completed! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hi ${client.firstName},</h2>
          <p>Great news! Your request "${request.title}" has been completed.</p>
          <p>You can now review and download your files.</p>
          <a href="${config.frontendUrl}/requests/${request.id}" class="button">View Request</a>
          <p>We hope you're satisfied with the results. If you need any revisions, please let us know!</p>
          <p>Best regards,<br>The WebAsia Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(client.email, subject, html);
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendRequestAssignedEmail,
  sendRequestCompletedEmail
};
