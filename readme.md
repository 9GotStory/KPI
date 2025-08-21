# ระบบ Dashboard ตัวชี้วัด สำหรับหน่วยบริการสาธารณสุข

## ภาพรวมโครงการ

ระบบ Dashboard ตัวชี้วัดนี้ถูกพัฒนาขึ้นเพื่อรวบรวมและแสดงผลตัวชี้วัดสำคัญ (Key Performance Indicators) สำหรับหน่วยบริการสาธารณสุข โดยใช้ Google Sheets เป็นฐานข้อมูลหลัก, Google Apps Script เป็น API backend, และ HTML + Tailwind CSS เป็น frontend

## คุณสมบัติหลัก

### 📊 Dashboard หลัก
- แสดงสรุปตัวชี้วัดทั้งหมด
- การ์ดสรุปตามประเด็นขับเคลื่อน
- ตารางรายละเอียดตัวชี้วัดพร้อม pagination
- ระบบกรองข้อมูลแบบ real-time

### 🔍 ระบบกรองข้อมูล
- กรองตามประเด็นขับเคลื่อน
- กรองตามตัวชี้วัดหลัก
- กรองตามหน่วยบริการ
- ปุ่มรีเซ็ตฟิลเตอร์

### 📱 Responsive Design
- รองรับการใช้งานบนมือถือ
- UI/UX ที่ใช้งานง่าย
- Loading states และ error handling

### 📈 การแสดงผลข้อมูล
- Progress bars สำหรับแสดงร้อยละ
- Color coding สำหรับสถานะ (เขียว=ผ่าน, แดง=ไม่ผ่าน)
- Modal popup สำหรับดูข้อมูลดิบ
- การเรียงลำดับข้อมูลในตาราง

## โครงสร้างไฟล์

\`\`\`
indicator-dashboard/
├── index.html          # หน้าเว็บหลัก
├── dashboard.js        # JavaScript สำหรับ frontend
├── apps-script.js      # Google Apps Script backend
└── README.md          # เอกสารนี้
\`\`\`

## การติดตั้งและใช้งาน

### 1. ตั้งค่า Google Sheets

1. สร้าง Google Sheets ใหม่
2. สร้าง Sheet ชื่อ "Data" พร้อมหัวตารางดังนี้:
   - ประเด็นขับเคลื่อน
   - ตัวชี้วัดหลัก
   - ตัวชี้วัดย่อย
   - กลุ่มเป้าหมาย
   - ชื่อหน่วยบริการ
   - เป้าหมาย
   - ผลงาน
   - ร้อยละ (%)
   - เกณฑ์ผ่าน (%)
   - ข้อมูลวันที่
   - sheet_source
   - service_code_ref

3. สร้าง Source Data Sheets ตามต้องการ เช่น:
   - "2Q+ กลุ่มโรคเรื้อรัง"
   - "2Q+ กลุ่มหญิงตั้งครรภ์"
   - "คัดกรองเบาหวาน 35+"

### 2. ตั้งค่า Google Apps Script

1. เปิด Google Apps Script (script.google.com)
2. สร้างโปรเจ็กต์ใหม่
3. คัดลอกโค้ดจากไฟล์ `apps-script.js` ไปใส่
4. เชื่อมต่อกับ Google Sheets ของคุณ
5. Deploy เป็น Web App:
   - Execute as: Me
   - Who has access: Anyone

### 3. ตั้งค่า Frontend

1. แก้ไข URL ใน `dashboard.js` ให้ชี้ไปยัง Google Apps Script Web App ของคุณ
2. อัพโหลดไฟล์ `index.html` และ `dashboard.js` ไปยัง web server
3. เปิดใช้งานผ่าน web browser
4. หากพบปัญหา CORS ในระหว่างการพัฒนา ระบบจะเรียก API ผ่านตัวกลางที่ `https://cors.isomorphic-git.org/` คุณสามารถเปลี่ยนหรือลบ URL นี้ได้ใน `dashboard.js` เมื่อใช้งานจริง

## การใช้งาน

### การกรองข้อมูล
- เลือกประเด็นขับเคลื่อนจาก dropdown
- เลือกตัวชี้วัดหลักที่ต้องการดู
- เลือกหน่วยบริการเฉพาะ
- คลิก "รีเซ็ต" เพื่อล้างฟิลเตอร์ทั้งหมด

### การดูข้อมูลดิบ
- คลิกปุ่ม "ดูข้อมูลดิบ" ในตารางรายละเอียด
- Modal จะแสดงข้อมูลทั้งหมดจาก source sheet

### การเรียงลำดับ
- คลิกที่หัวตารางเพื่อเรียงลำดับข้อมูล
- รองรับการเรียงลำดับแบบ ascending และ descending

## API Endpoints

### Google Apps Script Web App รองรับ actions ดังนี้:

- `?action=getAllIndicatorData` - ดึงข้อมูลทั้งหมด
- `?action=getIndicatorConfiguration` - ดึงการตั้งค่าจาก Sheet[Data]
- `?action=getSourceSheetData&sheetName=ชื่อsheet` - ดึงข้อมูลจาก sheet เฉพาะ
- `?action=getIndicatorByGroup&groupName=ชื่อกลุ่ม` - ดึงข้อมูลตามประเด็นขับเคลื่อน

## ตัวอย่างข้อมูล

### Sheet[Data] ตัวอย่าง:
\`\`\`
สุขภาพจิตและยาเสพติด | หญิงตั้งครรภ์คุณภาพ และการดูแลพัฒนาการเด็กปฐมวัย | คัดกรอง 2Q+ | กลุ่มโรคเรื้อรัง | รพ.สต.ทุ่งน้าว | 2622 | 2278 | 86.88 | 80.00 | 20 สิงหาคม 2568 เวลา 15:02 น. | 2Q+ กลุ่มโรคเรื้อรัง | 10001
\`\`\`

## การปรับแต่งและขยายระบบ

### เพิ่มตัวชี้วัดใหม่
1. เพิ่มข้อมูลใน Sheet[Data]
2. สร้าง Source Sheet ใหม่ (ถ้าจำเป็น)
3. ระบบจะอัพเดทอัตโนมัติ

### เปลี่ยนแปลงการแสดงผล
- แก้ไขไฟล์ `dashboard.js` สำหรับ logic
- แก้ไขไฟล์ `index.html` สำหรับ UI

### เพิ่มฟีเจอร์ใหม่
- เพิ่ม API endpoint ใน `apps-script.js`
- เพิ่ม frontend logic ใน `dashboard.js`

## การแก้ไขปัญหา

### ข้อมูลไม่แสดง
1. ตรวจสอบ URL ของ Google Apps Script
2. ตรวจสอบสิทธิ์การเข้าถึง Google Sheets
3. ตรวจสอบ Console ใน Developer Tools

### ข้อผิดพลาดใน Google Apps Script
1. ตรวจสอบชื่อ Sheet ให้ถูกต้อง
2. ตรวจสอบหัวตารางใน Sheet[Data]
3. ตรวจสอบ Execution Transcript ใน Apps Script

## ข้อกำหนดระบบ

- Google Sheets (ฟรี)
- Google Apps Script (ฟรี)
- Web Browser ที่รองรับ HTML5
- Internet connection

## การรักษาความปลอดภัย

- ใช้ HTTPS สำหรับการเข้าถึง
- จำกัดสิทธิ์การเข้าถึง Google Sheets
- ตรวจสอบ input validation ใน Apps Script

## การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ กรุณาตรวจสอบ:
1. เอกสารนี้
2. Console logs ใน browser
3. Execution logs ใน Google Apps Script

---

**หมายเหตุ:** ระบบนี้ถูกออกแบบให้ใช้งานง่ายและปรับแต่งได้ตามความต้องการของแต่ละหน่วยงาน
