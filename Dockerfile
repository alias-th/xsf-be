# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# ติดตั้ง dependencies สำหรับการ build
COPY package*.json ./
RUN npm install

# คัดลอก Source code และ tsconfig
COPY . .

# รันคำสั่งคอมไพล์ (tsc) ซึ่งจะสร้างโฟลเดอร์ dist/
RUN npm run build

# --- Stage 2: Production Runtime ---
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# คัดลอกเฉพาะไฟล์ที่จำเป็น
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# ติดตั้งเฉพาะ Production dependencies (ไม่มีพวก tsc หรือ devDeps)
RUN npm install --omit=dev

# ใช้ Non-root user เพื่อความปลอดภัย
USER node

EXPOSE 8080

# ชี้ไปที่ dist/index.js ตามที่คุณระบุ
CMD ["node", "dist/index.js"]