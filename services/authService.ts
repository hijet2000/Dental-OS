
import { User } from "../types";
import { staffService } from "./staffService";

/**
 * A placeholder for a more robust authentication service.
 * In a real application, this would involve API calls, token management, etc.
 */
export const authService = {
  /**
   * Simulates a user login with email and password.
   * For this demo, it checks against a hardcoded PIN.
   * @param email The user's email.
   * @param pin The user's PIN (used as a password for this demo).
   * @returns A promise resolving to the user object on success, or null on failure.
   */
  login: async (email: string, pin: string): Promise<User | null> => {
    console.log(`[AuthService] Attempting login for ${email}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // FIX: Await async calls to staffService
    const userByPin = await staffService.getUserByPin(pin);
    const allUsers = await staffService.getUsers();
    const userByEmail = allUsers.find(u => u.email === email);

    if (userByPin && userByEmail && userByPin.id === userByEmail.id) {
        console.log(`[AuthService] Login successful for ${email}`);
        return userByEmail;
    }

    console.warn(`[AuthService] Login failed for ${email}`);
    return null;
  },

  /**
   * Simulates logging a user out.
   */
  logout: async (): Promise<void> => {
    console.log(`[AuthService] User logged out.`);
    // In a real app, this would clear tokens from localStorage/sessionStorage.
    return Promise.resolve();
  },
};
