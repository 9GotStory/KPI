# Prompt: สร้างระบบ KPI Dashboard ด้วย Google Sheets, Apps Script และ HTML Frontend

## ภาพรวมโครงการ
สร้างระบบรวบรวมและแสดงผล KPI (Key Performance Indicators) สำหรับหน่วยบริการสาธารณสุข โดยใช้ Google Sheets เป็น database หลัก, Google Apps Script เป็น API backend, และ HTML + Tailwind CSS เป็น frontend

## โครงสร้าง Google Sheets

### 1. Sheet[Data] - Master Configuration Sheet
หัวตารางและคำอธิบาย:

| คอลัมน์ | คำอธิบาย | ตัวอย่าง |
|---------|----------|----------|
| ประเด็นขับเคลื่อน | กลุ่มหลักของ KPI | สุขภาพจิตและยาเสพติด |
| ตัวชี้วัดหลัก | ชื่อตัวชี้วัดหลัก | หญิงตั้งครรภ์คุณภาพ และการดูแลพัฒนาการเด็กปฐมวัย |
| ตัวชี้วัดย่อย | รายละเอียดตัวชี้วัด | คัดกรอง 2Q+ |
| กลุ่มเป้าหมาย | กลุ่มผู้ใช้บริการ | กลุ่มโรคเรื้อรัง |
| ชื่อหน่วยบริการ | ชื่อสถานพยาบาล/หน่วยงาน | รพ.สต.ทุ่งน้าว |
| เป้าหมาย | จำนวนเป้าหมาย | 2,622 |
| ผลงาน | จำนวนผลงานที่ทำได้ | 2,278 |
| ร้อยละ (%) | เปอร์เซ็นต์ความสำเร็จ | 86.88 |
| เกณฑ์ผ่าน (%) | เกณฑ์การผ่าน | 80.00 |
| ข้อมูลวันที่ | วันที่อัพเดทข้อมูลล่าสุด | 20 สิงหาคม 2568 เวลา 15:02 น. |
| sheet_source | ชื่อ sheet แหล่งข้อมูล | 2Q+ กลุ่มโรคเรื้อรัง |
| service_code_ref | รหัสหน่วยบริการ (primary key) | 10001 |

### 2. Source Data Sheets

#### Sheet[2Q+ กลุ่มโรคเรื้อรัง]
```
รหัสหน่วยบริการ | ชื่อหน่วยบริการ | รหัสพื้นที่ | วันที่รายงาน | ปีงบประมาณ | ประชากรกลุ่มโรคเรื้อรัง (คน) | อายุ 15-19 ปี | คัดกรอง 2Q ปกติ | อายุ 15-19 ปี คัดกรอง 2Q ผิดปกติ | อายุ 20-59 ปี คัดกรอง 2Q ปกติ | อายุ 20-59 ปี คัดกรอง 2Q ผิดปกติ | อายุ 60+ ปี คัดกรอง 2Q ปกติ | อายุ 60+ ปี คัดกรอง 2Q ผิดปกติ
```

#### Sheet[2Q+ กลุ่มหญิงตั้งครรภ์]
```
รหัสหน่วยบริการ | ชื่อหน่วยบริการ | รหัสพื้นที่ | วันที่ประมวลผล | ปีงบประมาณ | เป้าหมายหญิงตั้งครรภ์ (คน) | ได้รับการคัดกรอง 2Q (คน) | คัดกรองก่อนสิ้นสุดครรภ์ (คน) | คัดกรองหลังสิ้นสุดครรภ์ (คน) | ก่อนสิ้นสุดครรภ์ - ผลปกติ (คน) | ก่อนสิ้นสุดครรภ์ - ผลผิดปกติ (คน) | หลังสิ้นสุดครรภ์ - ผลปกติ (คน) | หลังสิ้นสุดครรภ์ - ผลผิดปกติ (คน)
```

#### Sheet[คัดกรองเบาหวาน 35+]
```
รหัสหน่วยบริการ | ชื่อหน่วยบริการ | รหัสพื้นที่ | วันที่ประมวลผล | ปีงบประมาณ | เป้าหมาย 35+ (คน) | ได้รับการคัดกรอง (คน) | ผลปกติ (คน) | เสี่ยง (คน) | เสี่ยงสูง (คน) | สงสัยป่วย (คน) | นอกเกณฑ์ (คน)
```

## Google Apps Script Requirements

### Core Functions ที่ต้องการ:

1. **getKPIConfiguration()**
   - อ่านข้อมูลจาก Sheet[Data]
   - ส่งคืน configuration ทั้งหมด
   - รวม mapping ของ sheet_source

2. **getSourceSheetData(sheetName)**
   - รับ parameter: ชื่อ sheet
   - ดึงข้อมูลดิบทั้งหมดจาก sheet นั้น
   - ส่งคืนเป็น JSON format

3. **getAllKPIData()**
   - ดึง configuration จาก Sheet[Data]
   - ดึงข้อมูลดิบจากทุก source sheets
   - รวมข้อมูลและส่งกลับเป็น structured JSON

4. **getKPIByGroup(groupName)**
   - กรองข้อมูลตามประเด็นขับเคลื่อน
   - ส่งคืนข้อมูลเฉพาะกลุ่มที่เลือก

### API Response Format:
```json
{
  "status": "success",
  "timestamp": "2025-08-21T15:02:00",
  "data": {
    "configuration": [...], // จาก Sheet[Data]
    "sourceData": {
      "2Q+ กลุ่มโรคเรื้อรัง": [...],
      "2Q+ กลุ่มหญิงตั้งครรภ์": [...],
      "คัดกรองเบาหวาน 35+": [...]
    },
    "groups": ["สุขภาพจิตและยาเสพติด", "มะเร็งครบวงจร", ...]
  }
}
```

## Frontend Requirements

### Technology Stack:
- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript
- Responsive Design

### UI Components:

1. **Dashboard Header**
   - แสดงชื่อระบบ
   - ข้อมูลอัพเดทล่าสุด
   - สรุปรวมจำนวน KPI ทั้งหมด

2. **Filter Panel**
   - กรองตามประเด็นขับเคลื่อน
   - กรองตัวชี้วัดหลัก
   - กรองตามหน่วยบริการ
   - ปุ่ม Reset Filter

3. **KPI Group Cards**
   - จัดกลุ่มตาม "ประเด็นขับเคลื่อน"
   - แสดง summary ของแต่ละกลุ่มตัวชี้วัดหลัก
   - การ์ดแต่ละอันแสดง:
     - ชื่อประเด็นขับเคลื่อน
     - จำนวน KPI ในกลุ่ม
     - ร้อยละความสำเร็จเฉลี่ย
     - สถานะ (ผ่าน/ไม่ผ่าน เกณฑ์)

4. **KPI Detail Table**
   - แสดงรายละเอียดแต่ละ KPI
   - คอลัมน์ที่แสดง: ตัวชี้วัดย่อย, หน่วยบริการ, เป้าหมาย, ผลงาน, ร้อยละ, เกณฑ์ผ่าน, วันที่อัพเดท
   - สามารถเรียงลำดับได้
   - มี pagination

5. **Modal/Popup สำหรับข้อมูลดิบ**
   - เมื่อคลิกที่ KPI ใด ๆ
   - แสดงข้อมูลดิบทั้งหมดจาก source sheet
   - แสดงทุกคอลัมน์ที่เกี่ยวข้อง

### Visual Design:
- ใช้ color coding สำหรับสถานะ (เขียว=ผ่าน, แดง=ไม่ผ่าน)
- Progress bars สำหรับแสดงร้อยละ
- Icons ที่เหมาะสมกับแต่ละประเด็นขับเคลื่อน
- Responsive layout (mobile-first)
- Loading states และ error handling

### Data Processing Logic:
- คำนวณ summary statistics
- จัดกลุ่มข้อมูลตาม configuration
- ทำ client-side filtering และ sorting
- Cache ข้อมูลเพื่อ performance

## ตัวอย่างข้อมูลทดสอบ

### Sheet[Data] Sample:
```
สุขภาพจิตและยาเสพติด||คัดกรอง 2Q+|กลุ่มโรคเรื้อรัง|รพ.สอง|2,622|2,278|86.88|80.00|20 สิงหาคม 2568 เวลา 15:02 น.|2Q+ กลุ่มโรคเรื้อรัง|10001
มะเร็งครบวงจร||คัดกรอง มะเร็งลำไส้ใหญ่ ลำไส้ตรง||รพ.สต.ทุ่งน้าว|1,131|70|6.19|50.00|20 สิงหาคม 2568 เวลา 15:15 น.|คัดกรองมะเร็ง|10002
```

## Technical Specifications:

### Google Apps Script:
- ใช้ modern ES6+ syntax
- Error handling ที่ comprehensive
- Caching mechanisms สำหรับ performance
- Rate limiting awareness
- Security considerations

### Frontend:
- Progressive enhancement
- Accessibility compliance (WCAG 2.1)
- Cross-browser compatibility
- Mobile-responsive design
- Performance optimization (lazy loading, debouncing)

### Data Flow:
1. Google Sheets ← Manual data input
2. Apps Script API ← Frontend requests
3. JSON responses → Frontend processing
4. Dynamic UI updates

## Success Criteria:
- ข้อมูลแสดงผลได้ถูกต้องตาม source
- สามารถเพิ่ม/ลด source sheets ได้โดยไม่แก้โค้ด
- ประสิทธิภาพการโหลดข้อมูลดี
- UI/UX ใช้งานง่าย และตอบสนองได้ดี
- ระบบทำงานได้เสถียร

---

**หมายเหตุ:** กรุณาสร้างระบบให้ครบทุกส่วนตามที่ระบุ พร้อมตัวอย่างการใช้งานและเอกสารประกอบ