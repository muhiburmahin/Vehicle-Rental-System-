import { Request, Response } from "express";
import { vehicleService } from "./vehicles.service";
//create vehicle
const addVehicle = async (req: Request, res: Response) => {
    try {
        const vehicleData = req.body;

        // check field
        const requiredFields = ['vehicle_name', 'type', 'registration_number', 'daily_rent_price', 'availability_status'];

        for (const field of requiredFields) {
            if (!vehicleData[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required field: ${field}`
                });
            }
        }
        // check type
        const validTypes = ['car', 'bike', 'van', 'suv'];
        if (!validTypes.includes(vehicleData.type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid vehicle type"
            });
        }

        // check status
        const validStatuses = ['available', 'booked'];
        if (!validStatuses.includes(vehicleData.availability_status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid availability status"
            });
        }

        // check rent price
        if (vehicleData.daily_rent_price <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid daily rent price"
            });
        }

        const result = await vehicleService.addVehicle(vehicleData)

        res.status(201).json({
            success: true,
            message: "Vehicle create successfully",
            data: result
        });
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to create vehicle"
        });
    }


};
//get All Vehicles
const getAllVehicles = async (req: Request, res: Response) => {
    try {
        const result = await vehicleService.getAllVehicles();

        if (result.length === 0) {
            return res.status(500).json({
                success: false,
                message: "No vehicles found",
                data: []
            })
        }

        res.status(200).json({
            success: true,
            message: "Vehicles retrieved successfully",
            data: result
        })

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve vehicles"
        })
    }
}
//get singel Vehicles
const getSingelVehicles = async (req: Request, res: Response) => {
    const id = parseInt(req.params.vehicleId as string);
    try {
        const result = await vehicleService.getSingelVehicles(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicles get successfully",
            data: result
        })

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Vehicles not found"
        })
    }
}

//updete
const updateVehicle = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.vehicleId);
        const data = req.body;
        const result = await vehicleService.updateVehicle(id, data)
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            data: result
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to update vehicle"
        });
    };
};

//delete

const deleteVehicle = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.vehicleId);
        const result = await vehicleService.deleteVehicle(id);
        if (result.blocked) {
            return res.status(400).json({
                success: false,
                message: "Vehicle cannot be delete because it has active bookings"
            });
        }
        res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully"
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: "Failed to delete vehicle"
        });
    }
};


export const vehiclesController = {
    addVehicle, getAllVehicles, getSingelVehicles, updateVehicle, deleteVehicle
}