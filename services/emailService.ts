// Fix: Corrected import path
import { User } from "../types";

/**
 * A placeholder for an email sending service.
 * In a real application, this would integrate with an email API like SendGrid, Mailgun, etc.
 */
export const emailService = {
    /**
     * Sends an email to a user.
     * @param user The user object containing their email address.
     * @param subject The subject of the email.
     * @param body The HTML or text body of the email.
     * @returns A promise that resolves when the email is sent.
     */
    send: (user: User, subject: string, body: string): Promise<void> => {
        return new Promise((resolve) => {
            console.log(`
        ============================================================
        📧 SIMULATING EMAIL 📧
        ------------------------------------------------------------
        To: ${user.name} <${user.email}>
        Subject: ${subject}
        
        Body:
        ${body}
        ============================================================
      `);
            resolve();
        });
    },
};