import { Request, Response } from "express"
import { authService } from "./auth.service";

const signUp = async (req: Request, res: Response) => {
    try {
        const userData = req.body;
        // valid user field
        if (!userData.name || !userData.email || !userData.password || !userData.phone || !userData.role) {
            res.status(400).json({
                success: false,
                message: "All feild required"
            })
        }

        //check password velidation
        if (userData.password.length < 6) {
            res.status(400).json({
                success: false,
                message: "password length must minimum 6"
            })
        };

        //check role velidation
        if (!['admin', 'customer'].includes(userData.role)) {
            res.status(400).json({
                success: false,
                message: "role must use either admin or customer"
            })
        }

        const result = await authService.Register(userData);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result
        })
    }
    catch (err: any) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }

};

const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email & password required"
            });
        }
        const result = await authService.loginUser(email, password);

        if (result == null || result == false) {
            res.status(401).json({
                success: false,
                message: "User not found"
            });
        }


        res.status(200).json({
            success: true,
            message: "User login successfully",
            data: result
        })

    }
    catch (err: any) {
        res.status(500).json({
            success: false,
            message: "Login failed",
            errors: err.message
        });
    }
}

export const authController = {
    signUp,
    loginUser
}
