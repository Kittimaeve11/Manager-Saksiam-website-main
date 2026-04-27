const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return ''; // If dateString is not a valid date, return an empty string
  }

  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
    'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
    'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543; // Add 543 to convert to the Buddhist calendar year (B.E.)

  return `${day} ${month} ${year}`;
};

const formatThaiDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return ''; // If dateString is not a valid date, return an empty string
  }

  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
    'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
    'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543; // Add 543 to convert to the Buddhist calendar year (B.E.)

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');


  return `${day} ${month} ${year}
  ${hours}:${minutes}:${seconds}`;
};

const formatDateRange = (dateA: string, dateB: string): string => {
  const date1 = new Date(dateA);
  const date2 = new Date(dateB);

  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
    return ''; // ถ้าข้อมูลไม่ถูกต้องให้คืนค่าเป็นสตริงว่าง
  }

  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
    'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
    'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const day1 = date1.getDate();
  const month1 = thaiMonths[date1.getMonth()];
  const year1 = date1.getFullYear() + 543;

  const day2 = date2.getDate();
  const month2 = thaiMonths[date2.getMonth()];
  const year2 = date2.getFullYear() + 543;

  if (date1.getTime() === date2.getTime()) {
    return `${day1} ${month1} ${year1}`; // วันเดียวกัน
  }

  if (month1 === month2 && year1 === year2) {
    return `${day1} - ${day2} ${month1} ${year1}`; // ต่างวันแต่เดือนและปีเดียวกัน
  }

  if (year1 === year2) {
    return `${day1} ${month1} - ${day2} ${month2} ${year1}`; // ต่างวันต่างเดือน แต่ปีเดียวกัน
  }

  return `${day1} ${month1} ${year1} - ${day2} ${month2} ${year2}`; // ต่างวันต่างเดือนต่างปี
};


export default formatDate; // Default export
export { formatThaiDate, formatDateRange }; // Named export

export const formatDateRangeStyled = (
  dateA: string,
  dateB: string
): { day1: string; monthYear1: string; day2?: string; monthYear2?: string } => {
  const date1 = new Date(dateA);
  const date2 = new Date(dateB);

  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
    return { day1: "", monthYear1: "" }; // คืนค่าว่างถ้าข้อมูลไม่ถูกต้อง
  }

  const thaiMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.",
    "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.",
    "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const day1 = date1.getDate().toString();
  const month1 = thaiMonths[date1.getMonth()];
  const year1 = (date1.getFullYear() + 543).toString();

  const day2 = date2.getDate().toString();
  const month2 = thaiMonths[date2.getMonth()];
  const year2 = (date2.getFullYear() + 543).toString();

  // ❇️ กรณีวันที่เดียวกัน
  if (date1.getTime() === date2.getTime()) {
    return { day1, monthYear1: `${month1} ${year1}` };
  }

  // ❇️ ถ้าอยู่เดือนเดียวกัน และปีเดียวกัน
  if (month1 === month2 && year1 === year2) {
    return { day1: `${day1} - ${day2}`, monthYear1: `${month1} ${year1}` };
  }

  // ❇️ ถ้าอยู่ปีเดียวกันแต่คนละเดือน
  if (year1 === year2) {
    return {
      day1: `${day1} ${month1}`,
      monthYear1: "", // ❇️ ไม่แสดง monthYear1
      day2: `\n${day2} ${month2}`, // ❇️ เว้นบรรทัดก่อน day2
      monthYear2: year1
    };
  }

  // ❇️ ถ้าต่างปีกัน
  return {
    day1: `${day1} ${month1} ${year1}`,
    monthYear1: "",
    day2: `\n${day2} ${month2} ${year2}`, // ❇️ เพิ่ม \n ให้เว้นบรรทัด
    monthYear2: ""
  };

};


export const formatDatePromotionRange = (dateA: string, dateB: string): string => {
  const date1 = new Date(dateA);
  const date2 = new Date(dateB);

  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
    return ''; // ถ้าข้อมูลไม่ถูกต้องให้คืนค่าเป็นสตริงว่าง
  }

  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
    'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
    'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const day1 = date1.getDate();
  const month1 = thaiMonths[date1.getMonth()];
  const year1 = date1.getFullYear() + 543;

  const day2 = date2.getDate();
  const month2 = thaiMonths[date2.getMonth()];
  const year2 = date2.getFullYear() + 543;

  if (date1.getTime() === date2.getTime()) {
    return `${day1} ${month1} ${year1}`; // วันเดียวกัน
  }

  if (month1 === month2 && year1 === year2) {
    return `${day1} - ${day2} ${month1} ${year1}`; // ต่างวันแต่เดือนและปีเดียวกัน
  }

  if (year1 === year2) {
    return `${day1} ${month1} - ${day2} ${month2} ${year1}`; // ต่างวันต่างเดือน แต่ปีเดียวกัน
  }

  return `${day1} ${month1} ${year1} - ${day2} ${month2} ${year2}`; // ต่างวันต่างเดือนต่างปี
};


export const formatThaiDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return ''; // ถ้า dateString ไม่ใช่วันที่ที่ถูกต้อง
  }

  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
    'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
    'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
};

export function getDurationText(sentDate: string | Date): string {
  const now = new Date();
  const sent = new Date(sentDate);
  const diffMs = now.getTime() - sent.getTime();

  if (diffMs < 0) return "-"; // ป้องกันวันที่อนาคต

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return `${days} วัน`;
}

export function getDurationBetweenDates(
  sendAt: string | Date,
  reportAt: string | Date
): string {
  if (!sendAt || !reportAt) return "-";

  const start = new Date(sendAt);
  const end = new Date(reportAt);

  const diffMs = end.getTime() - start.getTime();
  if (isNaN(diffMs) || diffMs < 0) return "-"; // ป้องกันข้อมูลไม่ถูกต้องหรือเวลาย้อนหลัง

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return `${days} วัน`;
}

