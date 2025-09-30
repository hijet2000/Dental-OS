// Fix: Corrected import path
import { User } from "../types";

/**
 * A placeholder for an SMS sending service.
 * In a real application, this would integrate with a service like Twilio.
 */
export const smsService = {
    /**
     * Sends an SMS to a user.
     * @param user The user object (assuming it has a phone number property).
     * @param message The text message to send.
     * @returns A promise that resolves when the SMS is sent.
     */
    send: (user: User, message: string): Promise<void> => {
        return new Promise((resolve) => {
            console.log(`
        ============================================================
        📱 SIMULATING SMS 📱
        ------------------------------------------------------------
        To: ${user.name} (Phone number not implemented)
        Message: ${message}
        ============================================================
      `);
            resolve();
        });
    },
};