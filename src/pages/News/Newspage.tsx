"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { FiRefreshCw } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

import { apiFetch, writeManualAdminLog } from "../../API/client";
import { useAuth } from "../../Context/AuthContext";
import { usePageTitle } from "../../Context/PageTitleContext";
import AppIconButton from "../../components/Buttom/IconButton";
import TextButton from "../../components/Buttom/TextButton";
import ComponentsDatePickerField from "../../components/Form/ComponentsDatePickerField";
import ComponentsFadeSwapView from "../../components/Report/ComponentsFadeSwapView";
import ComponentsReportGraphButton from "../../components/Report/ComponentsReportGraphButton";
import ComponentsViewCountReportPanel from "../../components/Report/ComponentsViewCountReportPanel";
import MenuDropdownstatus from "../../components/Model/Dropdown/MenuDropdownstatus";
import Notifications from "../../components/Model/Pop_up/Notifications";
import ComponentsNewsTableView, {
  type NewsItem,
} from "../../components/View/News/ComponentsNewsTableView";
import { parseGallery } from "../../utils/Format/format-JSON";

type NotifyType = "success" | "error" | "warning" | "info";
type FileType = "all" | "active" | "inactive" | "waiting_approve" | "waiting_edit" | "cancel";

type NewsTypeOption = {
  id: number;
  nameTH: string;
  nameEN: string;
  active: string | number;
};

type NewsData = {
  counts: number;
  news: NewsItem[];
};

const emptyNewsData: NewsData = {
  counts: 0,
  news: [],
};

type ApiRecord = Record<string, unknown>;

const asRecord = (value: unknown): ApiRecord =>
  value && typeof value === "object" ? (value as ApiRecord) : {};

const firstDefined = (...values: unknown[]) =>
  values.find((value) => value !== undefined && value !== null);

const toText = (...values: unknown[]) => {
  const value = firstDefined(...values);
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
};

const toOptionalText = (...values: unknown[]) => {
  const text = toText(...values);
  return text || null;
};

const toStatusValue = (...values: unknown[]) => {
  const value = firstDefined(...values);
  return typeof value === "string" || typeof value === "number" ? value : 0;
};

const newsStatusOptions = [
  { valuename: "all", labelname: "แสดงทั้งหมด" },
  { valuename: "active", labelname: "กำลังใช้งาน" },
  { valuename: "inactive", labelname: "ยกเลิก" },
  { valuename: "waiting_approve", labelname: "รอการอนุมัติ" },
  { valuename: "waiting_edit", labelname: "รอการแก้ไข" },
  { valuename: "cancel", labelname: "ไม่อนุมัติ" },
];

const newsListEndpoints = [
  "/api/auther/showEditorialAPI",
  "/api/auther/showEditorialDataAPI",
  "/api/auther/showNewsAPI",
  "/api/auther/showNewsDataAPI",
];

const newsTypeListEndpoints = [
  "/api/auther/showEditorialTypelistAPI",
  "/api/auther/showEditorialTypeAPI",
  "/api/auther/showEditorialTypeDataAPI",
  "/api/auther/showNewsTypelistAPI",
];

const logListEndpoints = [
  "/api/auther/showLogAPI",
  "/api/auther/showLogDataAPI",
  "/api/auther/showLoglistAPI",
  "/api/auther/showLogListAPI",
  "/api/auther/showLog",
  "/api/auther/log",
  "/api/showLogAPI",
  "/api/logapi",
];

const monthLabels = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const getReportDateRange = (startDate?: Dayjs | null, endDate?: Dayjs | null) => {
  if (!startDate && !endDate) {
    return {
      start: dayjs().startOf("year"),
      end: dayjs().endOf("month"),
      isDefault: true,
    };
  }

  return {
    start: (startDate ?? dayjs().startOf("year")).startOf("day"),
    end: (endDate ?? dayjs()).endOf("day"),
    isDefault: false,
  };
};

const getWeekOfYear = (date: Dayjs) =>
  Math.floor(date.startOf("day").diff(date.startOf("year"), "day") / 7) + 1;

const buildEmptyReportBuckets = (startDate?: Dayjs | null, endDate?: Dayjs | null) => {
  const { start, end, isDefault } = getReportDateRange(startDate, endDate);
  const diffDays = end.diff(start, "day");

  if (isDefault || diffDays > 180) {
    const labels: string[] = [];
    const keys: string[] = [];
    let cursor = start.startOf("month");
    const last = end.startOf("month");

    while (cursor.isBefore(last) || cursor.isSame(last, "month")) {
      labels.push(monthLabels[cursor.month()]);
      keys.push(cursor.format("YYYY-MM"));
      cursor = cursor.add(1, "month");
    }

    return { labels, keys, type: "month" as const };
  }

  if (diffDays > 31) {
    const labels: string[] = [];
    const keys: string[] = [];
    let cursor = start.startOf("week");
    const last = end.startOf("week");

    while (cursor.isBefore(last) || cursor.isSame(last, "week")) {
      const week = getWeekOfYear(cursor);
      labels.push(`สัปดาห์ที่ ${week}`);
      keys.push(`${cursor.year()}-${week}`);
      cursor = cursor.add(1, "week");
    }

    return { labels, keys, type: "week" as const };
  }

  const labels: string[] = [];
  const keys: string[] = [];
  let cursor = start.startOf("day");
  const last = end.startOf("day");

  while (cursor.isBefore(last) || cursor.isSame(last, "day")) {
    labels.push(`วันที่ ${cursor.date()}`);
    keys.push(cursor.format("YYYY-MM-DD"));
    cursor = cursor.add(1, "day");
  }

  return { labels, keys, type: "day" as const };
};

const normalizeGallery = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const image = item as Record<string, unknown>;
          return (
            image.url ??
            image.path ??
            image.src ??
            image.image ??
            image.file ??
            image.name ??
            ""
          );
        }
        return "";
      })
      .filter((item): item is string => typeof item === "string" && Boolean(item));
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = parseGallery(value);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((item): item is string => typeof item === "string" && Boolean(item));
    }

    return [value];
  }

  return [];
};

const getNewsImages = (item: ApiRecord) => {
  const galleryCandidates = [
    normalizeGallery(item.galleryList),
    normalizeGallery(item.gallaryList),
    normalizeGallery(item.gallery),
    normalizeGallery(item.gallary),
    normalizeGallery(item.editoriagallery),
    normalizeGallery(item.editoria_gallery),
    normalizeGallery(item.editoria_gallary),
    normalizeGallery(item.int_saksiam_editoria_gallary),
  ];

  return galleryCandidates.find((gallery) => gallery.length > 0) ?? [];
};

const normalizeNews = (rawItem: unknown): NewsItem => {
  const item = asRecord(rawItem);
  const images = getNewsImages(item);
  const image = toText(
    images[0] ??
    item.image ??
    item.imageURL ??
    item.editorialimage ??
    item.newsimage ??
    item.int_saksiam_editoria_image ??
    ""
  );

  return {
  id: Number(
    item.id ??
      item.editorialID ??
      item.newsID ??
      item.int_saksiam_editorial_id ??
      item.int_saksiam_news_id ??
      0
  ),
  code: toText(
    item.code ??
    item.editoriaNum ??
    item.editoria_num ??
    item.editorialNum ??
    item.editorialnum ??
    item.newsNum ??
    item.int_saksiam_editoria_num ??
    item.int_saksiam_editorial_num ??
    ""
  ),
  images,
  image,
  typeNameTH: toText(
    item.typeNameTH ??
    item.editorialtypeNameTH ??
    item.editorialtypenameTH ??
    item.newsTypeNameTH ??
    item.newstypenameTH ??
    item.int_saksiam_typeeditorial_nameTH ??
    item.int_saksiam_typenews_nameTH ??
    "-"
  ),
  typeNameEN: toText(
    item.typeNameEN ??
    item.editorialtypeNameEN ??
    item.editorialtypenameEN ??
    item.newsTypeNameEN ??
    item.newstypenameEN ??
    item.int_saksiam_typeeditorial_nameEN ??
    item.int_saksiam_typenews_nameEN ??
    ""
  ),
  titleTH: toText(
    item.titleTH ??
    item.editorialtitleTH ??
    item.newsTitleTH ??
    item.int_saksiam_editorial_titleTH ??
    item.int_saksiam_news_titleTH ??
    ""
  ),
  titleEN: toText(
    item.titleEN ??
    item.editorialtitleEN ??
    item.newsTitleEN ??
    item.int_saksiam_editorial_titleEN ??
    item.int_saksiam_news_titleEN ??
    ""
  ),
  pageStatus: toText(
    item.pageStatus ??
    item.editorialpageStatus ??
    item.int_saksiam_editorial_pageStatus ??
    ""
  ),
  approveStatus: toText(
    item.approveStatus ??
    item.statusApprove ??
    item.editorialstatus ??
    item.int_saksiam_editorial_status ??
    ""
  ),
  active: toStatusValue(
    item.active ??
    item.editorialactive ??
    item.editoria_active ??
    item.newsActive ??
    item.int_saksiam_editorial_active ??
    item.int_saksiam_editoria_active ??
    item.int_saksiam_news_active ??
    1
  ),
  pin: toStatusValue(
    item.pin ??
    item.editorialpin ??
    item.editoria_pin ??
    item.int_saksiam_editoria_pin ??
    item.int_saksiam_editorial_pin ??
    0
  ),
  startDate: toOptionalText(
    item.startDate ??
    item.editorialstartDate ??
    item.newsStartDate ??
    item.int_saksiam_editorial_startDate ??
    item.int_saksiam_news_startDate ??
    null
  ),
  endDate: toOptionalText(
    item.endDate ??
    item.editorialendDate ??
    item.newsEndDate ??
    item.int_saksiam_editorial_endDate ??
    item.int_saksiam_news_endDate ??
    null
  ),
  savename: toText(
    item.savename ??
    item.createname ??
    item.editoria_createname ??
    item.int_saksiam_editoria_createname ??
    item.editorialsavename ??
    item.newsSavename ??
    item.int_saksiam_editorial_savename ??
    item.int_saksiam_news_savename ??
    "-"
  ),
  approveName: toText(
    item.approveName ??
    item.approvename ??
    item.editoria_approvename ??
    item.int_saksiam_editoria_approvename ??
    item.int_saksiam_editorial_approvename ??
    item.changename ??
    item.chagename ??
    item.changeName ??
    item.editoria_chagename ??
    item.int_saksiam_editoria_chagename ??
    item.int_saksiam_editoria_changename ??
    "-"
  ),
  approveDate: toOptionalText(
    item.approveDate ??
    item.approvedate ??
    item.editoria_approvedate ??
    item.int_saksiam_editoria_approvedate ??
    item.int_saksiam_editorial_approvedate ??
    item.changetime ??
    item.changeTime ??
    item.editoria_changetime ??
    item.int_saksiam_editoria_changetime ??
    null
  ),
  createAt: toText(
    item.createAt ??
    item.editoria_creacteAt ??
    item.int_saksiam_editoria_creacteAt ??
    item.editorialcreateAt ??
    item.newsCreateAt ??
    item.int_saksiam_editorial_createAt ??
    item.int_saksiam_news_createAt ??
    ""
  ),
  
  updateAt: toOptionalText(
    item.updateAt ??
      item.editoria_updateAt ??
      item.int_saksiam_editoria_updateAt ??
      item.editorialupdateAt ??
      item.newsUpdateAt ??
      item.int_saksiam_editorial_updateAt ??
      item.int_saksiam_news_updateAt ??
      (
        item.updatename ||
        item.editoria_updatename ||
        item.int_saksiam_editoria_updatename
          ? (
              item.changetime ??
              item.changeTime ??
              item.editoria_changetime ??
              item.int_saksiam_editoria_changetime ??
              null
            )
          : null
      )
  ),

  updateName: toText(
    item.updateName ??
    item.updatename ??
    item.editoria_updatename ??
    item.int_saksiam_editoria_updatename ??
    item.int_saksiam_editorial_updatename ??
    ""
  ),
  views: toStatusValue(
    item.views ??
    item.viewCount ??
    item.viewcount ??
    item.totalViews ??
    item.total_views ??
    item.totalView ??
    item.total_view ??
    item.view_total ??
    item.viewTotal ??
    item.views_count ??
    item.view_count ??
    item.count_views ??
    item.count_view ??
    item.logCount ??
    item.log_count ??
    item.totalLog ??
    item.total_log ??
    item.totalVisit ??
    item.total_visit ??
    item.visit ??
    item.visits ??
    item.editoria_view ??
    item.editoria_views ??
    item.editoriaView ??
    item.editoriaViews ??
    item.editoria_view_total ??
    item.editoria_total_view ??
    item.editoria_visit ??
    item.editoria_visits ??
    item.editorialView ??
    item.editorialViews ??
    item.editorial_view ??
    item.editorial_views ??
    item.editorial_view_total ??
    item.editorial_total_view ??
    item.int_saksiam_editoria_view ??
    item.int_saksiam_editoria_views ??
    item.int_saksiam_editoria_view_total ??
    item.int_saksiam_editoria_total_view ??
    item.int_saksiam_editoria_visit ??
    item.int_saksiam_editoria_visits ??
    item.int_saksiam_editorial_view ??
    item.int_saksiam_editorial_views ??
    item.int_saksiam_editorial_view_total ??
    item.int_saksiam_log_count ??
    0
  ),
  stats: {
    labels: Array.isArray(item.viewLabels)
      ? (item.viewLabels as string[])
      : Array.isArray(item.labels)
        ? (item.labels as string[])
        : undefined,
    total_views: Array.isArray(item.total_views)
      ? (item.total_views as number[])
      : Array.isArray(item.viewCounts)
        ? (item.viewCounts as number[])
        : undefined,
  },
  };
};

const normalizeNewsResponse = (result: unknown): NewsData => {
  const resultRecord = asRecord(result);
  const data = asRecord(resultRecord.data ?? result);
  const rawNews =
    data.editorias ??
    data.editorials ??
    data.editorial ??
    data.articles ??
    data.news ??
    data.items ??
    resultRecord.result ??
    [];

  const news = Array.isArray(rawNews)
    ? rawNews.map(normalizeNews).filter((item) => item.id)
    : [];

  return {
    counts: Number(data.counts ?? data.count ?? news.length),
    news,
  };
};

const normalizeLogResponse = (result: unknown): ApiRecord[] => {
  const resultRecord = asRecord(result);
  const data = asRecord(resultRecord.data ?? result);
  const rawLogs =
    data.logs ??
    data.log ??
    data.logdata ??
    data.items ??
    data.result ??
    resultRecord.result ??
    [];

  return Array.isArray(rawLogs) ? rawLogs.map(asRecord) : [];
};

const getLogSearchText = (log: ApiRecord) =>
  Object.values(log)
    .filter(
      (value) =>
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    )
    .map(String)
    .join(" ");

const getLogDate = (log: ApiRecord) =>
  toOptionalText(
    log.createAt,
    log.createdAt,
    log.date,
    log.time,
    log.logtime,
    log.int_saksiam_log_createAt,
    log.int_saksiam_log_createdAt,
    log.int_saksiam_log_DatetimeActions,
    log.DatetimeActions,
    log.int_saksiam_log_time,
    log.int_saksiam_log_date
  );

const getDirectViewCount = (item: NewsItem) =>
  Number(
    item.views ??
      item.viewCount ??
      item.totalViews ??
      item.total_views ??
      item.visit ??
      item.visits ??
      0
  ) || 0;

const buildViewStats = (
  logs: ApiRecord[],
  directViews: number,
  startDate?: Dayjs | null,
  endDate?: Dayjs | null
) => {
  const { start, end } = getReportDateRange(startDate, endDate);
  const buckets = buildEmptyReportBuckets(startDate, endDate);
  const values = buckets.keys.map(() => 0);

  logs.forEach((log) => {
    const date = dayjs(getLogDate(log));
    if (!date.isValid()) return;
    if (date.isBefore(start) || date.isAfter(end)) return;

    const key =
      buckets.type === "day"
        ? date.format("YYYY-MM-DD")
        : buckets.type === "week"
          ? `${date.year()}-${getWeekOfYear(date)}`
          : date.format("YYYY-MM");
    const index = buckets.keys.indexOf(key);

    if (index >= 0) values[index] += 1;
  });

  if (logs.length === 0 && directViews > 0) {
    const fallbackIndex = buckets.type === "month"
      ? buckets.keys.indexOf(dayjs().format("YYYY-MM"))
      : buckets.keys.length - 1;

    if (fallbackIndex >= 0) {
      values[fallbackIndex] = directViews;
    }
  }

  return {
    labels: buckets.labels,
    total_views: values,
  };
};

const attachLogViewCounts = (
  items: NewsItem[],
  logs: ApiRecord[],
  startDate?: Dayjs | null,
  endDate?: Dayjs | null
) =>
  items.map((item) => {
    const code = item.code?.trim();
    const matchedLogs = code
      ? logs.filter((log) => getLogSearchText(log).includes(code))
      : [];
    const directViews = getDirectViewCount(item);
    const views = matchedLogs.length > 0 ? matchedLogs.length : directViews;

    return {
      ...item,
      views,
      stats: buildViewStats(matchedLogs, directViews, startDate, endDate),
    };
  });

const isInPostedDateRange = (
  item: NewsItem,
  startDate: Dayjs | null,
  endDate: Dayjs | null
) => {
  if (!startDate && !endDate) return true;

  const postedDate = item.createAt ? dayjs(item.createAt) : null;
  if (!postedDate?.isValid()) return false;

  if (startDate && postedDate.isBefore(startDate.startOf("day"))) return false;
  if (endDate && postedDate.isAfter(endDate.endOf("day"))) return false;

  return true;
};

const normalizeNewsType = (rawItem: unknown): NewsTypeOption => {
  const item = asRecord(rawItem);

  return {
    id: Number(
    item.editorialtypeID ??
      item.editorialTypeID ??
      item.newstypeID ??
      item.newsTypeID ??
      item.int_saksiam_typeeditorial_id ??
      item.int_saksiam_typenews_id ??
      0
  ),
    nameTH: toText(
    item.editorialtypenameTH ??
    item.editorialTypeNameTH ??
    item.newstypenameTH ??
    item.newsTypeNameTH ??
    item.int_saksiam_typeeditorial_nameTH ??
    item.int_saksiam_typenews_nameTH ??
    ""
  ),
    nameEN: toText(
    item.editorialtypenameEN ??
    item.editorialTypeNameEN ??
    item.newstypenameEN ??
    item.newsTypeNameEN ??
    item.int_saksiam_typeeditorial_nameEN ??
    item.int_saksiam_typenews_nameEN ??
    ""
  ),
    active: toStatusValue(
    item.editorialtypeactive ??
    item.editorialTypeActive ??
    item.newstypeactive ??
    item.newsTypeActive ??
    item.int_saksiam_typeeditorial_active ??
    item.int_saksiam_typenews_active ??
    1
  ),
  };
};

const fetchFirstOk = async (endpoints: string[], query = "") => {
  let lastResponse: Response | null = null;

  for (const endpoint of endpoints) {
    const response = await apiFetch(`${endpoint}${query}`, { method: "GET" });
    if (response.ok) return response;
    lastResponse = response;
    if (response.status !== 404) return response;
  }

  return lastResponse;
};

const Newspage = () => {
  const { setTitle } = usePageTitle();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuth();
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("xl", 1800));

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [newsData, setNewsData] = useState<NewsData>(emptyNewsData);
  const [logRows, setLogRows] = useState<ApiRecord[]>([]);
  const [newsTypes, setNewsTypes] = useState<NewsTypeOption[]>([]);
  const [selectedType, setSelectedType] = useState("all");
  const [fileType, setFileType] = useState<FileType>("all");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [showViewReport, setShowViewReport] = useState(false);
  const [notify, setNotify] = useState<{
    isOpen: boolean;
    message: string;
    type: NotifyType;
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const fullName = `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim() || "Unknown";

  const reportRows = useMemo(
    () => attachLogViewCounts(newsData.news, logRows, startDate, endDate),
    [endDate, logRows, newsData.news, startDate]
  );

  const selectedTypeName = useMemo(() => {
    if (selectedType === "all") return "-";

    return (
      newsTypes.find((item) => String(item.id) === selectedType)?.nameTH || "-"
    );
  }, [newsTypes, selectedType]);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);

      const offset = page * rowsPerPage;
      const activeMap: Record<FileType, string> = {
        all: "",
        active: "1",
        inactive: "0",
        waiting_approve: "",
        waiting_edit: "",
        cancel: "",
      };
      const query = new URLSearchParams({
        typeID: selectedType === "all" ? "" : selectedType,
        status: fileType === "all" ? "" : fileType,
        active: activeMap[fileType],
        startDate: startDate ? startDate.format("YYYY-MM-DD") : "",
        endDate: endDate ? endDate.format("YYYY-MM-DD") : "",
        postStartDate: startDate ? startDate.format("YYYY-MM-DD") : "",
        postEndDate: endDate ? endDate.format("YYYY-MM-DD") : "",
        createStartDate: startDate ? startDate.format("YYYY-MM-DD") : "",
        createEndDate: endDate ? endDate.format("YYYY-MM-DD") : "",
        offset: String(offset),
        limit: String(rowsPerPage),
      }).toString();

      const response = await fetchFirstOk(newsListEndpoints, `?${query}`);

      if (!response?.ok) {
        throw new Error(
          `Error: ${response?.status ?? 404} ${response?.statusText ?? "Not Found"}`
        );
      }

      const result = await response.json();
      const normalized = normalizeNewsResponse(result);
      const statusFilteredNews = normalized.news.filter((item) => {
        const active = String(item.active);
        if (fileType === "waiting_approve") return active === "2";
        if (fileType === "waiting_edit") return active === "4";
        if (fileType === "cancel") return active === "3";
        return true;
      });
      const filteredNews = statusFilteredNews.filter((item) =>
        isInPostedDateRange(item, startDate, endDate)
      );

      setNewsData({
        counts:
          startDate || endDate || !["all", "active", "inactive"].includes(fileType)
            ? filteredNews.length
            : normalized.counts,
        news: filteredNews,
      });
    } catch (error) {
      console.error("Error fetching news data:", error);
      setNewsData(emptyNewsData);
      setNotify({
        isOpen: true,
        message: "ไม่สามารถโหลดข้อมูลข่าวสารและกิจกรรมได้",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [endDate, fileType, page, rowsPerPage, selectedType, startDate]);

  const fetchLogs = useCallback(async () => {
    try {
      for (const endpoint of logListEndpoints) {
        const response = await apiFetch(`${endpoint}?offset=0&limit=5000`, {
          method: "GET",
        });

        if (!response.ok) {
          continue;
        }

        const result = await response.json();
        const logs = normalizeLogResponse(result);
        if (logs.length > 0) {
          setLogRows(logs);
          return;
        }
      }

      setLogRows([]);
    } catch (error) {
      console.error("Error fetching log data:", error);
      setLogRows([]);
    }
  }, []);

  useEffect(() => {
    setTitle("การจัดการข่าวสารและกิจกรรม");

    const state = location.state as
      | { notify?: { message: string; type: NotifyType } }
      | null;

    if (state?.notify) {
      setNotify({
        isOpen: true,
        message: state.notify.message,
        type: state.notify.type,
      });
      navigate(location.pathname, { replace: true });
    }

    const fetchTypes = async () => {
      try {
        const response = await fetchFirstOk(newsTypeListEndpoints);
        if (!response?.ok) return;

        const result = await response.json();
        const rawTypes =
          result?.result ??
          result?.data?.editorialtypes ??
          result?.data?.newstypes ??
          [];

        setNewsTypes(
          Array.isArray(rawTypes)
            ? rawTypes.map(normalizeNewsType).filter((item) => item.id)
            : []
        );
      } catch (error) {
        console.error("Error fetching editorial types:", error);
      }
    };

    fetchTypes();
    fetchLogs();
    fetchNews();
  }, [fetchLogs, fetchNews, location.pathname, location.state, navigate, setTitle]);

  const handleRefresh = () => {
    setSelectedType("all");
    setFileType("all");
    setStartDate(null);
    setEndDate(null);
    setPage(0);
  };

  const handleTypeChange = (event: ChangeEvent<{ value: unknown }>) => {
    setSelectedType(String(event.target.value));
    setPage(0);
  };

  const handleStatusChange = (event: ChangeEvent<{ value: unknown }>) => {
    setFileType(String(event.target.value) as FileType);
    setPage(0);
  };

  const handleAddItemClick = () => {
    navigate("/News_Activity/create");
  };

  const handleEditItemClick = (id: number, code?: string) => {
    navigate(`/News_Activity/edit/${code || id}`);
  };

  const handleViewItemClick = (id: number, code?: string) => {
    navigate(`/News_Activity/view/${code || id}`);
  };

  const updateEditorialStatus = async (
    id: number,
    payload: Record<string, string>
  ) => {
    const response = await apiFetch(`/api/auther/updateEditorialAPI/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result?.message || result?.error || "Update failed");
    }
  };

  const handleReviewItemClick = (id: number, code?: string) => {
    navigate(`/News_Activity/view/${code || id}`);
  };

  const handlePinChange = async (id: number, checked: boolean) => {
    try {
      await updateEditorialStatus(id, {
        pin: checked ? "1" : "0",
        updatename: fullName,
      });
      setNewsData((prev) => ({
        ...prev,
        news: prev.news.map((item) =>
          item.id === id ? { ...item, pin: checked ? "1" : "0" } : item
        ),
      }));
      setNotify({
        isOpen: true,
        message: checked ? "ปักหมุดข้อมูลสำเร็จ" : "ยกเลิกปักหมุดสำเร็จ",
        type: "success",
      });
    } catch (error) {
      setNotify({
        isOpen: true,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถอัปเดตปักหมุดได้",
        type: "error",
      });
    }
  };

  return (
    <Container maxWidth="xl">
      <Paper
        elevation={0}
        sx={{
          mt: 5,
          py: 5,
          borderRadius: 3,
          width: "100%",
          backgroundColor:
            theme.palette.mode === "dark" ? theme.palette.primary.darker : "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: isMediumScreen ? "row" : { xs: "column", lg: "row" },
            justifyContent: { xs: "flex-start", lg: "space-between" },
            alignItems: isMediumScreen ? "flex-end" : { xs: "stretch", lg: "flex-end" },
            px: 3,
            pb: 4,
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              alignItems: "end",
              width: { xs: "100%", lg: "auto" },
            }}
          >
            <Box sx={{ width: { xs: "100%", md: 140 }, flexShrink: 0 }}>
              <MenuDropdownstatus
                titlename="ประเภท"
                handleFileTypeChange={handleTypeChange}
                fileType={selectedType}
                statusOptions={[
                  { valuename: "all", labelname: "แสดงทั้งหมด" },
                  ...newsTypes.map((item) => ({
                    valuename: String(item.id),
                    labelname: item.nameTH,
                  })),
                ]}
              />
            </Box>

            <Box sx={{ width: { xs: "100%", md: 140 }, flexShrink: 0 }}>
              <MenuDropdownstatus
                titlename="สถานะ"
                handleFileTypeChange={handleStatusChange}
                fileType={fileType}
                statusOptions={newsStatusOptions}
              />
            </Box>

            <Box sx={{ width: { xs: "100%", md: 220 } }}>
              <ComponentsDatePickerField
                label="วันที่เริ่มต้น :"
                value={startDate}
                onChange={(value) => {
                  setStartDate(value);
                  setPage(0);
                }}
                maxDate={endDate ?? undefined}
              />
            </Box>

            <Box sx={{ width: { xs: "100%", md: 220 } }}>
              <ComponentsDatePickerField
                label="วันที่สิ้นสุด :"
                value={endDate}
                onChange={(value) => {
                  setEndDate(value);
                  setPage(0);
                }}
                minDate={startDate ?? undefined}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", lg: "flex-end" },
              alignItems: "center",
              width: { xs: "100%", lg: "auto" },
            }}
          >
            <TextButton onClick={handleAddItemClick}>เพิ่มข่าวสารและกิจกรรม</TextButton>
            <ComponentsReportGraphButton
              active={showViewReport}
              title="กราฟ"
              activeTitle="ปิด"
              onClick={() => setShowViewReport((value) => !value)}
            />
            <AppIconButton title="รีเฟรชข้อมูล" onClick={handleRefresh}>
              <FiRefreshCw
                style={{
                  fontSize: theme.typography.h6.fontSize,
                  strokeWidth: 2.5,
                }}
              />
            </AppIconButton>
          </Box>
        </Box>

        <Grid container px={3}>
          <Grid size={{ xs: 12 }}>
            <ComponentsFadeSwapView viewKey={showViewReport ? "report" : "table"}>
              {showViewReport ? (
                <ComponentsViewCountReportPanel
                  rows={reportRows}
                  criteria={{
                    typeName: selectedTypeName,
                    startDate: startDate ? startDate.format("YYYY-MM-DD") : null,
                    endDate: endDate ? endDate.format("YYYY-MM-DD") : null,
                  }}
                  onExportReport={() =>
                    writeManualAdminLog({
                      actionType: 15,
                      actionDetail: "ออกรายงานการเข้าชมข่าวและกิจกรรม",
                      datatype: "ข่าวและกิจกรรม",
                      dataname: "รายงานการเข้าชมข่าวและกิจกรรม",
                    })
                  }
                />
              ) : (
                <ComponentsNewsTableView
                  newsData={newsData}
                  loading={loading}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  setPage={setPage}
                  setRowsPerPage={setRowsPerPage}
                  handleEdit={handleEditItemClick}
                  handleView={handleViewItemClick}
                  handleApprove={handleReviewItemClick}
                  handlePinChange={handlePinChange}
                />
              )}
            </ComponentsFadeSwapView>
          </Grid>
        </Grid>
      </Paper>

      <Notifications notify={notify} setNotify={setNotify} />
    </Container>
  );
};

export default Newspage;
