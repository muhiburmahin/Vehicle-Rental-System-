import { pool } from "../../config/db";

//check Availabil
const checkAvailabil = async (id: number) => {
    const result = await pool.query(`
        SELECT availability_status FROM vehicles
        WHERE id=$1`, [id]
    );
    if (result.rows.length === 0) {
        throw new Error("Vehicle not found");
    }

    return result.rows[0].availability_status === "available";
};

//Total Cost 
const calculateTotalPrice = async (id: number, startDate: string, endDate: string) => {

    // get daily rent price
    const dailyPrice = await pool.query(`
        SELECT daily_rent_price FROM vehicles 
        WHERE id = $1 `, [id]
    );

    if (dailyPrice.rows.length === 0) {
        throw new Error("Vehicle not found.")
    }
    const dailyRate = parseFloat(dailyPrice.rows[0].daily_rent_price);

    // calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return dailyRate * days
};


//Create booking
interface BookingData {
    customer_id: number;
    vehicle_id: number;
    rent_start_date: string;
    rent_end_date: string;
}
const createBooking = async (bookingData: BookingData) => {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = bookingData;
    const totalPrice = await calculateTotalPrice(vehicle_id, rent_start_date, rent_end_date);

    // Create booking
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const bookingResult = await client.query(
            `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) 
             VALUES ($1, $2, $3, $4, $5, 'active') 
             RETURNING *`, [customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice]
        );
        await client.query(
            `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`,
            [vehicle_id]
        );
        await client.query("COMMIT");
        const vehicleResult = await pool.query(
            `SELECT vehicle_name, daily_rent_price FROM vehicles WHERE id = $1`,
            [vehicle_id]
        );

        return {
            ...bookingResult.rows[0],
            vehicle: vehicleResult.rows[0]
        };
    } catch (err: any) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }

};

//get all bookin
const getAllBookings = async () => {
    const result = await pool.query(
        `SELECT 
            b.*,
            u.name as customer_name,
            u.email as customer_email,
            v.vehicle_name,
            v.registration_number
         FROM bookings b
         JOIN users u ON b.customer_id = u.id
         JOIN vehicles v ON b.vehicle_id = v.id
         ORDER BY b.id DESC`
    );
    return result.rows.map(row => ({
        id: row.id,
        customer_id: row.customer_id,
        vehicle_id: row.vehicle_id,
        rent_start_date: row.rent_start_date,
        rent_end_date: row.rent_end_date,
        total_price: row.total_price,
        status: row.status,
        customer: {
            name: row.customer_name,
            email: row.customer_email
        },
        vehicle: {
            vehicle_name: row.vehicle_name,
            registration_number: row.registration_number
        }
    }));
};

//get booking customer 
const getBookingsByCustomer = async (customerId: number) => {
    const result = await pool.query(
        `SELECT 
            b.id, b.vehicle_id, b.rent_start_date,
            b.rent_end_date, b.total_price, b.status,
            v.vehicle_name,  v.registration_number, v.type
         FROM bookings b
         JOIN vehicles v ON b.vehicle_id =v.id
         WHERE b.customer_id = $1
         ORDER BY b.id DESC`,
        [customerId]
    );
    return result.rows.map(row => ({
        id: row.id,
        vehicle_id: row.vehicle_id,
        rent_start_date: row.rent_start_date,
        rent_end_date: row.rent_end_date,
        total_price: row.total_price,
        status: row.status,
        vehicle: {
            vehicle_name: row.vehicle_name,
            registration_number: row.registration_number,
            type: row.type
        }
    }));
};

//check is booking for update
const checkIsBooking = async (bookingId: number) => {
    const result = await pool.query(
        `SELECT * FROM bookings WHERE id = $1`,
        [bookingId]
    );
    return result.rows[0] || null;
};

const updateBookingStatus = async (bookingId: number, status: string) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        // Update booking status
        const bookingResult = await client.query(
            `UPDATE bookings 
             SET status = $1, updated_at = NOW() 
             WHERE id = $2 
             RETURNING id,customer_id,  vehicle_id ,   rent_start_date, rent_end_date, total_price ,  
             status`,
            [status, bookingId]
        );
        const booking = bookingResult.rows[0];

        if (status === "returned" || status === "cancelled") {
            await client.query(
                `UPDATE vehicles 
                 SET availability_status = 'available' 
                 WHERE id = $1`,
                [booking.vehicle_id]
            );

            // Get vehicle details
            const vehicleResult = await client.query(
                `SELECT availability_status FROM vehicles WHERE id = $1`,
                [booking.vehicle_id]
            );
            await client.query("COMMIT");
            return {
                ...booking,
                vehicle: vehicleResult.rows[0]
            };
        }

        await client.query("COMMIT");
        return booking;
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }
    finally {
        client.release();
    }
};

export const bookingServices = {
    checkAvailabil, createBooking, getAllBookings, getBookingsByCustomer,
    checkIsBooking, updateBookingStatus
};