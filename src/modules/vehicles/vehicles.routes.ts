import express from "express";
import { vehiclesController } from "./vehicles.controller";
import auth from "../../middleware/auth";
const router = express.Router();

router.post("/", auth("admin"), vehiclesController.addVehicle)
router.get("/", vehiclesController.getAllVehicles)
router.get("/:vehicleId", vehiclesController.getSingelVehicles)
router.put("/:vehicleId", auth("admin"), vehiclesController.updateVehicle)
router.delete("/:vehicleId", auth("admin"), vehiclesController.deleteVehicle)

export const vehiclesRouter = router;