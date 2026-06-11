export const formatPhone = (phone: string) => `"${phone}"`;
export const cleanPhone = (phone: string | number) => {
    if (!phone) return "";

    let p = String(phone).trim();

    // 🔥 ลบทุกอย่างที่ไม่ใช่ตัวเลข
    p = p.replace(/\D/g, "");

    // 🔥 เติม 0 ถ้าไม่มี
    if (!p.startsWith("0")) {
        p = "0" + p;
    }

    // 🔥 ตัดให้เหลือ 10 หลัก (กัน overflow จาก CSV เพี้ยน)
    if (p.length > 10) {
        p = p.slice(0, 10);
    }

    return p;
};