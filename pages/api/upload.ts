import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";
import formidable, { File } from "formidable";
import crypto from "crypto";
import { unstable_getServerSession } from "next-auth/next"

import { authOptions } from "./auth/[...nextauth]";

/* Don't miss that! */
export const config = {
  api: {
    bodyParser: false,
  },
};

type ProcessedFiles = Array<[string, File]>;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }

  let status = 200,
    resultBody = {
      status: "ok",
      message: "Files were uploaded successfully",
      links: [""],
    };

  /* Get files using formidable */
  const files = await new Promise<ProcessedFiles | undefined>(
    (resolve, reject) => {
      const form = new formidable.IncomingForm();
      const files: ProcessedFiles = [];
      form.on("file", function (field, file) {
        files.push([field, file]);
      });
      form.on("end", () => resolve(files));
      form.on("error", (err) => reject(err));
      form.parse(req, () => {
        //
      });
    }
  ).catch((e) => {
    console.log(e);
    status = 500;
    resultBody = {
      status: "fail",
      message: "Upload error",
      links: [],
    };
  });

  if (files?.length) {
    /* Create directory for uploads */
    const targetPath = path.join(process.cwd(), `/public/uploads/`);
    try {
      await fs.access(targetPath);
    } catch (e) {
      await fs.mkdir(targetPath);
    }

    /* Move uploaded files to directory */
    let links: string[] = [];
    for (const file of files) {
      let filePath = crypto.randomUUID();

      const tempPath = file[1].filepath;
      const extension = file[1].originalFilename?.split(".");
      if (extension) {
        filePath = filePath.toString() + "." + extension[extension.length - 1];
        console.log(path.extname(tempPath));
        await fs.rename(tempPath, targetPath + filePath);
        links.push(filePath);
      }
    }
    resultBody.links = links;
  }
  res.status(status).json(resultBody);
};

export default handler;
