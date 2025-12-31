# XSF FullStack Developer Test

แพลตฟอร์มออนไลน์ที่รวบรวมวัสดุตกแต่งพื้นผิวสำหรับบ้านและอาคาร พัฒนาโดยใช้ Fastify, Mongodb.

---

## Features

- Get all product
- Get a product
- Get all categories
- Create a deal
- Create a product
- Update a product
- Delete a product

---

## DB Diagram

https://dbdiagram.io/d/xsf-test-694f7dab39fa3db27b9e68a2

---

## Environment Variables

| ตัวแปร        |
| ------------- |
| `MONGODB_URI` |
| `PORT`        |
| `S3`          |

---

## กำหนด Environment Variables

1. สร้าง `.env` ไว้ใน root directory ของ project:

   ```bash
   touch .env
   ```

2. กำหนดตัวแปรตามตารางด้านบน

---

## เริ่มการทำงานโดยใช้คำสั่งต่อไปนี้

1. ติดตั้ง dependencies:

   ```bash
   npm install
   ```

2. เริ่มการทำงาน :

   ```bash
   npm run dev
   ```

---

## Postman Document

https://documenter.getpostman.com/view/32892772/2sBXVbJuPY
