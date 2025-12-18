import express from "express";
import { userController } from "./users.controller";
import auth from "../../middleware/auth";
const router = express.Router();

router.get("/", auth("admin"), userController.getAllUser);
router.put("/:userId", auth("admin", "customer"), userController.updateUser);
router.delete("/:userId", auth("admin"), userController.deleteUser);

export const userRouter = router;