export function formatPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '-';
  return num.toLocaleString('en-US', { minimumFractionDigits: 0 });
}

export function formatfometPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(num)) return '-';

  // เช็กว่ามีทศนิยมหรือไม่
  const hasDecimal = num % 1 !== 0;

  return num.toLocaleString('en-US', {
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: hasDecimal ? 2 : 0,
  });
}

export const formatmonny = (monny: string) => {
  return monny.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const formatmonnynumber = (value: number | null) => {
  if (value === null) return "0"; // หรือค่าที่ต้องการแสดงเมื่อเป็น null
  return new Intl.NumberFormat().format(value);
};

export const formatViews = (numberviwe: number) => {
  switch (true) {
    case numberviwe < 1000:
      return numberviwe.toString()
    case numberviwe < 1_000_000:
      return (numberviwe / 1000).toFixed(1).replace(/\.0$/, '') + "K";
    case numberviwe < 1_000_000_000:
      return (numberviwe / 1_000_000).toFixed(2).replace(/\.0+$/, '') + "M";
    default:
      return (numberviwe / 1_000_000_000).toFixed(2).replace(/\.0+$/, '') + "B";
  }
}