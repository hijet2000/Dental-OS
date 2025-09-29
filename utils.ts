/**
 * Converts a File object to a Base64 encoded string.
 * @param file The file to convert.
 * @returns A promise that resolves with the Base64 string (without the data URL prefix).
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // result is "data:image/jpeg;base64,LzlqLzRBQ...""
            // We only want the part after the comma
            const resultString = reader.result as string;
            resolve(resultString.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};
