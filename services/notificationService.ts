// This service is now a placeholder for a more robust notification system.
// The actual implementation is handled by the `useNotifications` hook and `NotificationProvider`.
// In a larger app, this service could be used to dispatch notification events globally.

export const notificationService = {
    /**
     * Shows a success notification.
     * @param message The message to display.
     */
    success: (message: string): void => {
        // This would typically dispatch an event that the NotificationProvider listens to.
        console.log(`[SUCCESS] Notification: ${message}`);
    },

    /**
     * Shows an error notification.
     * @param message The message to display.
     */
    error: (message: string): void => {
        console.error(`[ERROR] Notification: ${message}`);
    },

    /**
     * Shows an informational notification.
     * @param message The message to display.
     */
    info: (message: string): void => {
        console.info(`[INFO] Notification: ${message}`);
    },
};