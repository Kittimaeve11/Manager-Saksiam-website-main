const BASE_URL = import.meta.env.VITE_BASE_URL_API;
const API_KEY = import.meta.env.VITE_BASE_Authorization_KEY_API;; // ใช้ค่านี้ตามที่คุณกำหนด
import { tokenRefresher } from "../Auth/tokenRefresher";

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

type LogBodyRecord = Record<string, unknown>;

const decodeTokenPayload = (): LogBodyRecord => {
  const token = localStorage.getItem("access_token");
  if (!token) return {};

  try {
    const payload = token.split(".")[1];
    if (!payload) return {};

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = window.atob(normalized);
    return JSON.parse(decodeURIComponent(Array.from(decoded).map((char) =>
      `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`
    ).join("")));
  } catch {
    return {};
  }
};

const getValue = (record: LogBodyRecord, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value);
    }
  }

  return "";
};

const collectNestedRecords = (value: unknown, depth = 0): LogBodyRecord[] => {
  if (!value || typeof value !== "object" || depth > 4) return [];

  const record = value as LogBodyRecord;
  const records: LogBodyRecord[] = [record];

  Object.values(record).forEach((child) => {
    if (child && typeof child === "object" && !(child instanceof File)) {
      records.push(...collectNestedRecords(child, depth + 1));
    }
  });

  return records;
};

const getValueFromRecords = (records: LogBodyRecord[], keys: string[]) => {
  for (const record of records) {
    const value = getValue(record, keys);
    if (value) return value;
  }

  return "";
};

const readStoredUserRecords = (): LogBodyRecord[] => {
  const storageKeys = [
    "current_user",
    "user",
    "authUser",
    "profile",
    "personal",
    "personnel",
    "userData",
    "loginUser",
  ];
  const records: LogBodyRecord[] = [];

  for (const key of storageKeys) {
    const value = localStorage.getItem(key);
    if (!value) continue;

    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        records.push(...collectNestedRecords(parsed));
      }
    } catch {
      continue;
    }
  }

  return records;
};

const buildFullName = (records: LogBodyRecord[]) => {
  const fullName = getValueFromRecords(records, [
    "fullname",
    "fullName",
    "FullPer",
    "fullnamePer",
    "displayName",
    "name",
  ]);
  if (fullName) return fullName;

  for (const record of records) {
    const firstName = getValue(record, ["fname", "firstName", "firstname", "nameTH"]);
    const lastName = getValue(record, ["lname", "lastName", "lastname", "surname"]);
    const joinedName = `${firstName} ${lastName}`.trim();
    if (joinedName) return joinedName;
  }

  return "";
};

const getCurrentUserLogInfo = (requestBody: LogBodyRecord = {}) => {
  const tokenPayload = decodeTokenPayload();
  const records = [
    requestBody,
    ...readStoredUserRecords(),
    ...collectNestedRecords(tokenPayload),
  ];

  return {
    typeUser: getValueFromRecords(records, [
      "role_name",
      "roleName",
      "typeUser",
      "role",
      "permissionName",
      "permission",
      "position",
      "userRole",
    ]),
    IDPer: getValueFromRecords(records, [
      "id",
      "IDPer",
      "user_id",
      "userID",
      "UserID",
      "personnelID",
      "personnel_id",
      "personalID",
      "PersonalID",
      "int_saksiam_personnel_id",
      "int_saksiam_user_id",
    ]),
    FullPer: buildFullName(records),
  };
};

const readRequestBody = (body: BodyInit | null | undefined): LogBodyRecord => {
  if (!body) return {};

  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  if (body instanceof FormData) {
    const values: LogBodyRecord = {};
    body.forEach((value, key) => {
      if (!(value instanceof File)) values[key] = value;
    });
    return values;
  }

  return {};
};

const normalizeUrlPath = (url: string) => url.split("?")[0].toLowerCase();

const API_ALIAS_PATHS: Record<string, string> = {
  "/api/auther/createdirectorsapi": "/api/auther/createcompanydirectorAPI",
  "/api/auther/createcommitteeapi": "/api/auther/createcompanydirectorAPI",
  "/api/auther/showdirectorsapi": "/api/auther/showcompanydirectorAPI",
  "/api/auther/showdirectorslistapi": "/api/auther/showcompanydirectorAPI",
  "/api/auther/showcommitteeapi": "/api/auther/showcompanydirectorAPI",
  "/api/auther/showcommitteelistapi": "/api/auther/showcompanydirectorAPI",
  "/api/auther/updatedirectorsapi": "/api/auther/updatecompanydirectorIDAPI",
  "/api/auther/updatecommitteeapi": "/api/auther/updatecompanydirectorIDAPI",
  "/api/auther/deletedirectorsapi": "/api/auther/deletecompanydirectorIDAPI",
  "/api/auther/deletecommitteeapi": "/api/auther/deletecompanydirectorIDAPI",

  "/api/auther/showmisstionapi": "/api/auther/showMissionAPI",
  "/api/auther/showmisstionidapi": "/api/auther/showMissionIDAPI",
  "/api/auther/createmisstionapi": "/api/auther/createMissionAPI",
  "/api/auther/updatemisstionidapi": "/api/auther/updateMissionIDAPI",
  "/api/auther/deletemisstionapi": "/api/auther/deleteMissionAPI",

  "/api/auther/createfqaapi": "/api/auther/createFaqQuestionAPI",
  "/api/auther/showfqalistapi": "/api/auther/showFqaAPI",
  "/api/auther/showfaqquestionapi": "/api/auther/showFqaAPI",
  "/api/auther/showfaqquestionlistapi": "/api/auther/showFqaAPI",
  "/api/auther/showfaqquestionidapi": "/api/auther/showFqaIDAPI",
  "/api/auther/updatefaqquestionapi": "/api/auther/updateFqaAPI",
  "/api/auther/deletefaqquestionapi": "/api/auther/deleteFqaAPI",

  "/api/auther/createtypeeditorialapi": "/api/auther/createEditorialTypeAPI",
  "/api/auther/showtypeeditorialapi": "/api/auther/showEditorialTypeAPI",
  "/api/auther/showtypeeditoriallistapi": "/api/auther/showEditorialTypelistAPI",
  "/api/auther/showeditorialarticleapi": "/api/auther/showEditorialAPI",
  "/api/auther/showeditorialarticlelistapi": "/api/auther/showEditorialAPI",
  "/api/auther/createeditorialarticleapi": "/api/auther/createEditorialAPI",
  "/api/auther/updateeditorialarticleapi": "/api/auther/updateEditorialAPI",
  "/api/auther/deleteeditorialarticleapi": "/api/auther/deleteEditorialAPI",

  "/api/auther/showreviewapi": "/api/auther/showVedioAPI",
  "/api/auther/showreviewidapi": "/api/auther/showVedioIDAPI",
  "/api/auther/createreviewapi": "/api/auther/createVedioAPI",
  "/api/auther/updatereviewidapi": "/api/auther/updateVedioAPI",
  "/api/auther/deletedreviewapi": "/api/auther/deleteVedioAPI",
  "/api/auther/approvedreviewapi": "/api/auther/updateVedioAPI",
  "/api/auther/showgraphreviewapi": "/api/auther/showVedioAPI",
  "/api/auther/coutreview": "/api/auther/showVedioAPI",
};

const resolveApiAlias = (url: string) => {
  const queryStart = url.indexOf("?");
  const rawPath = queryStart >= 0 ? url.slice(0, queryStart) : url;
  const query = queryStart >= 0 ? url.slice(queryStart) : "";
  const lookupPath = rawPath.toLowerCase();

  for (const [aliasPath, resolvedPath] of Object.entries(API_ALIAS_PATHS)) {
    if (lookupPath === aliasPath || lookupPath.startsWith(`${aliasPath}/`)) {
      return `${resolvedPath}${rawPath.slice(aliasPath.length)}${query}`;
    }
  }

  return url;
};

const getLogDataType = (url: string) => {
  const path = normalizeUrlPath(url);

  if (path.includes("gallery")) return "";
  if (path.includes("vedio") || path.includes("video")) return "วิดีโอ";
  if (path.includes("mission")) return "พันธกิจ";
  if (path.includes("companydirector") || path.includes("director")) return "คณะกรรมการ";
  if (path.includes("faqtype") || path.includes("typefqa")) return "ประเภทคำถามที่พบบ่อย";
  if (path.includes("fqa") || path.includes("faqquestion")) return "คำถามที่พบบ่อย";
  if (path.includes("editorialtype") || path.includes("newstype")) return "ประเภทข่าวและกิจกรรม";
  if (path.includes("editorial") || path.includes("newsactivity") || path.includes("news")) return "ข่าวและกิจกรรม";
  if (path.includes("policy")) return "นโยบาย";
  if (path.includes("contact")) return "ข้อมูลการติดต่อ";
  if (path.includes("theme")) return "ธีมเว็บไซต์";
  if (path.includes("topic")) return "หัวข้อแบบสอบถาม";
  if (path.includes("setting")) return "ตั้งค่า";

  return "";
};

const getLogActionType = (url: string, method: string, requestBody: LogBodyRecord) => {
  const path = normalizeUrlPath(url);
  const datatype = getLogDataType(url);
  const bodyKeys = Object.keys(requestBody).map((key) => key.toLowerCase());
  const statusKeys = [
    "active",
    "status",
    "pinned",
    "pin",
    "int_saksiam_fqa_active",
    "int_saksiam_typefqa_active",
    "int_saksiam_editoria_active",
    "int_saksiam_editoria_pin",
    "int_saksiam_editorial_active",
    "int_saksiam_policy_active",
    "int_saksiam_vedio_active",
    "int_saksiam_mission_active",
    "int_saksiam_directors_active",
    "note",
    "reason",
    "rejectreason",
    "cancellation",
    "improvement",
    "improvement_text",
    "int_saksiam_vedio_note",
    "int_saksiam_editoria_note",
    "int_saksiam_policy_note",
    "int_saksiam_vedio_cancellation",
    "int_saksiam_editoria_cancellation",
    "int_saksiam_policy_cancellation",
  ];
  const metaKeys = [
    "savename",
    "createname",
    "updatename",
    "changename",
    "approvedname",
    "approvename",
    "approvedate",
    "approveddate",
    "approveddate",
    "approvedname",
    "approvename",
    "approveat",
    "approvedate",
    "fullname",
    "fullper",
    "int_saksiam_vedio_createname",
    "int_saksiam_vedio_updatename",
    "int_saksiam_vedio_approvedname",
    "int_saksiam_editoria_savename",
    "int_saksiam_editoria_updatename",
    "int_saksiam_editoria_approvedname",
    "int_saksiam_policy_savename",
    "int_saksiam_policy_updatename",
    "int_saksiam_policy_approvedname",
  ];
  const meaningfulKeys = bodyKeys.filter((key) => !metaKeys.includes(key));
  const isStatusOnly =
    meaningfulKeys.length > 0 &&
    meaningfulKeys.every((key) => statusKeys.includes(key));
  const statusValue = String(
    requestBody.active ??
    requestBody.status ??
    requestBody.int_saksiam_vedio_active ??
    requestBody.int_saksiam_policy_active ??
    requestBody.int_saksiam_editoria_active ??
    requestBody.int_saksiam_editorial_active ??
    ""
  );

  if (path.includes("move") || path.includes("order") || path.includes("rank")) return 13;
  if (method === "DELETE" || path.includes("delete")) return 11;

  if (method === "POST" && path.includes("create")) return 9;

  const canApprove = ["ข่าวและกิจกรรม", "นโยบาย", "วิดีโอ"].includes(datatype);
  const hasApprovalKeys =
    canApprove &&
    bodyKeys.some((key) =>
      key.includes("approve") ||
      key.includes("approved") ||
      key.includes("approvename") ||
      key.includes("approvedname")
    );

  if (
    path.includes("approve") ||
    hasApprovalKeys
  ) {
    return 14;
  }

  if (method === "PUT" || path.includes("update") || path.includes("edit")) {
    return isStatusOnly ? 12 : 10;
  }

  if (isStatusOnly) return 12;

  return 0;
};

const getResponseDataID = (responseBody: LogBodyRecord, requestBody: LogBodyRecord, url: string) => {
  const urlID = url.match(/\/([^/?]+)(?:\?.*)?$/)?.[1] ?? "";
  const data = responseBody.data && typeof responseBody.data === "object" ? responseBody.data as LogBodyRecord : {};
  const responseRecords = collectNestedRecords(responseBody);
  const idKeys = [
    "id",
    "ID",
    "dataID",
    "insertID",
    "insertId",
    "vedioID",
    "videoID",
    "missionID",
    "directorID",
    "policyID",
    "editoriaID",
    "editorialID",
    "newsID",
    "fqaID",
    "faqtypeID",
    "int_saksiam_vedio_id",
    "int_saksiam_editoria_id",
    "int_saksiam_policy_id",
    "int_saksiam_mission_id",
    "int_saksiam_directors_id",
    "int_saksiam_fqa_id",
    "int_saksiam_typefqa_id",
  ];

  return (
    getValueFromRecords(responseRecords, idKeys) ||
    getValue(data, idKeys) ||
    getValue(requestBody, [
      "id",
      "ID",
      "dataID",
      "code",
      "editoriaID",
      "editorialID",
      "newsID",
      "policyID",
      "vedioID",
      "videoID",
      "missionID",
      "directorID",
      "fqaID",
      "faqtypeID",
      "int_saksiam_vedio_id",
      "int_saksiam_editoria_id",
      "int_saksiam_policy_id",
      "int_saksiam_mission_id",
      "int_saksiam_directors_id",
    ]) ||
    (/^\d+$|^[A-Za-z]{2}\d+/.test(urlID) ? urlID : "")
  );
};

const getLogDataName = (requestBody: LogBodyRecord, responseBody: LogBodyRecord) => {
  const data = responseBody.data && typeof responseBody.data === "object" ? responseBody.data as LogBodyRecord : {};
  const responseRecords = collectNestedRecords(responseBody);
  const keys = [
    "nameTH",
    "titleTH",
    "topicTH",
    "subjectTH",
    "questionTH",
    "newstypeNameTH",
    "faqtypenameTH",
    "policyNameTH",
    "policynameTH",
    "policyTitleTH",
    "policyTitle",
    "int_saksiam_policy_nameTH",
    "int_saksiam_policy_titleTH",
    "int_saksiam_policy_detailTH",
    "vedioNameTH",
    "nameTH_Vedio",
    "int_saksiam_vedio_nameTH",
    "missionTopicTH",
    "missionTitleTH",
    "int_saksiam_mission_topicTH",
    "int_saksiam_mission_titleTH",
    "topicNameTH",
    "fullnameTH",
    "nameFullTH",
    "directorNameTH",
    "int_saksiam_directors_nameTH",
    "brandername",
    "typenameTH",
    "typeNameTH",
    "editoriaTopicTH",
    "editorialTopicTH",
    "editoriaTitleTH",
    "editorialTitleTH",
    "int_saksiam_editoria_topicTH",
    "int_saksiam_editoria_titleTH",
  ];

  return getValue(requestBody, keys) || getValue(data, keys) || getValueFromRecords(responseRecords, keys) || "-";
};

const LOG_DATA_CACHE_KEY = "saksiam_admin_log_data_cache";

const readLogDataCache = (): Record<string, Record<string, string>> => {
  try {
    const value = sessionStorage.getItem(LOG_DATA_CACHE_KEY);
    if (!value) return {};
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeLogDataCache = (cache: Record<string, Record<string, string>>) => {
  try {
    sessionStorage.setItem(LOG_DATA_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage quota/private mode
  }
};

const rememberLogData = (datatype: string, dataID: string, dataname: string) => {
  if (!datatype || !dataID || !dataname || dataname === "-") return;

  const cache = readLogDataCache();
  cache[datatype] = {
    ...(cache[datatype] || {}),
    [dataID]: dataname,
  };
  writeLogDataCache(cache);
};

const getRememberedLogDataName = (datatype: string, dataID: string) => {
  if (!datatype || !dataID) return "";
  return readLogDataCache()[datatype]?.[dataID] || "";
};

const rememberLogDataFromResponse = async (url: string, response: Response) => {
  const datatype = getLogDataType(url);
  if (!datatype || !response.ok) return;

  let responseBody: LogBodyRecord = {};
  try {
    responseBody = await response.clone().json();
  } catch {
    return;
  }

  const records = collectNestedRecords(responseBody);
  records.forEach((record) => {
    const dataID = getResponseDataID(record, record, url);
    const dataname = getLogDataName(record, record);
    rememberLogData(datatype, dataID, dataname);
  });
};

const getActionLabel = (actionType: number) => {
  if (actionType === 9) return "เพิ่มข้อมูล";
  if (actionType === 10) return "แก้ไขข้อมูล";
  if (actionType === 11) return "ลบข้อมูล";
  if (actionType === 12) return "เปลี่ยนสถานะ";
  if (actionType === 13) return "เรียงลำดับ";
  if (actionType === 14) return "อนุมัติ";
  if (actionType === 15) return "ออกรายงาน";
  return "จัดการข้อมูล";
};

const getLogFieldLabels = (datatype: string) => {
  const labels: Record<string, { idLabel: string; nameLabel: string }> = {
    "วิดีโอ": { idLabel: "รหัสวิดีโอ", nameLabel: "ชื่อวิดีโอ" },
    "พันธกิจ": { idLabel: "รหัสพันธกิจ", nameLabel: "ชื่อพันธกิจ" },
    "คณะกรรมการ": { idLabel: "รหัสคณะกรรมการ", nameLabel: "ชื่อคณะกรรมการ" },
    "ประเภทคำถามที่พบบ่อย": {
      idLabel: "รหัสประเภทคำถามที่พบบ่อย",
      nameLabel: "ชื่อประเภทคำถามที่พบบ่อย",
    },
    "คำถามที่พบบ่อย": {
      idLabel: "รหัสคำถามที่พบบ่อย",
      nameLabel: "ชื่อคำถามที่พบบ่อย",
    },
    "ประเภทข่าวและกิจกรรม": {
      idLabel: "รหัสประเภทข่าวและกิจกรรม",
      nameLabel: "ชื่อประเภทข่าวและกิจกรรม",
    },
    "ข่าวและกิจกรรม": {
      idLabel: "รหัสข่าวและกิจกรรม",
      nameLabel: "ชื่อข่าวและกิจกรรม",
    },
    "นโยบาย": { idLabel: "รหัสนโยบาย", nameLabel: "ชื่อนโยบาย" },
    "ข้อมูลการติดต่อ": {
      idLabel: "รหัสข้อมูลการติดต่อ",
      nameLabel: "ชื่อข้อมูลการติดต่อ",
    },
    "ธีมเว็บไซต์": { idLabel: "รหัสธีมเว็บไซต์", nameLabel: "ชื่อธีมเว็บไซต์" },
    "ตั้งค่า": { idLabel: "รหัสตั้งค่า", nameLabel: "ชื่อการตั้งค่า" },
    "หัวข้อแบบสอบถาม": {
      idLabel: "รหัสหัวข้อแบบสอบถาม",
      nameLabel: "ชื่อหัวข้อแบบสอบถาม",
    },
  };

  return labels[datatype] || {
    idLabel: `รหัส${datatype || "ข้อมูล"}`,
    nameLabel: `ชื่อ${datatype || "ข้อมูล"}`,
  };
};

const buildAdminLogActionDetail = (
  actionType: number,
  datatype: string,
  dataID: string | number,
  dataname: string | number
) => {
  const actionLabel = getActionLabel(actionType);
  const { idLabel, nameLabel } = getLogFieldLabels(datatype);

  return `${actionLabel}${datatype} ${idLabel}: ${dataID}  ${nameLabel}: ${dataname}`;
};

const getActionTypeFromActionDetail = (actionDetail: string, actionType: number) => {
  if (/จัดลำดับ|เรียงลำดับ/.test(actionDetail)) return 13;
  if (/ออกรายงาน|excel|เอ็กเซล/i.test(actionDetail)) return 15;
  if (/อนุมัติ|ไม่อนุมัติ|ส่งกลับให้แก้ไข/.test(actionDetail)) return 14;
  if (/เปลี่ยนสถานะ|เปิดใช้งาน|ปิดใช้งาน|เผยแพร่|ปิดเผยแพร่/.test(actionDetail)) return 12;
  if (/ลบข้อมูล|ลบ/.test(actionDetail)) return 11;
  if (/แก้ไขข้อมูล|แก้ไข/.test(actionDetail)) return 10;
  if (/เพิ่มข้อมูล|เพิ่ม/.test(actionDetail)) return 9;

  return actionType;
};

const getDataTypeFromActionDetail = (actionDetail: string) => {
  const dataTypes = [
    "ประเภทคำถามที่พบบ่อย",
    "คำถามที่พบบ่อย",
    "ประเภทข่าวและกิจกรรม",
    "ข่าวและกิจกรรม",
    "คณะกรรมการ",
    "พันธกิจ",
    "นโยบาย",
    "วิดีโอ",
    "ธีมเว็บไซต์",
    "ตั้งค่า",
  ];

  return dataTypes.find((datatype) => actionDetail.includes(datatype)) || "";
};

const getDataIDFromActionDetail = (actionDetail: string) => {
  const match = actionDetail.match(/(?:รหัส(?:ข้อมูล|วิดีโอ|พันธกิจ|คณะกรรมการ|นโยบาย|ข่าวและกิจกรรม|ประเภทข่าวและกิจกรรม|คำถามที่พบบ่อย|ประเภทคำถามที่พบบ่อย)?|ID|id)\s*:?\s*([A-Za-z]{0,4}\d+|\d+)/);
  return match?.[1] || "";
};

const getDataNameFromActionDetail = (actionDetail: string) => {
  const match = actionDetail.match(/(?:ชื่อ(?:ข้อมูล|วิดีโอ|พันธกิจ|คณะกรรมการ|นโยบาย|ข่าวและกิจกรรม|ประเภทข่าวและกิจกรรม|คำถามที่พบบ่อย|ประเภทคำถามที่พบบ่อย)?|หัวข้อ|ชื่อ)\s*:?\s*"?([^"|]+)"?/);
  return match?.[1]?.trim() || "";
};

const getLogFallbackUserInfo = (requestBody: LogBodyRecord = {}) => {
  const userInfo = getCurrentUserLogInfo(requestBody);

  return {
    typeUser: userInfo.typeUser || "Administrator",
    IDPer: userInfo.IDPer || "0",
    FullPer: userInfo.FullPer || "Administrator",
  };
};

const normalizeAdminLogBody = (body: BodyInit | null | undefined) => {
  const logBody = readRequestBody(body);
  const actionDetail = String(logBody.actionDetail ?? "");
  const actionType = getActionTypeFromActionDetail(actionDetail, Number(logBody.actionType ?? 0));
  const datatype = String(logBody.datatype || getDataTypeFromActionDetail(actionDetail) || "ข้อมูล");
  const rawDataID =
    logBody.dataID ??
    logBody.datatypeID ??
    logBody.ID ??
    logBody.id ??
    "";
  const dataID = String(rawDataID || getDataIDFromActionDetail(actionDetail) || (actionType === 13 || actionType === 15 ? "0" : ""));
  const dataname = String(
    logBody.dataname ||
    logBody.name ||
    getDataNameFromActionDetail(actionDetail) ||
    (actionType === 13 || actionType === 15 ? datatype : "")
  );
  const userInfo = getLogFallbackUserInfo(logBody);

  return JSON.stringify({
    ...logBody,
    actionType,
    actionDetail:
      dataID && dataname
        ? buildAdminLogActionDetail(actionType, datatype, dataID, dataname)
        : actionDetail,
    typeUser: String(logBody.typeUser ?? userInfo.typeUser),
    datatype,
    datatypeID: String(logBody.datatypeID ?? dataID),
    dataID,
    dataname,
    IDPer: String(logBody.IDPer ?? userInfo.IDPer),
    FullPer: String(logBody.FullPer ?? userInfo.FullPer),
  });
};

const shouldWriteAdminLog = (url: string, method: string) => {
  const path = normalizeUrlPath(url);
  if (method === "GET") return false;
  if (path.includes("/log")) return false;
  if (path.includes("profile") || path.includes("login") || path.includes("refresh") || path.includes("logout")) return false;
  if (path.includes("gallery")) return false;

  return Boolean(getLogDataType(url));
};

const writeAdminLog = async (url: string, options: RequestInit, response: Response) => {
  const method = (options.method || "GET").toUpperCase();
  if (!response.ok || !shouldWriteAdminLog(url, method)) return;

  const requestBody = readRequestBody(options.body as BodyInit | null | undefined);
  const actionType = getLogActionType(url, method, requestBody);
  const datatype = getLogDataType(url);
  if (!actionType || !datatype) return;

  let responseBody: LogBodyRecord = {};
  try {
    responseBody = await response.clone().json();
  } catch {
    responseBody = {};
  }

  const userInfo = getLogFallbackUserInfo(requestBody);
  const dataID = getResponseDataID(responseBody, requestBody, url);
  const dataname = getLogDataName(requestBody, responseBody);
  const rememberedName = getRememberedLogDataName(datatype, dataID);
  const logDataID = dataID || (actionType === 13 || actionType === 15 ? "0" : "");
  const logDataName = dataname && dataname !== "-"
    ? dataname
    : rememberedName || (actionType === 13 || actionType === 15 ? datatype : "");
  const missingFields = [
    !logDataID ? "dataID" : "",
    !logDataName ? "dataname" : "",
  ].filter(Boolean);

  if (missingFields.length > 0) {
    console.warn("Admin log skipped: missing required data", {
      missingFields,
      url,
      actionType,
      datatype,
      dataID: logDataID,
      dataname: logDataName,
    });
    return;
  }

  rememberLogData(datatype, logDataID, logDataName);

  try {
    const logResponse = await apiFetch("/api/auther/log", {
      method: "POST",
      body: JSON.stringify({
        actionType,
        actionDetail: buildAdminLogActionDetail(actionType, datatype, logDataID, logDataName),
        typeUser: userInfo.typeUser,
        datatype,
        datatypeID: logDataID,
        dataID: logDataID,
        dataname: logDataName,
        IDPer: userInfo.IDPer,
        FullPer: userInfo.FullPer,
      }),
    });

    if (!logResponse.ok) {
      const errorText = await logResponse.text().catch(() => "");
      console.error("Admin log failed:", logResponse.status, errorText);
    }
  } catch (error) {
    console.error("Error writing admin log:", error);
  }
};

export const writeManualAdminLog = async ({
  actionType,
  actionDetail,
  datatype,
  dataID = "",
  dataname = "",
}: {
  actionType: number;
  actionDetail: string;
  datatype: string;
  dataID?: string | number;
  dataname?: string;
}) => {
  const userInfo = getLogFallbackUserInfo();
  const detailDataID = getDataIDFromActionDetail(actionDetail);
  const detailDataName = getDataNameFromActionDetail(actionDetail);
  const logDataID = dataID !== "" && dataID !== null && dataID !== undefined
    ? String(dataID)
    : detailDataID || (actionType === 13 || actionType === 15 ? "0" : "");
  const logDataName = dataname || detailDataName || (actionType === 13 || actionType === 15 ? datatype : "");
  const missingFields = [
    !logDataID ? "dataID" : "",
    !logDataName ? "dataname" : "",
  ].filter(Boolean);

  if (missingFields.length > 0) {
    console.warn("Manual admin log skipped: missing required data", {
      missingFields,
      actionType,
      datatype,
      dataID,
      dataname,
    });
    return;
  }

  try {
    const logResponse = await apiFetch("/api/auther/log", {
      method: "POST",
      body: JSON.stringify({
        actionType,
        actionDetail: buildAdminLogActionDetail(actionType, datatype, logDataID, logDataName),
        typeUser: userInfo.typeUser,
        datatype,
        datatypeID: logDataID,
        dataID: logDataID,
        dataname: logDataName,
        IDPer: userInfo.IDPer,
        FullPer: userInfo.FullPer,
      }),
    });

    if (!logResponse.ok) {
      const errorText = await logResponse.text().catch(() => "");
      console.error("Admin log failed:", logResponse.status, errorText);
    }
  } catch (error) {
    console.error("Error writing admin log:", error);
  }
};

/**
 * ฟังก์ชัน fetch API แบบมี Interceptor + Refresh Token
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const requestUrl = resolveApiAlias(url);
  const token = localStorage.getItem("access_token");
  const normalizedOptions: RequestInit = normalizeUrlPath(requestUrl).includes("/log")
    ? {
        ...options,
        body: normalizeAdminLogBody(options.body as BodyInit | null | undefined),
      }
    : options;

  // แปลง header ผู้ใช้ให้เป็น object เสมอ
  const userHeaders = (normalizedOptions.headers || {}) as Record<string, string>;

  // header เริ่มต้น (ต้องมี API KEY เสมอ)
  const headers: Record<string, string> = {
    ...userHeaders,
    "X-API-KEY": API_KEY,
  };

  // ถ้าข้อมูลไม่ใช่ FormData ให้ใส่ Content-Type
  if (!(normalizedOptions.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  // ถ้ามี token ให้แนบด้วย
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    ...normalizedOptions,
    headers,
  };

  const response = await fetch(BASE_URL + requestUrl, fetchOptions);

  // ตรวจจับ Token หมดอายุ
  if (response.status === 401) {
    return handle401(requestUrl, fetchOptions);
  }

  if ((fetchOptions.method || "GET").toUpperCase() === "GET") {
    void rememberLogDataFromResponse(requestUrl, response);
  }

  void writeAdminLog(requestUrl, fetchOptions, response);

  return response;
}

/**
 * ระบบ Refresh Token (Queue แบบเดียวกับ Axios)
 */
async function handle401(url: string, options: RequestInit): Promise<Response> {

  // ถ้ากำลัง refresh อยู่ → ให้รอใน queue
  if (isRefreshing) {
    return new Promise((resolve) => {
      queue.push((newToken: string) => {

        const headers = {
          ...(options.headers as Record<string, string>),
          "X-API-KEY": API_KEY,                 // ใส่ API KEY กลับเข้าไปทุกครั้ง
          Authorization: `Bearer ${newToken}`,
        };

        resolve(
          fetch(BASE_URL + url, {
            ...options,
            headers,
            credentials: "include",
          })
        );
      });
    });
  }

  isRefreshing = true;

  try {
    // เรียก refreshAccessToken ผ่าน tokenRefresher
    const newToken = await tokenRefresher.refresh();

    // ส่งต่อ token ใหม่ให้ queue ที่รออยู่
    queue.forEach((cb) => cb(newToken));
    queue = [];
    isRefreshing = false;

    // แนบ token ใหม่แล้ว retry
    const newHeaders = {
      ...(options.headers as Record<string, string>),
      "X-API-KEY": API_KEY,                 // สำคัญมาก
      Authorization: `Bearer ${newToken}`,  // token ใหม่
    };

    return fetch(BASE_URL + url, {
      ...options,
      headers: newHeaders,
      credentials: "include",
    });

  } catch (error) {
    isRefreshing = false;
    localStorage.removeItem("access_token");
    window.location.href = "/login";
    throw error;
  }
}


export interface ApiResponse<T = unknown> {
  status: boolean;
  message?: string;
  data?: T;
}
