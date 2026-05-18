import nodemailer from 'nodemailer';
import config from '../config.json';
import { Resend } from 'resend';
import axios from 'axios';

// Function to send via Brevo API (for production/Render)
async function sendWithBrevo({ to, subject, html, from }: any) {
    const API_KEY = process.env.BREVO_API_KEY;
    const SENDER_EMAIL = from || process.env.EMAIL_FROM || config.emailFrom;
    
    if (!API_KEY) {
        throw new Error('BREVO_API_KEY environment variable is required');
    }

    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: { email: SENDER_EMAIL },
                to: [{ email: to }],
                subject: subject,
                htmlContent: html,
            },
            {
                headers: {
                    'api-key': API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('Email sent via Brevo:', response.data.messageId);
        return response.data;
    } catch (error: any) {
        console.error(' Brevo API Error:', error.response?.data || error.message);
        throw new Error(`Failed to send email via Brevo: ${error.message}`);
    }
}

export default async function sendEmail({to, subject, html, from} : any){

    const hasResend = !!process.env.BREVO_API_KEY;

    if(hasResend){
        return await sendWithBrevo({to, subject, html, from})
    }
    const transporter = nodemailer.createTransport(config.smtpOptions);
    await transporter.sendMail({from, to, subject, html});
}