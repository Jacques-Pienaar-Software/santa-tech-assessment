import { AuthedRequest } from "../../middleware/authGuard";
import { createMediaInput } from "./mediaTypes";

export interface CreateMediaRequest extends AuthedRequest {
  body: createMediaInput;
  file?: Express.Multer.File;
}
