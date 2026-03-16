import axios from "axios";
import { faker } from "@faker-js/faker";
import * as dotenv from 'dotenv';

dotenv.config();
faker.locale = 'fr';

function randomChar() {
    const randomCharCodeLowerCase = () => Math.floor(Math.random() * ('Z'.charCodeAt(0) - 'A'.charCodeAt(0)) + 'A'.charCodeAt(0));
    return Math.random() > 0.5 ? String.fromCharCode(randomCharCodeLowerCase()) : String.fromCharCode(randomCharCodeLowerCase()).toUpperCase();
}

function addMonth(d: Date | string, months: number) {
    const date = new Date(d);
    const day = date.getDate();
    date.setMonth(date.getMonth() + +months);
    if (day !== date.getDate()) {
        date.setDate(0);
    }
    return date;
}

const format = (d: Date | string) => {
    const newD = new Date(d);
    return newD.toISOString().replace(/T[0-9:.Z]*/g, "");
}

function createRandomVendor() {
    const generateNif = () => {
        const nif = randomChar() + new Array(7).fill(0).map(() => (Math.floor(Math.random() * 9))).join('') + randomChar();
        return nif;
    }

    const date = addMonth(new Date(), -2);
    const afterOnMonthDate = new Date();
    const vendor = {
        nif: generateNif(),
        company_name: faker.company.name(),
        nrc: new Array(10).fill(0).map(() => randomChar()).join(''),
        num: new Array(10).fill(0).map(() => randomChar()).join(''),
        address: faker.address.country() + faker.address.state() + faker.address.city(),
        mobile_phone_number: faker.phone.number('06########'),
        home_phone_number: faker.phone.number('03########'),
        createdAt: format(faker.date.between(date.toISOString(), afterOnMonthDate.toISOString()))
    };

    return vendor;
}

async function generateVendors(num: number) {
    const arr = [];
    for (let i = 0; i < num; i++) {
        const vendor = createRandomVendor();
        console.log(vendor);
        arr.push(axios.post("http://localhost:8080/api/vendors/test", { ...vendor }, {
            headers: { 'Content-Type': 'application/json' }
        }));
    }
    try {
        await Promise.all(arr);
    } catch (err: any) {
        console.error(err.message);
    }
}

const count = parseInt(process.argv[2] ?? '1');
generateVendors(count);
