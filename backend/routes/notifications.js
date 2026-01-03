import express from 'express';
import User from '../models/User.js';
import { sendEmailNotification } from '../utils/emailService.js';

const router = express.Router();

// @route   POST /api/notifications/notify-donors
// @desc    Notify matching donors via email
// @access  Public (should be protected in production)
router.post('/notify-donors', async (req, res) => {
  try {
    const { bloodGroup, hospitalName, unitsNeeded, urgency, contactPhone, district } = req.body;

    // Validate required fields
    if (!bloodGroup || !hospitalName || !unitsNeeded) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find matching donors
    const query = {
      bloodGroup,
      isAvailable: true,
      role: 'DONOR'
    };

    // If district is provided, prioritize donors from same district
    if (district) {
      query.district = district;
    }

    const matchingDonors = await User.find(query)
      .select('name email phone bloodGroup district')
      .limit(50); // Limit to prevent spam

    if (matchingDonors.length === 0) {
      return res.status(404).json({ 
        message: 'No matching donors found',
        count: 0
      });
    }

    // Send email to each donor
    const emailPromises = matchingDonors.map(donor => {
      const emailContent = {
        to: donor.email,
        subject: `🩸 ${urgency === 'EMERGENCY' ? 'URGENT' : ''} Blood Donation Request - ${bloodGroup}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
              .urgent { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
              .info-box { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; }
              .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
              .label { font-weight: bold; color: #6b7280; }
              .value { color: #111827; }
              .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🩸 BloodConnect Bangladesh</h1>
                <p style="margin: 10px 0 0 0;">A Life Needs Your Help</p>
              </div>
              <div class="content">
                ${urgency === 'EMERGENCY' ? `
                  <div class="urgent">
                    <strong>⚠️ URGENT REQUEST</strong><br>
                    This is an emergency blood requirement. Immediate action needed!
                  </div>
                ` : ''}
                
                <p>Dear <strong>${donor.name}</strong>,</p>
                
                <p>A patient at <strong>${hospitalName}</strong> urgently needs <strong>${bloodGroup}</strong> blood donation. Your blood group matches this request!</p>
                
                <div class="info-box">
                  <h3 style="margin-top: 0; color: #dc2626;">Request Details:</h3>
                  <div class="info-row">
                    <span class="label">Blood Group:</span>
                    <span class="value"><strong>${bloodGroup}</strong></span>
                  </div>
                  <div class="info-row">
                    <span class="label">Units Needed:</span>
                    <span class="value">${unitsNeeded} units</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Hospital:</span>
                    <span class="value">${hospitalName}</span>
                  </div>
                  ${district ? `
                    <div class="info-row">
                      <span class="label">Location:</span>
                      <span class="value">${district}</span>
                    </div>
                  ` : ''}
                  <div class="info-row">
                    <span class="label">Contact:</span>
                    <span class="value">${contactPhone}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Urgency:</span>
                    <span class="value" style="color: ${urgency === 'EMERGENCY' ? '#dc2626' : '#059669'}; font-weight: bold;">${urgency}</span>
                  </div>
                </div>
                
                <p><strong>How You Can Help:</strong></p>
                <ul>
                  <li>Contact the hospital at <strong>${contactPhone}</strong></li>
                  <li>Visit the hospital if you're available</li>
                  <li>Share this request with other potential donors</li>
                </ul>
                
                <p style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                  <strong>⚠️ Important:</strong> Ensure you haven't donated blood in the last 120 days and meet all eligibility criteria before visiting.
                </p>
                
                <center>
                  <a href="http://localhost:3000" class="button">Open BloodConnect Dashboard</a>
                </center>
                
                <p style="margin-top: 30px;">Thank you for being a registered donor. Your generosity can save lives! 🙏</p>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                  If you're no longer available to donate, please update your status in the BloodConnect app.
                </p>
              </div>
              <div class="footer">
                <p><strong>BloodConnect Bangladesh</strong></p>
                <p>Connecting Donors, Saving Lives</p>
                <p style="margin-top: 10px;">
                  This is an automated notification. Please do not reply to this email.<br>
                  For support, visit our website or contact: support@bloodconnect.bd
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      return sendEmailNotification(emailContent);
    });

    // Wait for all emails to be sent
    const results = await Promise.allSettled(emailPromises);
    
    // Count successful sends
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failCount = results.filter(r => r.status === 'rejected').length;

    res.json({
      message: `Notification sent to ${successCount} matching donors`,
      totalDonors: matchingDonors.length,
      successCount,
      failCount,
      donors: matchingDonors.map(d => ({
        name: d.name,
        bloodGroup: d.bloodGroup,
        district: d.district
      }))
    });

  } catch (error) {
    console.error('Notify donors error:', error);
    res.status(500).json({ message: 'Failed to send notifications' });
  }
});

export default router;