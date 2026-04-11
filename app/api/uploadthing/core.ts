import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { isStaff } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 10,
    },
  })
    .middleware(async ({ req }) => {
      // 관리자 인증 확인
      const staff = await isStaff();
      if (!staff) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: "staff" };
    })
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),

  thumbnailUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const staff = await isStaff();
      if (!staff) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: "staff" };
    })
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),

  documentUploader: f({
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    "application/pdf": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const staff = await isStaff();
      if (!staff) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: "staff" };
    })
    .onUploadComplete(async ({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
