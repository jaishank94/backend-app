import { S3Client, PutObjectCommand , DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
// Set your AWS credentials and region
const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY,
    },
});

// Reusable function to upload a file to S3
export async function uploadFileToS3(file, destination, acl = 'public-read') {
    const bucketName = process.env.S3_BUCKET;

    try {
        // Set the parameters for S3 upload
        const params = {
            Bucket: bucketName,
            Key: destination,
            Body: file.data,
            ACL: acl,
        };

        // Upload the file to S3
        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        // Generate a presigned URL for the uploaded object
        let presignedUrl = await getSignedUrl(s3Client, new PutObjectCommand({
            Bucket: bucketName,
            Key: destination,
        }));
        presignedUrl = presignedUrl.split('?')[0];
        return presignedUrl;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}


export function genKeyFromFilename(keyBase, fileName, prefixArr) {
    if (fileName.length <= 0) {
        return "";
    }
    var ext = fileName.split(".").pop();
    var key = '';
    if (keyBase && keyBase.length > 0) {
        key += keyBase + "/";
    }
    if (prefixArr && prefixArr.length > 0) {
        key += prefixArr.join("-");
        key += "-";
    }
    key += crypto.randomBytes(8).toString('hex') + "." + ext;

    return key;

};

// Function to delete a file from S3
export async function deleteFileFromS3(key) {
    const bucketName = process.env.S3_BUCKET;

    try {
        const params = {
            Bucket: bucketName,
            Key: key,
        };

        const command = new DeleteObjectCommand(params);
        await s3Client.send(command);
        console.log('File deleted successfully from S3');
    } catch (error) {
        console.error('Error deleting file from S3:', error);
        throw error;
    }
}

//module.exports = { uploadFileToS3, genKeyFromFilename , deleteFileFromS3};
// // Example usage
// const file = req.files.file; // Assuming the file is coming in req.files.file
// const destination = 'destination/path/in/s3/' + file.name; // Adjust the destination path

// uploadFileToS3(file, destination)
//   .then((presignedUrl) => {
//     console.log('File uploaded successfully. File URL:', presignedUrl);

//     // Respond to the client or perform any other necessary actions
//     res.status(200).json({ message: 'File uploaded successfully', fileUrl: presignedUrl });
//   })
//   .catch((error) => {
//     console.error('Error uploading file:', error);

//     // Handle the error and respond to the client
//     res.status(500).json({ error: 'Error uploading file' });
//   });