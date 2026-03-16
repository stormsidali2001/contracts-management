import axios from "axios";
import mysql from 'mysql2/promise';
import bluebird from 'bluebird';
import * as dotenv from 'dotenv';

dotenv.config();

async function generateUsers(directions: any[]) {
    if (directions.length === 0) return;
    const arr = [];

    const count = parseInt(process.argv[2] ?? '1');
    for (let i = 0; i < count; i++) {
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        const randomDepartement = randomDirection.departements[Math.floor(Math.random() * randomDirection.departements.length)];
        
        const user1 = {
            username: "storm.sidali",
            firstName: "sidali",
            lastName: "assoul",
            email: "assoulsidali@gmail.com",
            role: "EMPLOYEE",
            departementId: randomDepartement.id,
            directionId: randomDirection.id,
            password: '123456',
        }
        const user2 = {
            username: "admin.admin",
            firstName: "admin",
            lastName: "admin",
            email: "admin@gmail.com",
            role: "ADMIN",
            password: '123456',
        }
        const user3 = {
            username: "juridical.adala",
            firstName: "juridical",
            lastName: "adala",
            email: "juridical@gmail.com",
            role: "JURIDICAL",
            password: '123456',
        }
        const user4 = {
            username: "admin1.admin1",
            firstName: "admin1",
            lastName: "admin1",
            email: "admin1@gmail.com",
            role: "ADMIN",
            password: '123456',
        }

        console.log(user1, user2, user3, user4);
        arr.push(axios.post("http://localhost:8080/api/auth/register/test", user1, { headers: { 'Content-Type': 'application/json' } }));
        arr.push(axios.post("http://localhost:8080/api/auth/register/test", user2, { headers: { 'Content-Type': 'application/json' } }));
        arr.push(axios.post("http://localhost:8080/api/auth/register/test", user3, { headers: { 'Content-Type': 'application/json' } }));
        arr.push(axios.post("http://localhost:8080/api/auth/register/test", user4, { headers: { 'Content-Type': 'application/json' } }));
    }
    try {
        await Promise.all(arr);
    } catch (err: any) {
        console.error(err.message);
    }
}

(async function main() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_DATABASE_HOST,
            user: process.env.MYSQL_USERNAME,
            database: process.env.MYSQL_DATABASE_NAME,
            password: process.env.MYSQL_PASSWORD,
            Promise: bluebird as any
        });

        const [directionsRaw]: any = await connection.execute(`select * from directions`, []);
        const directions = [];
        for (const direction of directionsRaw) {
            const [departements]: any = await connection.execute("select * from departements where directionId = ?", [direction.id]);
            direction.departements = departements;
            directions.push(direction);
        }
        
        await generateUsers(directions);
        await connection.end();
    } catch (err) {
        console.error(err);
    }
})();
