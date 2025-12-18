import express, { Request, Response } from "express";
import initDB from "./config/db";
import { authRouter } from "./modules/auth/auth.routes";
import { vehiclesRouter } from "./modules/vehicles/vehicles.routes";
import { userRouter } from "./modules/users/users.routes";
import { bookingController } from "./modules/bookings/booking.controller";
import { bookingRouter } from "./modules/bookings/booking.routes";
const app = express();
app.use(express.json());

console.log("Connection string exists:", !!process.env.CONNECTION_STR);
console.log("Database initilize starting");

initDB()
    .then(() => {
        console.log("DB initilize successfully")
    })
    .catch(err => {
        console.error("Error message :", err.message);
    })
//check route work
app.get("/", (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "Vehicle Rental System API is Working"
    })
});

//API
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/vehicles", vehiclesRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/bookings", bookingRouter);


//chech 404 error
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    })
})

//check global error
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error("Global error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    })
});

export default app;

