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

/**
 * Calculates luminance of a color.
 * @param r Red value (0-255)
 * @param g Green value (0-255)
 * @param b Blue value (0-255)
 * @returns Luminance (0-1)
 */
function getLuminance(r: number, g: number, b: number): number {
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Converts a hex color string to an RGB object.
 * @param hex The hex color string (e.g., '#RRGGBB').
 * @returns An object with r, g, b properties.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

/**
 * Calculates the contrast ratio between two hex colors.
 * @param color1 Hex string for the first color.
 * @param color2 Hex string for the second color.
 * @returns The contrast ratio.
 */
export const getContrastRatio = (color1: string, color2: string): number => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return 1;

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Replaces placeholders in a template string with values from a data object.
 * Placeholders are in the format {{key}}.
 * @param template The template string.
 * @param data The data object with keys matching the placeholders.
 * @returns The processed string.
 */
export const mergeTemplate = (template: string, data: Record<string, any>): string => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data.hasOwnProperty(key) ? String(data[key]) : match;
    });
};
