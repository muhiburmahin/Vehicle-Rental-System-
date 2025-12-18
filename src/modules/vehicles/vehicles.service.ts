import { pool } from "../../config/db";

interface VehicleData {
    vehicle_name: string;
    type: string;
    registration_number: string;
    daily_rent_price: number;
    availability_status: string;
}

const addVehicle = async (vehicleData: VehicleData) => {

    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = vehicleData;

    const result = await pool.query(`
       INSERT  INTO vehicles (vehicle_name, type, registration_number, daily_rent_price,
        availability_status) VALUES ($1,$2,$3,$4,$5) RETURNING id,vehicle_name, type, registration_number,
        daily_rent_price, availability_status`, [vehicle_name, type, registration_number, daily_rent_price,
        availability_status]
    )
    return result.rows[0];
}

//get all vehicle
const getAllVehicles = async () => {
    const result = await pool.query(`
        SELECT id,vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles `);

    return result.rows;
}
//get single vehicle
const getSingelVehicles = async (id: number) => {
    const result = await pool.query(`
        SELECT id,vehicle_name, type, registration_number, daily_rent_price, availability_status  FROM vehicles 
        WHERE id = $1`, [id]);

    return result.rows[0];
}

//updete
interface UpdateData {
    vehicle_name?: string;
    type?: string;
    registration_number?: string;
    daily_rent_price?: number;
    availability_status?: string;
}
const updateVehicle = async (id: number, data: UpdateData) => {
    const {
        vehicle_name = null,
        type = null,
        registration_number = null,
        daily_rent_price = null,
        availability_status = null
    } = data;

    const result = await pool.query(`
        UPDATE vehicles
        SET
            vehicle_name = COALESCE($1, vehicle_name),
            type = COALESCE($2, type),
            registration_number = COALESCE($3, registration_number),
            daily_rent_price = COALESCE($4, daily_rent_price),
            availability_status = COALESCE($5, availability_status)
        WHERE id = $6
        RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status
        `,
        [
            vehicle_name,
            type,
            registration_number,
            daily_rent_price,
            availability_status,
            id
        ]
    );
    return result.rows[0];
};
//delet
const deleteVehicle = async (id: number) => {
    // active bookings
    const bookingCheck = await pool.query(`
        SELECT id FROM bookings
        WHERE vehicle_id = $1 AND status= 'active'`,
        [id]
    );

    if (bookingCheck.rows.length > 0) {
        return { blocked: true };
    }
    const result = await pool.query(`
        DELETE FROM vehicles
        WHERE id = $1
        RETURNING id, vehicle_name
        `,
        [id]
    );

    return { blocked: false };
};


export const vehicleService = {
    addVehicle, getAllVehicles, getSingelVehicles, updateVehicle, deleteVehicle
}