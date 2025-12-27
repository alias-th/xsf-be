import { FastifyReply, FastifyRequest } from "fastify";
import fsPromise from "fs/promises";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const unlinkLocalFiles = async (opt: { filepaths: string[] }) => {
  for (const filepath of opt.filepaths) {
    await fsPromise.unlink(path.join(process.cwd(), "uploads", filepath));
  }
};

const saveUploadedFile = async (
  files: Array<{ filename: string; mimetype?: string; buffer: Buffer }>,
  reply: FastifyReply
): Promise<string[]> => {
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "uploads");
  await fsPromise.mkdir(uploadsDir, { recursive: true });

  // Temporarily store uploaded files
  const savedFiles: string[] = [];
  for (const file of files) {
    const original = file.filename || "file";
    const safe = path.basename(original);
    const uniq = `${Date.now()}-${uuidv4()}-${safe}`;
    const filepath = path.join(uploadsDir, uniq);

    try {
      await fsPromise.writeFile(filepath, file.buffer);
      savedFiles.push(uniq);
    } catch (error) {
      throw error;
    }
  }

  return savedFiles;
};

type Options = {
  filepaths: string[];
  bucketName: string;
  publicUrl: string;
};
const uploadToS3 = async (
  s3Client: S3Client,
  opt: Options
): Promise<string[]> => {
  // Upload each file to S3
  for (const filepath of opt.filepaths) {
    const fileStream = fs.createReadStream(
      path.join(process.cwd(), "uploads", filepath)
    );

    const uploadParams = {
      Bucket: opt.bucketName,
      Key: filepath,
      Body: fileStream,
    };

    try {
      await s3Client.send(new PutObjectCommand(uploadParams));
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw error;
    }
  }

  // Remove local files after upload
  await unlinkLocalFiles({ filepaths: opt.filepaths });

  // Get urls of uploaded files
  const uploadedUrls = opt.filepaths.map((filepath) => filepath);

  return uploadedUrls;
};
export { saveUploadedFile, uploadToS3, unlinkLocalFiles };
