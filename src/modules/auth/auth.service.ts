import bcrypt from "bcryptjs";
import { pool } from "../../config/db";
import jwt from "jsonwebtoken"
import config from "../../config";

interface UserData {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: string;
}

const Register = async (userData: UserData) => {
    const { name, email, password, phone, role } = userData;
    const hashPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(`
          INSERT INTO users (name, email, password, phone, role) VALUES ($1,$2,$3,$4,$5) RETURNING id,name, email,phone, role`, [name, email, hashPassword, phone, role]
    );

    return result.rows[0];
};

// Login user

const loginUser = async (email: string, password: string) => {
    const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);

    if (result.rows.length === 0) {
        return null;
    }
    const user = result.rows[0];
    //check password
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
        return false;
    }

    // Token genaret
    const secret = config.jwt_secret as string;
    const paylpde = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    }

    const token = jwt.sign(paylpde, secret, { expiresIn: '7d' });
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        }
    }
}

export const authService = {
    Register, loginUser
}
