import { pool } from "../../config/db"
//get all user
const getAllUser = async () => {
    const result = await pool.query(`
        SELECT id,name,email,phone,role FROM users 
        `)
    return result.rows
}
//update user
interface userData {
    name: string;
    email: string;
    phone: string;
    role: string;
}
const updateUser = async (id: number, data: userData) => {
    const {
        name = null,
        email = null,
        phone = null,
        role = null,
    } = data;

    const result = await pool.query(`
        UPDATE users SET
        name = COALESCE($1,name),
        email = COALESCE($2,email),
        phone = COALESCE($3,phone),
        role = COALESCE($4,role),
        updated_at = NOW()
        WHERE id = $5 RETURNING id, name ,email,phone ,role`,
        [name, email, phone, role, id]
    );
    return result.rows[0];
}
//check for delete
const checkBookings = async (id: number) => {
    const result = await pool.query(`
        SELECT COUNT(*) as count FROM bookings
        WHERE customer_id = $1 AND status = 'active'    `, [id]
    );
    return parseInt(result.rows[0].count) > 0;
}

//delete user
const deleteUser = async (id: number) => {
    const result = await pool.query(`
        DELETE FROM users
        WHERE id=$1
        RETURNING id
        `,
        [id]
    );
    return result.rows.length > 0;
};



export const userService = {
    getAllUser, updateUser, deleteUser, checkBookings
}