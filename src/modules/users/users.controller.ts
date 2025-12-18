import { Request as ExpressRequest, Response } from "express";
import { userService } from "./users.service";
import { JwtPayload } from 'jsonwebtoken';

//extends request localy
interface Request extends ExpressRequest {
    user?: JwtPayload & {
        id: number;
        email: string;
        role: string;
    };
}

const getAllUser = async (req: Request, res: Response) => {
    try {
        const result = await userService.getAllUser();
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: result
        })
    }
    catch (err: any) {
        res.status(500).json({
            success: false,
            message: "Users not found"
        })
    }

}

//update user
const updateUser = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.userId as string);
        const updateData = req.body;
        const currentUser = req.user;

        // check customer trying to update toher profile
        if (currentUser?.role === "customer" && currentUser?.id !== id) {
            return res.status(403).json({
                success: false,
                message: "Forbidden	,Valid token but insufficient permissions"
            });
        }

        //check role
        if (updateData.role && currentUser?.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden error, Only admins can update user"
            });
        }

        const result = await userService.updateUser(id, updateData);
        if (!result) {
            res.status(404).json({
                success: false,
                message: "Failed to update user"
            });
        }
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: result
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to update user"
        });
    };
};

//check delet user
const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.userId as string);

        // check fis active bookings
        const activeBookings = await userService.checkBookings(id);

        if (activeBookings) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete user because bookings active",
            });
        }

        // delete user
        const result = await userService.deleteUser(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                errors: "No user exists with this ID"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: "Failed to delete user"
        });
    }
}

export const userController = {
    getAllUser, updateUser, deleteUser
}
