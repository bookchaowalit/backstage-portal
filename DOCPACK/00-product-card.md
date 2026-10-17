---
title: Solo Empire Backstage — Product Card
doc_id: CARD-solo-empire-backstage
doc_type: product-card
verdict: template
version: 0.1
date: 2026-10-08
status: ร่างเพื่อพิจารณา
owner: Product owner (Book Dev)
---

# Solo Empire Backstage — Product Card

## 1. สรุปคุณค่าในหนึ่งประโยค

Backstage developer portal ที่ตั้งใจเป็น software catalog, scaffolder, TechDocs และ search ของ repo ใน Solo Empire แต่ปัจจุบันยังโหลดเฉพาะ entity ตัวอย่าง

## 2. ปัญหาและผู้ใช้เป้าหมาย

- เจ้าของมี repo จำนวนมากและต้องการ catalog เดียวที่ค้นได้
- ผู้ใช้: เจ้าของคนเดียว (ทีมพัฒนาเดียว)

## 3. สิ่งที่ทำได้จริงตอนนี้

- Backstage app + backend จาก scaffold มาตรฐาน; catalog อ่าน `examples/entities.yaml`, `examples/org.yaml` และแม่แบบตัวอย่าง
- ตั้งค่า sign-in: guest ใน dev, GitHub OAuth ใน production; config production อ่าน Postgres จาก environment
- มี config test ใน backend และ Playwright smoke

## 4. หลักฐานสถานะ

- Stack: ไม่ตรวจพบ framework หลักจากตัวเก็บข้อเท็จจริง
- Commits: 7 (แรก 2026-09-06 → ล่าสุด 2026-10-01), branch `main`; working tree สะอาด
- Source: 26 ไฟล์ / 970 บรรทัด; test 6 ไฟล์
- CI: 1 workflow
- Deploy config: ไม่มี
- Live URL: ไม่พบใน repo

## 5. คุณค่าและจุดต่าง

- README ยอมรับเองว่ายังใกล้ upstream scaffold
- Solo Empire มี `repository-catalog/` และ `infra/dashboard/web` ที่ทำหน้าที่ catalog ได้อยู่แล้ว จึงไม่มีจุดต่าง
- ไม่มีมุมรายได้

## 6. ช่องว่างสำคัญ

- ไม่มี entity จริงของ Solo Empire ใน catalog
- ไม่มี plugin หรือการปรับแต่งเฉพาะ
- ต้นทุนดูแล Backstage (Node, Yarn, Postgres) สูงเมื่อเทียบกับประโยชน์สำหรับคนเดียว

## 7. คำตัดสิน

**template** — เป็น scaffold ที่ยังไม่มีข้อมูลของเจ้าของ ใช้ได้เป็นจุดเริ่มต้นหากต้องการ Backstage จริงในอนาคต

จะเป็น `showcase` เมื่อ generate `catalog-info.yaml` จาก `repository-catalog/registries` และแสดง repo จริงได้; ถ้าไม่ทำใน 3 เดือนให้ `archive`

## 8. ขั้นต่อไป

1. ติดป้าย template ใน README
2. ตัดสินใจว่าจะใช้ Backstage หรือคง `repository-catalog` เป็น catalog หลัก

## การอนุมัติ

| บทบาท                    | สถานะ     | วันที่ | ลงนาม            |
| ------------------------ | --------- | ------ | ---------------- |
| Product owner (Book Dev) | รอพิจารณา | —      | \_\_\_\_\_\_\_\_ |

## แหล่งข้อมูล

- `README.md`
- `app-config.yaml`
- `examples/entities.yaml`
- `packages/backend/`
