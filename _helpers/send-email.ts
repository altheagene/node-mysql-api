import nodemailer from 'nodemailer';
import config from '../config.json';
import { Resend } from 'resend';

async function sendWithResend({ to, subject, html, from }: any) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
        from: from || process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: to,
        subject: subject,
        html: html,
    });

    if (error) {
        console.error('Resend API Error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
    
    return data;
}
export default async function sendEmail({to, subject, html, from = config.emailFrom} : any){

    const hasResend = !!process.env.RESEND_API_KEY;

    if(hasResend){
        return await sendWithResend({to, subject, html, from})
    }
    const transporter = nodemailer.createTransport(config.smtpOptions);
    await transporter.sendMail({from, to, subject, html});
}