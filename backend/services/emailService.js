const nodemailer = require('nodemailer');
require('dotenv').config({ path: './config.env' });

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Use App Password for Gmail
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing email service:', error);
    }
  }

  // Send email notification to customer when agent replies
  async sendAgentReplyNotification(customerEmail, customerName, ticketId, ticketTitle, agentName, agentMessage, appUrl = 'http://localhost:3000') {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const subject = `New Reply on Your Support Ticket #${ticketId}`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Reply from Support</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .email-container {
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #e2e8f0;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .ticket-info {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #3b82f6;
            }
            .agent-reply {
              background: #ecfdf5;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #10b981;
            }
            .cta-button {
              display: inline-block;
              background: #3b82f6;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #6b7280;
              font-size: 14px;
            }
            .warning {
              background: #fef3c7;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              border-left: 4px solid #f59e0b;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo">🎫 ITSM Support</div>
              <h1>You've Got a Reply!</h1>
            </div>

            <p>Hi <strong>${customerName}</strong>,</p>
            
            <p>Great news! Our support agent <strong>${agentName}</strong> has replied to your support ticket.</p>

            <div class="ticket-info">
              <h3>📋 Ticket Details</h3>
              <p><strong>Ticket ID:</strong> #${ticketId}</p>
              <p><strong>Subject:</strong> ${ticketTitle}</p>
              <p><strong>Agent:</strong> ${agentName}</p>
            </div>

            <div class="agent-reply">
              <h3>💬 Agent's Reply</h3>
              <p>${agentMessage.length > 200 ? agentMessage.substring(0, 200) + '...' : agentMessage}</p>
            </div>

            <div style="text-align: center;">
              <a href="${appUrl}/ticket/${ticketId}" class="cta-button">
                📱 View & Reply in App
              </a>
            </div>

            <div class="warning">
              <p><strong>⚡ Quick Response Needed!</strong></p>
              <p>To ensure faster resolution, please respond via our app rather than replying to this email.</p>
            </div>

            <p>Thank you for using our support system. We're here to help!</p>

            <div class="footer">
              <p>🔒 This email was sent from an automated system. Please do not reply to this email.</p>
              <p>© 2024 ITSM Support Team. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
Hi ${customerName},

You've received a new reply from our support agent ${agentName} on your ticket #${ticketId}.

Ticket: ${ticketTitle}
Agent: ${agentName}

Reply: ${agentMessage}

To view the full conversation and respond, please visit: ${appUrl}/ticket/${ticketId}

Please respond via our app for faster resolution.

Thank you!
ITSM Support Team

Note: This is an automated email. Please do not reply to this email.
      `;

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: customerEmail,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${customerEmail} for ticket #${ticketId}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Error sending email notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send welcome email to new customers
  async sendWelcomeEmail(customerEmail, customerName) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const subject = 'Welcome to ITSM Support!';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ITSM Support</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .email-container {
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #e2e8f0;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .feature-list {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo">🎫 ITSM Support</div>
              <h1>Welcome Aboard!</h1>
            </div>

            <p>Hi <strong>${customerName}</strong>,</p>
            
            <p>Welcome to our ITSM Support system! We're excited to help you with all your support needs.</p>

            <div class="feature-list">
              <h3>🚀 What you can do:</h3>
              <ul>
                <li>📝 Create support tickets easily</li>
                <li>💬 Chat with our support agents</li>
                <li>📊 Track your ticket status</li>
                <li>📧 Get email notifications for replies</li>
                <li>📱 Access from any device</li>
              </ul>
            </div>

            <p>If you have any questions or need assistance, don't hesitate to create a support ticket.</p>

            <p>Thank you for choosing our support system!</p>

            <div class="footer">
              <p>© 2024 ITSM Support Team. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: customerEmail,
        subject: subject,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${customerEmail}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Test email configuration
  async testEmailConfig() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      await this.transporter.verify();
      console.log('✅ Email configuration is valid');
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      console.error('❌ Email configuration test failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
