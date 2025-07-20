import nodemailer from 'nodemailer';
import { createError } from '../middleware/errorHandler';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = this.createTransporter();
  }

  private createTransporter(): nodemailer.Transporter {
    // Check if Gmail credentials are provided
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailHost = process.env.EMAIL_HOST;

    if (emailUser && emailPass && emailHost && emailHost.includes('gmail')) {
      // Use Gmail configuration
      console.log('📧 Configuring Gmail SMTP...');
      const config: EmailConfig = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      };

      return nodemailer.createTransport(config);
    } else if (process.env.NODE_ENV === 'production' && emailUser && emailPass) {
      // Production email configuration for other services
      const config: EmailConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      };

      return nodemailer.createTransport(config);
    } else {
      // Development: Use Ethereal Email for testing
      console.log('📧 Using Ethereal Email for testing...');
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass',
        },
      });
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, firstName: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const htmlContent = this.generatePasswordResetHTML(firstName, resetUrl);
    const textContent = this.generatePasswordResetText(firstName, resetUrl);

    const mailOptions: EmailOptions = {
      to: email,
      subject: 'Password Reset Request - VHELP',
      html: htmlContent,
      text: textContent,
    };

    try {
      console.log('📤 Sending password reset email to:', email);

      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"VHELP Support" <noreply@vhelp.com>',
        ...mailOptions,
      });

      console.log('✅ Password reset email sent successfully!');
      console.log('   Message ID:', info.messageId);
      console.log('   To:', email);

      // In development, log the preview URL (only for Ethereal)
      if (process.env.NODE_ENV !== 'production' && !process.env.EMAIL_HOST?.includes('gmail')) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('   Preview URL:', previewUrl);
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to send password reset email:');
      console.error('   Error:', error.message);
      console.error('   Code:', error.code);
      console.error('   Response:', error.response);

      // Provide more specific error messages for common Gmail issues
      if (error.code === 'EAUTH') {
        console.error('   💡 Gmail authentication failed. Please check:');
        console.error('      - Email and app password are correct');
        console.error('      - 2-factor authentication is enabled');
        console.error('      - App password is generated (not regular password)');
      } else if (error.code === 'ECONNECTION') {
        console.error('   💡 Connection failed. Please check your internet connection.');
      }

      throw createError('Failed to send password reset email', 500);
    }
  }

  private generatePasswordResetHTML(firstName: string, resetUrl: string, email?: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - VHELP</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          .warning { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>We received a request to reset your password for your VHELP account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Your Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
            
            <div class="warning">
              <strong>Important:</strong>
              <ul>
                <li>This link will expire in 1 hour for security reasons</li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
            
            <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
            
            <p>Best regards,<br>The VHELP Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to your account. If you didn't request this password reset, you can safely ignore this email.</p>
            <p>&copy; 2025 VHELP. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetText(firstName: string, resetUrl: string): string {
    return `
Hello ${firstName},

We received a request to reset your password for your VHELP account.

To reset your password, please click on the following link or copy and paste it into your browser:
${resetUrl}

Important:
- This link will expire in 1 hour for security reasons
- If you didn't request this password reset, please ignore this email
- Your password will remain unchanged until you create a new one

If you're having trouble with the link, you can copy and paste it directly into your web browser.

Best regards,
The VHELP Team

---
This email was sent to your account. If you didn't request this password reset, you can safely ignore this email.
© 2025 VHELP. All rights reserved.
    `;
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing email service connection...');
      await this.transporter.verify();
      console.log('✅ Email service connection verified successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Email service connection failed:');
      console.error('   Error:', error.message);
      console.error('   Code:', error.code);

      if (error.code === 'EAUTH') {
        console.error('   💡 Authentication failed. For Gmail:');
        console.error('      1. Enable 2-factor authentication');
        console.error('      2. Generate an app password');
        console.error('      3. Use the app password (not your regular password)');
      }

      return false;
    }
  }
}

export const emailService = new EmailService();
