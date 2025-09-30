/**
 * A service to simulate interactions with a cloud storage provider like S3 or GCS.
 * This pattern is used for securely uploading files directly from the client.
 */
export const storageService = {
    /**
     * Simulates asking the backend for a secure, short-lived URL to upload a file to.
     * In a real app, this would make an API call to your server, which would then
     * communicate with the cloud provider to generate the URL.
     *
     * @param fileName The name of the file to be uploaded.
     * @param fileType The MIME type of the file.
     * @returns A promise that resolves with a simulated pre-signed URL object.
     */
    getPresignedUploadUrl: (fileName: string, fileType: string): Promise<{ uploadUrl: string; fileId: string }> => {
        console.log(`[StorageService] Requesting pre-signed URL for ${fileName} (${fileType})`);
        return new Promise((resolve) => {
            // Simulate a network delay
            setTimeout(() => {
                const fileId = `import_${Date.now()}_${fileName}`;
                // The URL is a dummy since we're not actually uploading,
                // but it demonstrates the pattern.
                const uploadUrl = `https://fake-storage-provider.com/uploads/${fileId}?signature=...`;
                console.log(`[StorageService] Generated pre-signed URL: ${uploadUrl}`);
                resolve({ uploadUrl, fileId });
            }, 500);
        });
    },

    /**
     * Simulates uploading a file to the pre-signed URL.
     * In a real app, this would be a `fetch` call with a `PUT` method.
     * For this demo, it does nothing but return success.
     *
     * @param uploadUrl The pre-signed URL received from the backend.
     * @param file The file object to upload.
     * @returns A promise that resolves when the upload is complete.
     */
    uploadFile: (uploadUrl: string, file: File): Promise<Response> => {
        console.log(`[StorageService] Simulating upload of ${file.name} to ${uploadUrl}`);
        return new Promise((resolve) => {
             // Simulate a network delay
            setTimeout(() => {
                console.log(`[StorageService] Upload of ${file.name} complete.`);
                // Return a Response-like object for consistency
                resolve({ ok: true, status: 200 } as Response);
            }, 1000);
        });
    }
};