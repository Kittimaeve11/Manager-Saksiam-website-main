export const datastatus = [
  { valuename: 'all', labelname: 'แสดงทั้งหมด' },
  { valuename: 'active', labelname: 'คงอยู่' },
  { valuename: 'inactive', labelname: 'ออก' },
]
export const datastatusType = [
  { valuename: 'all', labelname: 'แสดงทั้งหมด' },
  { valuename: 'active', labelname: 'กำลังใช้งาน' },
  { valuename: 'inactive', labelname: 'ยกเลิก' },
]
export const datastatusBranchType = [
  { valuename: 'all', labelname: 'แสดงทั้งหมด' },
  { valuename: 'active', labelname: 'เปิดให้บริการ' },
  { valuename: 'inactive', labelname: 'ปิดการให้บริการ' },
]
export const datastatusBaner = [
  { valuename: 'all', labelname: 'แสดงทั้งหมด' },
  { valuename: 'หน้าหลัก', labelname: 'หน้าหลัก' },
  { valuename: 'หน้าค้นหาสาขา', labelname: 'หน้าค้นหาสาขา' },
  { valuename: 'หน้าข่าวและกิจกรรม', labelname: 'หน้าข่าวและกิจกรรม' },
  { valuename: 'หน้่าคำถามที่พบบ่อย', labelname: 'หน้่าคำถามที่พบบ่อย' },
  { valuename: 'หน้าประวัติสินเชื่อศักดิ์สยาม', labelname: 'หน้าประวัติสินเชื่อศักดิ์สยาม' },
  { valuename: 'หน้าวิสัยทัศน์และพันธกิจ', labelname: 'หน้าวิสัยทัศน์และพันธกิจ' },
  { valuename: 'หน้าสมัครงาน', labelname: 'หน้าสมัครงาน' },
]

export const dataBranchType = [
  { id: 1, valuename: 'branch', labelname: 'สาขา' },
  { id: 2, valuename: 'agency', labelname: 'หน่วย' },
  { id: 3, valuename: 'office', labelname: 'สำนักงาน' },
]

export const dataBusinessSector = [
  { id: 1, valuename: 'sector 1', labelname: 'ภาค 1' },
  { id: 2, valuename: 'sector 2', labelname: 'ภาค 2' },
  { id: 3, valuename: 'sector 3', labelname: 'ภาค 3' },
  { id: 4, valuename: 'sector 4', labelname: 'ภาค 4' },
  { id: 5, valuename: 'sector 5', labelname: 'ภาค 5' },
  { id: 6, valuename: 'sector 6', labelname: 'สำนักงานใหญ่' }
]

export const committeeGroups = [
  {
    valuename: 'audit_committee',
    labelname: 'คณะกรรมการตรวจสอบ',
  },
  {
    valuename: 'risk_management_committee',
    labelname: 'คณะกรรมการบริหารความเสี่ยง',
  },
  {
    valuename: 'nomination_remuneration_committee',
    labelname: 'คณะกรรมการสรรหา และพิจารณาค่าตอบแทน',
  },
  {
    valuename: 'governance_sustainability_committee',
    labelname: 'คณะกรรมการบรรษัทภิบาลและความยั่งยืน',
  },
]

export const statusConfig = {
  waiting_approve: {
    label: "รอการอนุมัติ",
    bg: "#fff4cc",
    text: "#8a6d3b",
  },
  approved: {
    label: "อนุมัติ",
    bg: "#c9e4d0",
    text: "#2e5f3b",
  },
  editing: {
    label: "แก้ไข",
    bg: "#e3f2fd",
    text: "#1565c0",
  },
  waiting_edit: {
    label: "รอการแก้ไข",
    bg: "#ffe0b2",
    text: "#e65100",
  },
  cancel: {
    label: "ยกเลิก",
    bg: "#ffe6eb",
    text: "#ff3741",
  },
  active: {
    label: "คงอยู่",
    bg: "#c9e4d0",
    text: "#2e5f3b",
  },
  inactive: {
    label: "ออก",
    bg: "#ffe6eb",
    text: "#ff3741",
  },
};