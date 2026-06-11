// “Form เพิ่ม / แก้ไข ข้อมูลคณะกรรมการ”

"use client";

/* ======================================================
   IMPORT REACT HOOK
====================================================== */

import {
  useEffect,
  useRef,
  useState,
} from "react";

/* ======================================================
   IMPORT TYPE
====================================================== */

import type {
  ChangeEvent,
  DragEvent,
} from "react";

/* ======================================================
   IMPORT COMPONENT จาก MUI
====================================================== */

import {
  Box,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

/* ======================================================
   IMPORT ICON
====================================================== */

import Person3Icon from "@mui/icons-material/Person3";

/* ======================================================
   IMPORT NAVIGATE
====================================================== */

import { useNavigate } from "react-router-dom";

/* ======================================================
   IMPORT API และ CONTEXT
====================================================== */

import { apiFetch } from "../../../API/client";

import { useAuth } from "../../../Context/AuthContext";

import { usePageTitle } from "../../../Context/PageTitleContext";

/* ======================================================
   IMPORT COMPONENT CUSTOM
====================================================== */

import BasicTextField from "../../Model/TextField/BasicTextField";

import ComponentTextChipTagModel from "../../Form/ComponentTextChipTagModel";

import BasicDropDownMultiSelect from "../../Model/Dropdown/BasicDropDownMultiSelect";

import TextButton from "../../Buttom/TextButton";

import ConfirmDialog from "../../Model/Pop_up/ConfirmDialog";

import Notifications from "../../Model/Pop_up/Notifications";

import ComponentsFormCard from "../../Form/ComponentsFormCard";

import ComponentsFormSection from "../../Form/ComponentsFormSection";

import ImageRemoveButton from "../../Buttom/ImageRemoveButton";

/* ======================================================
   IMPORT DATA
====================================================== */

import { committeeGroups } from "../../../API/StausData";

/* ======================================================
   TYPE : notification type
====================================================== */

type NotifyType =
  | "success"
  | "error"
  | "warning"
  | "info";

/* ======================================================
   TYPE : form error
====================================================== */

type FormErrors = {
  fullnameTH?: string;

  fullnameEN?: string;

  directorTag?: string;

  positionTH?: string;

  positionEN?: string;

  teamsPhoto?: string;
};

/* ======================================================
   API endpoint สำหรับ create ข้อมูล
====================================================== */

const createEndpointCandidates = [
  "/api/auther/uploadTeamsAPI",
  "/api/auther/createcompanydirectorAPI",
  "/api/auther/createCompanyDirectorAPI",
  "/api/author/uploadTeamsAPI",
];

/* ======================================================
   FUNCTION : ตรวจสอบประเภทไฟล์รูปภาพ
====================================================== */

const isAllowedImage = (
  file: File
) =>
  [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
  ].includes(file.type) ||

  /\.(jpe?g|png|gif)$/i.test(
    file.name
  );

/* ======================================================
   จำกัดขนาดรูปภาพไม่เกิน 2 MB
====================================================== */

const MAX_IMAGE_SIZE_BYTES =
  2 * 1024 * 1024;

/* ======================================================
   TYPE : props ของ component
====================================================== */

type ComponentsCompanyDirectorAddFormProps =
  {
    directorId?: string | number;

    mode?: "add" | "edit";
  };

/* ======================================================
   BASE URL สำหรับรูปภาพ
====================================================== */

const PHOTO_BASE =
  import.meta.env
    .VITE_BASE_URL_API_PHOTO ||

  import.meta.env
    .VITE_BASE_URL_API ||

  "";

/* ======================================================
   FUNCTION : buildPhotoUrl
------------------------------------------------------
   แปลง path รูปภาพให้เป็น URL เต็ม
====================================================== */

const buildPhotoUrl = (
  path?: string
) => {

  /* ======================================================
     ถ้าไม่มี path
  ====================================================== */

  if (!path) return "";

  /* ======================================================
     ถ้าเป็น URL เต็มอยู่แล้ว
  ====================================================== */

  if (
    /^(https?:|data:|blob:)/i.test(
      path
    )
  )
    return path;

  /* ======================================================
     ตัด / ด้านท้าย BASE URL
  ====================================================== */

  const base = String(
    PHOTO_BASE
  ).replace(/\/+$/, "");

  /* ======================================================
     ตัด / ด้านหน้าของ path
  ====================================================== */

  const cleanPath = path.replace(
    /^\/+/,
    ""
  );

  /* ======================================================
     รวม URL รูปภาพ
  ====================================================== */

  return `${base}/${cleanPath}`;
};

/* ======================================================
   FUNCTION : normalizeTagValue
------------------------------------------------------
   แปลงค่า tag ให้เป็น string รูปแบบเดียวกัน
====================================================== */

const normalizeTagValue = (
  value: unknown
) => {

  /* ======================================================
     กรณี value เป็น array
  ====================================================== */

  if (Array.isArray(value)) {
    return value
      .map(String)
      .join(" / ");
  }

  /* ======================================================
     ถ้าไม่ใช่ string
  ====================================================== */

  if (typeof value !== "string") {
    return "";
  }

  /* ======================================================
     trim space
  ====================================================== */

  const trimmedValue =
    value.trim();

  /* ======================================================
     ถ้าไม่มีค่า
  ====================================================== */

  if (!trimmedValue) return "";

  try {

    /* ======================================================
       parse JSON string
    ====================================================== */

    const parsedValue =
      JSON.parse(trimmedValue);

    /* ======================================================
       ถ้า parse แล้วเป็น array
    ====================================================== */

    if (Array.isArray(parsedValue)) {
      return parsedValue
        .map(String)
        .join(" / ");
    }
  } catch {

    /* ======================================================
       ignore parse error
    ====================================================== */

  }

  /* ======================================================
     return string ปกติ
  ====================================================== */

  return trimmedValue;
};

const firstFilledValue = (
  ...values: unknown[]
) =>
  values.find((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === "string") {
      return value.trim() !== "";
    }

    return value !== null && value !== undefined;
  }) ?? "";

/* ======================================================
   MAP : valuename -> labelname
------------------------------------------------------
   ใช้แปลงค่า tag เป็นข้อความแสดงผล
====================================================== */

const committeeGroupLabelMap =
  new Map(
    committeeGroups.map(
      (group) => [
        group.valuename,
        group.labelname,
      ]
    )
  );

/* ======================================================
   OPTION สำหรับ dropdown
====================================================== */

const committeeGroupOptions =
  committeeGroups.map(
    (group, index) => ({
      id: index + 1,

      ...group,
    })
  );

/* ======================================================
   FUNCTION : convertCommitteeTagsToLabels
------------------------------------------------------
   แปลง tag value -> label
====================================================== */

const convertCommitteeTagsToLabels = (
  value: string
) =>
  value

    /* ======================================================
       split string
    ====================================================== */

    .split(/[,/]/)

    /* ======================================================
       trim แต่ละค่า
    ====================================================== */

    .map((item) => item.trim())

    /* ======================================================
       ลบค่าว่าง
    ====================================================== */

    .filter(Boolean)

    /* ======================================================
       แปลง valuename -> labelname
    ====================================================== */

    .map(
      (item) =>
        committeeGroupLabelMap.get(
          item
        ) ?? item
    )

    /* ======================================================
       รวม string กลับ
    ====================================================== */

    .join(" / ");

/* ======================================================
   FUNCTION : normalizeCompareValue
------------------------------------------------------
   แปลงค่าเป็น string สำหรับ compare
====================================================== */

const normalizeCompareValue = (
  value: unknown
) =>
  String(value ?? "").trim();

/* ======================================================
   FUNCTION : buildDirectorSnapshot
------------------------------------------------------
   สร้าง snapshot สำหรับตรวจสอบข้อมูลเปลี่ยนแปลง
====================================================== */

const buildDirectorSnapshot = (
  value: {
    fullnameTH: string;

    fullnameEN: string;

    directorTag: string;

    positionTH: string;

    positionEN: string;

    image: string;
  }
) =>
  JSON.stringify({

    /* ======================================================
       ชื่อภาษาไทย
    ====================================================== */

    fullnameTH:
      normalizeCompareValue(
        value.fullnameTH
      ),

    /* ======================================================
       ชื่อภาษาอังกฤษ
    ====================================================== */

    fullnameEN:
      normalizeCompareValue(
        value.fullnameEN
      ),

    /* ======================================================
       ตำแหน่งคณะกรรมการ
    ====================================================== */

    directorTag:
      normalizeCompareValue(
        convertCommitteeTagsToLabels(
          value.directorTag
        )
      ),

    /* ======================================================
       ตำแหน่งภาษาไทย
    ====================================================== */

    positionTH:
      normalizeCompareValue(
        value.positionTH
      ),

    /* ======================================================
       ตำแหน่งภาษาอังกฤษ
    ====================================================== */

    positionEN:
      normalizeCompareValue(
        value.positionEN
      ),

    /* ======================================================
       รูปภาพ
    ====================================================== */

    image:
      normalizeCompareValue(
        value.image
      ),
  });


/* ======================================================
   FUNCTION : normalizeDirectorDetail
------------------------------------------------------
   normalize ข้อมูลรายละเอียดคณะกรรมการจาก API
====================================================== */

const normalizeDirectorDetail = (
  result: any
) => {

  /* ======================================================
     รองรับหลายรูปแบบ response
  ====================================================== */

  const item =
    result?.data ??

    result?.result ??

    result ??

    {};

  return {

    /* ======================================================
       ชื่อภาษาไทย
    ====================================================== */

    fullnameTH:
      item.companydirector_nameTH ??

      item.team_nameTH ??

      item.nameTH ??

      item.directorNameTH ??

      "",

    /* ======================================================
       ชื่อภาษาอังกฤษ
    ====================================================== */

    fullnameEN:
      item.companydirector_nameEN ??

      item.team_nameEN ??

      item.nameEN ??

      item.directorNameEN ??

      item.int_saksiam_directors_nameEN ??

      item.int_saksiam_companydirector_nameEN ??

      item.int_saksiam_team_nameEN ??

      "",

    /* ======================================================
       ตำแหน่งภาษาไทย
    ====================================================== */

    positionTH:
      item.companydirector_positionTH ??

      item.team_positionTH ??

      item.positionTH ??

      item.directorPositionTH ??

      "",

    /* ======================================================
       ตำแหน่งภาษาอังกฤษ
    ====================================================== */

    positionEN:
      item.companydirector_positionEN ??

      item.team_positionEN ??

      item.positionEN ??

      item.directorPositionEN ??

      "",

    /* ======================================================
       กลุ่มคณะกรรมการ
    ====================================================== */

    directorTag:
      normalizeTagValue(
        firstFilledValue(
          item.int_saksiam_directors_tag,

          item.directors_tag,

          item.directorTag,

          item.directorsTag,

          item.tag,

          item.directorstag,

          item.teamTag,

          item.teamtag,

          item.team_tag,

          item.committeeTag,

          item.committeeGroups
        )
      ),

    /* ======================================================
       รูปภาพคณะกรรมการ
    ====================================================== */

    image:
      item.companydirector_picture ??

      item.team_image ??

      item.team_picture ??

      item.picture ??

      item.image ??

      "",
  };
};

/* ======================================================
   COMPONENT : Form เพิ่ม / แก้ไข คณะกรรมการ
====================================================== */

const ComponentsCompanyDirectorAddForm = ({
  directorId,

  mode = "add",
}: ComponentsCompanyDirectorAddFormProps) => {

  /* ======================================================
     เรียกใช้งาน theme
  ====================================================== */

  const theme = useTheme();

  /* ======================================================
     navigate page
  ====================================================== */

  const navigate = useNavigate();

  /* ======================================================
     REF : input file
  ====================================================== */

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  /* ======================================================
     REF : preview URL
  ====================================================== */

  const previewUrlRef =
    useRef<string | null>(null);

  /* ======================================================
     CONTEXT : page title
  ====================================================== */

  const { setTitle } =
    usePageTitle();

  /* ======================================================
     CONTEXT : auth user
  ====================================================== */

  const { user } = useAuth();

  /* ======================================================
     STATE : เปิด / ปิด section รูปภาพ
  ====================================================== */

  const [
    imageBlockOpen,
    setImageBlockOpen,
  ] = useState(true);

  /* ======================================================
     STATE : เปิด / ปิด section รายละเอียด
  ====================================================== */

  const [
    detailBlockOpen,
    setDetailBlockOpen,
  ] = useState(true);

  /* ======================================================
     STATE : form field
  ====================================================== */

  const [
    fullnameTH,
    setFullnameTH,
  ] = useState("");

  const [
    fullnameEN,
    setFullnameEN,
  ] = useState("");

  const [
    directorTag,
    setDirectorTag,
  ] = useState("");

  const [
    positionTH,
    setPositionTH,
  ] = useState("");

  const [
    positionEN,
    setPositionEN,
  ] = useState("");

  /* ======================================================
     STATE : รูปภาพใหม่
  ====================================================== */

  const [
    teamsPhoto,
    setTeamsPhoto,
  ] = useState<File | null>(null);

  /* ======================================================
     STATE : รูปภาพเดิม
  ====================================================== */

  const [
    existingImage,
    setExistingImage,
  ] = useState("");

  /* ======================================================
     STATE : snapshot สำหรับ compare
  ====================================================== */

  const [
    initialSnapshot,
    setInitialSnapshot,
  ] = useState("");

  /* ======================================================
     STATE : preview รูปภาพ
  ====================================================== */

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState<string | null>(null);

  /* ======================================================
     STATE : drag file
  ====================================================== */

  const [
    isDragging,
    setIsDragging,
  ] = useState(false);

  /* ======================================================
     STATE : error form
  ====================================================== */

  const [
    error,
    setError,
  ] = useState<FormErrors>({});

  /* ======================================================
     STATE : notification popup
  ====================================================== */

  const [
    notify,
    setNotify,
  ] = useState({
    isOpen: false,

    message: "",

    type: "success" as NotifyType,
  });

  /* ======================================================
     STATE : confirm dialog
  ====================================================== */

  const [
    confirmDialog,
    setConfirmDialog,
  ] = useState({
    isOpen: false,

    isLoading: false,

    onConfirm: () => { },
  });

  /* ======================================================
     ชื่อผู้ใช้งาน
  ====================================================== */

  const fullName =
    `${user?.fname ?? ""} ${user?.lname ?? ""
      }`.trim() || "Unknown";

  /* ======================================================
     ประเภทผู้ใช้งาน
  ====================================================== */

  const typeUser =
    user?.role_name ?? "";

  /* ======================================================
     รหัสผู้ใช้งาน
  ====================================================== */

  const IDPer = String(
    user?.id ?? ""
  );

  /* ======================================================
     ตรวจสอบว่าเป็นโหมด edit หรือไม่
  ====================================================== */

  const isEditMode =
    mode === "edit";

  /* ======================================================
     EFFECT : โหลดข้อมูลคณะกรรมการ
  ====================================================== */

  useEffect(() => {

    /* ======================================================
       เปลี่ยน title page ตาม mode
    ====================================================== */

    setTitle(
      isEditMode
        ? "แก้ไขคณะกรรมการ"
        : "เพิ่มคณะกรรมการ"
    );

    /* ======================================================
       FUNCTION : fetchDirectorDetail
  ------------------------------------------------------
       โหลดข้อมูลคณะกรรมการสำหรับแก้ไข
    ====================================================== */

    const fetchDirectorDetail =
      async () => {

        /* ======================================================
           ถ้าไม่ใช่ edit mode
        ====================================================== */

        if (
          !isEditMode ||

          !directorId
        )
          return;

        /* ======================================================
           endpoint สำรอง
        ====================================================== */

        const endpoints = [
          `/api/auther/showcompanydirectorIDAPI/${directorId}`,

          `/api/auther/showCompanyDirectorIDAPI/${directorId}`,

          `/api/author/showcompanydirectorIDAPI/${directorId}`,
        ];

        /* ======================================================
           loop เรียก API
        ====================================================== */

        for (const endpoint of endpoints) {

          const response =
            await apiFetch(endpoint, {
              method: "GET",
            });

          const result =
            await response
              .json()
              .catch(() => ({}));

          /* ======================================================
             ถ้า response สำเร็จ
          ====================================================== */

          if (
            response.ok &&

            result?.status !== false
          ) {

            /* ======================================================
               normalize data
            ====================================================== */

            const director =
              normalizeDirectorDetail(
                result
              );

            /* ======================================================
               set form field
            ====================================================== */

            setFullnameTH(
              director.fullnameTH
            );

            setFullnameEN(
              director.fullnameEN
            );

            setDirectorTag(
              director.directorTag
            );

            setPositionTH(
              director.positionTH
            );

            setPositionEN(
              director.positionEN
            );

            /* ======================================================
               set รูปภาพเดิม
            ====================================================== */

            setExistingImage(
              director.image
            );

            setPreviewUrl(
              buildPhotoUrl(
                director.image
              )
            );

            /* ======================================================
               เก็บ snapshot สำหรับ compare
            ====================================================== */

            setInitialSnapshot(
              buildDirectorSnapshot({
                fullnameTH:
                  director.fullnameTH,

                fullnameEN:
                  director.fullnameEN,

                directorTag:
                  director.directorTag,

                positionTH:
                  director.positionTH,

                positionEN:
                  director.positionEN,

                image:
                  director.image,
              })
            );

            return;
          }

          /* ======================================================
             ถ้าไม่ใช่ 404 ให้หยุด loop
          ====================================================== */

          if (response.status !== 404) {
            break;
          }
        }

        /* ======================================================
           แจ้งเตือนเมื่อไม่พบข้อมูล
        ====================================================== */

        setNotify({
          isOpen: true,

          message:
            "ไม่พบข้อมูลคณะกรรมการที่ต้องการแก้ไข",

          type: "error",
        });
      };

    /* ======================================================
       เรียกโหลดข้อมูล
    ====================================================== */

    fetchDirectorDetail();


    /* ======================================================
       CLEANUP : ล้าง preview URL
    ====================================================== */

    return () => {

      /* ======================================================
         revoke object URL
         ป้องกัน memory leak
      ====================================================== */

      if (previewUrlRef.current) {
        URL.revokeObjectURL(
          previewUrlRef.current
        );
      }
    };
  }, [
    directorId,

    isEditMode,

    setTitle,
  ]);

  /* ======================================================
     FUNCTION : handleFieldChange
  ------------------------------------------------------
     clear error เมื่อมีการกรอกข้อมูล
  ====================================================== */

  const handleFieldChange = (
    fieldName: string,

    value: unknown
  ) => {

    setError((prev) => ({
      ...prev,

      [fieldName]: value
        ? ""
        : prev[
        fieldName as keyof FormErrors
        ],
    }));
  };

  /* ======================================================
     FUNCTION : setPreviewFile
  ------------------------------------------------------
     สร้าง preview รูปภาพ
  ====================================================== */

  const setPreviewFile = (
    file: File
  ) => {

    /* ======================================================
       ล้าง preview เดิม
    ====================================================== */

    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current
      );
    }

    /* ======================================================
       สร้าง object URL ใหม่
    ====================================================== */

    const url =
      URL.createObjectURL(file);

    /* ======================================================
       เก็บ URL สำหรับ cleanup
    ====================================================== */

    previewUrlRef.current = url;

    /* ======================================================
       set preview image
    ====================================================== */

    setPreviewUrl(url);

    /* ======================================================
       set file รูปภาพ
    ====================================================== */

    setTeamsPhoto(file);

    /* ======================================================
       clear error รูปภาพ
    ====================================================== */

    handleFieldChange(
      "teamsPhoto",

      file
    );
  };

  /* ======================================================
     FUNCTION : handleFile
  ------------------------------------------------------
     ตรวจสอบไฟล์รูปภาพ
  ====================================================== */

  const handleFile = (
    file?: File
  ) => {

    /* ======================================================
       ถ้าไม่มีไฟล์
    ====================================================== */

    if (!file) return;

    /* ======================================================
       ตรวจสอบขนาดไฟล์
    ====================================================== */

    if (
      file.size >
      MAX_IMAGE_SIZE_BYTES
    ) {

      setNotify({
        isOpen: true,

        message:
          "ขนาดไฟล์ต้องไม่เกิน 2 MB",

        type: "warning",
      });

      return;
    }

    /* ======================================================
       ตรวจสอบประเภทไฟล์
    ====================================================== */

    if (!isAllowedImage(file)) {

      setNotify({
        isOpen: true,

        message:
          "กรุณาอัปโหลดไฟล์ JPG, PNG หรือ GIF เท่านั้น",

        type: "warning",
      });

      return;
    }

    /* ======================================================
       set preview file
    ====================================================== */

    setPreviewFile(file);
  };

  /* ======================================================
     FUNCTION : handleFileChange
  ------------------------------------------------------
     upload file จาก input
  ====================================================== */

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {

    /* ======================================================
       รับไฟล์แรก
    ====================================================== */

    handleFile(
      event.target.files?.[0]
    );

    /* ======================================================
       reset input file
    ====================================================== */

    event.target.value = "";
  };

  /* ======================================================
     FUNCTION : handleDrop
  ------------------------------------------------------
     drag & drop file
  ====================================================== */

  const handleDrop = (
    event: DragEvent<HTMLDivElement>
  ) => {

    /* ======================================================
       ป้องกัน browser open file
    ====================================================== */

    event.preventDefault();

    /* ======================================================
       reset drag state
    ====================================================== */

    setIsDragging(false);

    /* ======================================================
       รับไฟล์จาก drag
    ====================================================== */

    handleFile(
      event.dataTransfer.files?.[0]
    );
  };

  /* ======================================================
     FUNCTION : removeImage
  ------------------------------------------------------
     ลบรูปภาพ preview
  ====================================================== */

  const removeImage = () => {

    /* ======================================================
       revoke object URL
    ====================================================== */

    if (previewUrlRef.current) {

      URL.revokeObjectURL(
        previewUrlRef.current
      );

      previewUrlRef.current =
        null;
    }

    /* ======================================================
       reset รูปภาพ
    ====================================================== */

    setPreviewUrl(null);

    setTeamsPhoto(null);

    setExistingImage("");

    /* ======================================================
       clear error รูปภาพ
    ====================================================== */

    setError((prev) => ({
      ...prev,

      teamsPhoto: "",
    }));
  };

  /* ======================================================
     FUNCTION : validateForm
  ------------------------------------------------------
     ตรวจสอบข้อมูล form
  ====================================================== */

  const validateForm = () => {

    const errors: FormErrors = {

      /* ======================================================
         validate ชื่อภาษาไทย
      ====================================================== */

      fullnameTH:
        !fullnameTH.trim()
          ? "กรุณากรอกชื่อ-นามสกุลภาษาไทย"
          : "",

      /* ======================================================
         validate ชื่อภาษาอังกฤษ
      ====================================================== */

      fullnameEN:
        !fullnameEN.trim()
          ? "กรุณากรอกชื่อ-นามสกุลภาษาอังกฤษ"
          : "",

      /* ======================================================
         validate กลุ่มคณะกรรมการ
      ====================================================== */

      directorTag: "",

      /* ======================================================
         validate ตำแหน่งภาษาไทย
      ====================================================== */

      positionTH:
        !positionTH.trim()
          ? "กรุณากรอกตำแหน่งภาษาไทย"
          : "",

      /* ======================================================
         validate ตำแหน่งภาษาอังกฤษ
      ====================================================== */

      positionEN:
        !positionEN.trim()
          ? "กรุณากรอกตำแหน่งภาษาอังกฤษ"
          : "",

      /* ======================================================
         validate รูปภาพ
      ====================================================== */

      teamsPhoto:
        !teamsPhoto &&
          !existingImage
          ? "กรุณาเลือกรูปคณะกรรมการ"
          : "",
    };

    /* ======================================================
       set error state
    ====================================================== */

    setError(errors);

    /* ======================================================
       return validation result
    ====================================================== */

    return !Object.values(errors).some(Boolean);
  };


  /* ======================================================
     FUNCTION : buildPayload
  ------------------------------------------------------
     สร้าง FormData สำหรับส่ง API
  ====================================================== */

  const buildPayload = () => {

    /* ======================================================
       สร้าง FormData
    ====================================================== */

    const formData = new FormData();

    /* ======================================================
       trim ค่า director tag
    ====================================================== */

    const directorTagValue =
      directorTag.trim();

    /* ======================================================
       แปลง tag -> label
    ====================================================== */

    const directorTagLabelValue =
      convertCommitteeTagsToLabels(
        directorTagValue
      );

    /* ======================================================
       append รูปภาพ
    ====================================================== */

    if (teamsPhoto) {
      formData.append(
        "teamPicture",
        teamsPhoto
      );
    }

    /* ======================================================
       append ชื่อภาษาไทย
    ====================================================== */

    formData.append(
      "teamnameth",
      fullnameTH.trim()
    );

    /* ======================================================
       append ชื่อภาษาอังกฤษ
    ====================================================== */

    formData.append(
      "teamnameen",
      fullnameEN.trim()
    );

    formData.append(
      "teamNameEN",
      fullnameEN.trim()
    );

    formData.append(
      "nameEN",
      fullnameEN.trim()
    );

    formData.append(
      "directorNameEN",
      fullnameEN.trim()
    );

    formData.append(
      "companydirector_nameEN",
      fullnameEN.trim()
    );

    formData.append(
      "int_saksiam_directors_nameEN",
      fullnameEN.trim()
    );

    formData.append(
      "int_saksiam_companydirector_nameEN",
      fullnameEN.trim()
    );

    formData.append(
      "int_saksiam_team_nameEN",
      fullnameEN.trim()
    );

    /* ======================================================
       append director tag
  ------------------------------------------------------
       รองรับหลายชื่อ field ของ API
    ====================================================== */

    formData.append(
      "int_saksiam_directors_tag",
      directorTagLabelValue
    );

    formData.append(
      "directorsTag",
      directorTagLabelValue
    );

    formData.append(
      "directorsTags",
      directorTagLabelValue
    );

    formData.append(
      "directors_tag",
      directorTagLabelValue
    );

    formData.append(
      "directorstag",
      directorTagLabelValue
    );

    formData.append(
      "teamTag",
      directorTagLabelValue
    );

    formData.append(
      "teamTags",
      directorTagLabelValue
    );

    formData.append(
      "teamtag",
      directorTagLabelValue
    );

    formData.append(
      "team_tag",
      directorTagLabelValue
    );

    formData.append(
      "committeeTag",
      directorTagLabelValue
    );

    formData.append(
      "committeeTags",
      directorTagLabelValue
    );

    formData.append(
      "committeeGroups",
      directorTagLabelValue
    );

    formData.append(
      "committee_groups",
      directorTagLabelValue
    );

    formData.append(
      "int_saksiam_companydirector_tag",
      directorTagLabelValue
    );

    formData.append(
      "int_saksiam_team_tag",
      directorTagLabelValue
    );

    /* ======================================================
       append ตำแหน่ง
    ====================================================== */

    formData.append(
      "teamPositionth",
      positionTH.trim()
    );

    formData.append(
      "teamPositionen",
      positionEN.trim()
    );

    /* ======================================================
       append สถานะ active
    ====================================================== */

    formData.append(
      "active",
      "1"
    );

    /* ======================================================
       append ชื่อผู้บันทึก / ผู้แก้ไข
    ====================================================== */

    if (isEditMode) {

      formData.append(
        "updatename",
        fullName
      );

      formData.append(
        "teamupdatename",
        fullName
      );

      formData.append(
        "teamUpdatename",
        fullName
      );

      formData.append(
        "teamUpdateName",
        fullName
      );

      formData.append(
        "companydirector_updatename",
        fullName
      );

      formData.append(
        "companydirectorUpdateName",
        fullName
      );

      formData.append(
        "int_saksiam_team_updatename",
        fullName
      );

      formData.append(
        "int_saksiam_companydirector_updatename",
        fullName
      );

    } else {

      /* ======================================================
         append ผู้บันทึก
      ====================================================== */

      formData.append(
        "savename",
        fullName
      );
    }

    /* ======================================================
       return formData
    ====================================================== */

    return formData;
  };

  /* ======================================================
     FUNCTION : postSave
  ------------------------------------------------------
     เรียก API บันทึกข้อมูล
  ====================================================== */

  const postSave = async (
    formData: FormData
  ) => {

    /* ======================================================
       endpoint สำหรับ add / edit
    ====================================================== */

    const endpointCandidates =
      isEditMode
        ? [
          `/api/auther/updatecompanydirectorIDAPI/${directorId}`,

          `/api/auther/updateCompanyDirectorAPI/${directorId}`,

          `/api/author/updatecompanydirectorIDAPI/${directorId}`,
        ]
        : createEndpointCandidates;

    /* ======================================================
       เก็บ error ล่าสุด
    ====================================================== */

    let lastError:
      | Error
      | null = null;

    /* ======================================================
       loop เรียก API
    ====================================================== */

    for (const endpoint of endpointCandidates) {

      const response =
        await apiFetch(endpoint, {
          method: "POST",

          body: formData,
        });

      const result =
        await response
          .json()
          .catch(() => ({}));

      /* ======================================================
         ถ้าบันทึกสำเร็จ
      ====================================================== */

      if (
        response.ok &&

        result?.status !== false
      ) {
        return result;
      }

      /* ======================================================
         เก็บ error message
      ====================================================== */

      lastError = new Error(
        result?.message ||

        result?.error ||

        `บันทึกข้อมูลไม่สำเร็จ (${response.status})`
      );

      /* ======================================================
         ถ้าไม่ใช่ 404 ให้หยุด loop
      ====================================================== */

      if (response.status !== 404) {
        break;
      }
    }

    /* ======================================================
       throw error
    ====================================================== */

    throw (
      lastError ??
      new Error(
        "บันทึกข้อมูลไม่สำเร็จ"
      )
    );
  };


  /* ======================================================
     FUNCTION : writeLog
  ------------------------------------------------------
     บันทึก log การเพิ่ม / แก้ไขข้อมูล
  ====================================================== */

  const writeLog = async (
    teamID?: string | number
  ) => {

    try {

      await apiFetch(
        "/api/auther/log",
        {
          method: "POST",

          body: JSON.stringify({

            /* ======================================================
               action type
               8 = add
               9 = edit
            ====================================================== */

            actionType:
              isEditMode
                ? 9
                : 8,

            /* ======================================================
               รายละเอียด log
            ====================================================== */

            actionDetail:
              `${isEditMode ? "ฟอร์มแก้ไข" : "ฟอร์มเพิ่ม"}คณะกรรมการ รหัสคณะกรรมการ: ${teamID ?? directorId ?? "-"} ชื่อภาษาไทย: ${fullnameTH} ชื่อภาษาอังกฤษ: ${fullnameEN} ตำแหน่งคณะกรรมการ: ${directorTag} ตำแหน่งภาษาไทย: ${positionTH}`,

            /* ======================================================
               ข้อมูลผู้ใช้งาน
            ====================================================== */

            typeUser,

            datatype:
              "คณะกรรมการ",

            dataID:
              teamID ?? "",

            dataname:
              fullnameTH,

            IDPer,

            FullPer:
              fullName,
          }),
        }
      );

    } catch {

      /* ======================================================
         ignore log error
      ====================================================== */
    }
  };

  /* ======================================================
     FUNCTION : handleSubmit
  ------------------------------------------------------
     submit form บันทึกข้อมูล
  ====================================================== */

  const handleSubmit = () => {

    /* ======================================================
       validate form
    ====================================================== */

    if (!validateForm())
      return;

    /* ======================================================
       snapshot ปัจจุบัน
    ====================================================== */

    const currentSnapshot =
      buildDirectorSnapshot({
        fullnameTH,

        fullnameEN,

        directorTag,

        positionTH,

        positionEN,

        image:
          existingImage,
      });

    /* ======================================================
       check ไม่มีการเปลี่ยนแปลงข้อมูล
    ====================================================== */

    if (
      isEditMode &&

      initialSnapshot &&

      !teamsPhoto &&

      currentSnapshot ===
      initialSnapshot
    ) {

      setNotify({
        isOpen: true,

        message:
          "ไม่มีการเปลี่ยนแปลงข้อมูล",

        type: "info",
      });

      return;
    }

    /* ======================================================
       เปิด confirm dialog
    ====================================================== */

    setConfirmDialog({
      isOpen: true,

      isLoading: false,

      onConfirm: async () => {

        /* ======================================================
           set loading
        ====================================================== */

        setConfirmDialog(
          (prev) => ({
            ...prev,

            isLoading: true,
          })
        );

        try {

          /* ======================================================
             save data
          ====================================================== */

          const result =
            await postSave(
              buildPayload()
            );

          /* ======================================================
             ดึง teamID จาก response
          ====================================================== */

          const teamID =
            result?.data?.int_saksolar_companydirector_ID ??

            result?.data?.int_saksiam_companydirector_ID ??

            result?.data?.teamID ??

            result?.id ??

            directorId;

          /* ======================================================
             write log
          ====================================================== */

          await writeLog(
            teamID
          );

          /* ======================================================
             redirect กลับหน้า list
          ====================================================== */

          navigate(
            "/About/Company_Director",
            {
              state: {
                notify: {
                  message:
                    isEditMode
                      ? "แก้ไขข้อมูลคณะกรรมการสำเร็จ"
                      : "บันทึกข้อมูลคณะกรรมการสำเร็จ",

                  type:
                    "success",
                },
              },
            }
          );

        } catch (saveError) {

          /* ======================================================
             แจ้งเตือน error
          ====================================================== */

          setNotify({
            isOpen: true,

            message:
              saveError instanceof Error
                ? saveError.message
                : "บันทึกข้อมูลคณะกรรมการไม่สำเร็จ",

            type: "error",
          });

        } finally {

          /* ======================================================
             reset confirm dialog
          ====================================================== */

          setConfirmDialog(
            (prev) => ({
              ...prev,

              isOpen: false,

              isLoading: false,
            })
          );
        }
      },
    });
  };

  /* ======================================================
     FUNCTION : renderImageUpload
  ------------------------------------------------------
     UI upload รูปภาพ
  ====================================================== */

  const renderImageUpload =
    () => (
      <Box>

        {/* ======================================================
         upload area
      ====================================================== */}

        <Box

          /* ======================================================
             drag over
          ====================================================== */

          onDragOver={(
            event
          ) =>
            event.preventDefault()
          }

          /* ======================================================
             drag enter
          ====================================================== */

          onDragEnter={() =>
            setIsDragging(true)
          }

          /* ======================================================
             drag leave
          ====================================================== */

          onDragLeave={() =>
            setIsDragging(false)
          }

          /* ======================================================
             drop file
          ====================================================== */

          onDrop={handleDrop}

          /* ======================================================
             click upload
          ====================================================== */

          onClick={() => fileInputRef.current?.click()}

          sx={{
            minHeight: 340,
            border: `1px dashed ${error.teamsPhoto
              ? theme.palette.error.main
              : theme.palette.grey[400]
              }`,

            borderRadius: 2,
            p: 3,
            backgroundColor:
              isDragging
                ? theme.palette.action.hover
                : "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            cursor: "pointer",
          }}
        >

          {/* ======================================================
           input สำหรับอัปโหลดไฟล์แบบซ่อน
          ====================================================== */}

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={
              handleFileChange
            }
          />

          {/* ======================================================
           แสดง preview รูปภาพ
          ====================================================== */}

          {previewUrl ? (

            <Box

              /* ======================================================
                 ป้องกัน click ทะลุ upload area
              ====================================================== */

              onClick={(event) => event.stopPropagation()}
              sx={{
                position: "relative",
                display: "inline-flex",
              }}
            >

              {/* ======================================================
               รูป preview
              ====================================================== */}

              <Box
                component="img"
                src={previewUrl}
                alt={
                  teamsPhoto?.name ??
                  "company director"
                }

                sx={{
                  width: {
                    xs: 220,
                    sm: 260,
                  },

                  // อัตราส่วน 2:3
                  height: {
                    xs: 330, // 220 × 3 / 2
                    sm: 390, // 260 × 3 / 2
                  },

                  objectFit: "contain",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "grey.300",
                  backgroundColor: "#fff",
                }}
              />

              {/* ======================================================
               ปุ่มลบรูปภาพ
              ====================================================== */}

              <ImageRemoveButton onRemove={removeImage} />
            </Box>

          ) : (

            /* ======================================================
               placeholder upload
            ====================================================== */

            <Stack spacing={1.5} alignItems="center">

              {/* ======================================================
               วงกลม icon upload
              ====================================================== */}

              <Box
                sx={{
                  width: 130,
                  height: 130,
                  borderRadius: "50%",

                  border: `1px dashed ${error.teamsPhoto
                    ? theme.palette.error.main
                    : theme.palette.mode === "dark"
                      ? theme.palette.grey[100]
                      : theme.palette.grey[400]
                    }`,

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  cursor: "pointer",
                }}
              >

                {/* ======================================================
                 icon กล้อง
                ====================================================== */}

                <Box
                  sx={{
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    backgroundColor: error.teamsPhoto
                      ? theme.palette.error.lighter
                      : theme.palette.mode === "dark"
                        ? theme.palette.grey[800]
                        : "#D9D9D9",
                    transition: theme.transitions.create(
                      ["background-color", "color", "font-weight"],
                      { duration: theme.transitions.duration.shorter }
                    ),
                    "&:hover": {
                      backgroundColor: error.teamsPhoto
                        ? alpha(theme.palette.error.lighter, 0.6)
                        : theme.palette.mode === "dark"
                          ? alpha(theme.palette.grey[700], 0.7)
                          : "#AFAFAF",
                      "& .MuiSvgIcon-root": {
                        color: error.teamsPhoto
                          ? alpha(theme.palette.error.main, 0.75)
                          : theme.palette.common.white,
                      },
                      "& .MuiTypography-root": {
                        color: error.teamsPhoto
                          ? alpha(theme.palette.error.main, 0.75)
                          : theme.palette.text.primary,
                        fontWeight: 500,
                      },
                    },
                  }}
                >
                  <Person3Icon
                    fontSize="medium"
                    sx={{
                      color: error.teamsPhoto
                        ? theme.palette.error.main
                        : theme.palette.common.white,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      color: error.teamsPhoto
                        ? theme.palette.error.main
                        : theme.palette.text.primary,
                      fontWeight: 400,
                    }}
                  >
                    อัปโหลดรูป
                  </Typography>
                </Box>
              </Box>

              {/* ======================================================
               ข้อความ upload
              ====================================================== */}

              {/* ======================================================
               ข้อความประเภทไฟล์
              ====================================================== */}

              <Typography
                variant="body2"

                color="text.secondary"
              >
                รองรับไฟล์ภาพ *.jpeg, *.jpg, *.png, *.gif ขนาดไม่เกิน 2 MB
              </Typography>
            </Stack>
          )}
        </Box>

        {/* ======================================================
         ข้อความ error รูปภาพ
        ====================================================== */}

        {error.teamsPhoto && (

          <Typography
            color="error"

            variant="caption"

            sx={{
              mt: 0.75,

              display: "block",
            }}
          >
            {error.teamsPhoto}
          </Typography>
        )}
      </Box>
    );


  return (
    <>

      {/* ======================================================
         card ฟอร์มหลัก
      ====================================================== */}

      <ComponentsFormCard
        title={
          isEditMode
            ? "ฟอร์มแก้ไขข้อมูลคณะกรรมการ"
            : "ฟอร์มการบันทึกคณะกรรมการ"
        }
      >

        {/* ======================================================
           section : รูปคณะกรรมการ
        ====================================================== */}

        <ComponentsFormSection
          title="รูปคณะกรรมการ"

          open={imageBlockOpen}

          onToggle={() =>
            setImageBlockOpen(
              (prev) => !prev
            )
          }

          iconType="image"
        >

          {/* ======================================================
             upload รูปภาพ
          ====================================================== */}

          {renderImageUpload()}
        </ComponentsFormSection>

        {/* ======================================================
           section : รายละเอียดข้อมูล
        ====================================================== */}

        <ComponentsFormSection
          title="รายละเอียดข้อมูลคณะกรรมการ"

          open={detailBlockOpen}

          onToggle={() =>
            setDetailBlockOpen(
              (prev) => !prev
            )
          }

          noMargin
        >

          {/* ======================================================
             จัดวางฟอร์มแบบ Grid
          ====================================================== */}

          <Grid container spacing={3} >

            {/* ======================================================
               ชื่อ - นามสกุลภาษาไทย
            ====================================================== */}

            <Grid size={{ xs: 12, md: 6 }}>
              <BasicTextField
                name="ชื่อ - นามสกุลภาษาไทย"
                titlename="กรุณากรอกชื่อ-นามสกุลภาษาไทย"
                subject={fullnameTH}
                setsubject={setFullnameTH}
                topon={0}
                handleFieldChange={handleFieldChange}
                error={error.fullnameTH}
                fieldKey="fullnameTH"
                specify
              />
            </Grid>

            {/* ======================================================
               ชื่อ - นามสกุลภาษาอังกฤษ
            ====================================================== */}

            <Grid size={{ xs: 12, md: 6 }}>
              <BasicTextField
                name="ชื่อ - นามสกุลภาษาอังกฤษ"
                titlename="กรุณากรอกชื่อ-นามสกุลภาษาอังกฤษ"
                subject={fullnameEN}
                setsubject={setFullnameEN}
                topon={0}
                handleFieldChange={handleFieldChange}
                error={error.fullnameEN}
                fieldKey="fullnameEN"
                specify
              />
            </Grid>

            {/* ======================================================
               dropdown ตำแหน่งคณะกรรมการ
            ====================================================== */}

            <Grid size={{ xs: 12 }}>
              <BasicDropDownMultiSelect
                titlename="ตำแหน่งคณะกรรมการ"
                value={directorTag}
                setValue={setDirectorTag}
                topon={0}
                handleFieldChange={handleFieldChange}
                error={error.directorTag}
                fieldKey="directorTag"
                specify={false}
                options={committeeGroupOptions}
              />
            </Grid>

            {/* ======================================================
               ตำแหน่งภาษาไทย
            ====================================================== */}

            <Grid size={{ xs: 12, md: 6 }}>
              <ComponentTextChipTagModel
                name="ตำแหน่งภาษาไทย"
                titlename="กรุณากรอกตำแหน่งภาษาไทย"
                tags={positionTH}
                setsubject={setPositionTH}
                topon={0}
                handleFieldChange={handleFieldChange}
                error={error.positionTH}
                fieldKey="positionTH"
                specify
              />
            </Grid>

            {/* ======================================================
               ตำแหน่งภาษาอังกฤษ
            ====================================================== */}

            <Grid size={{ xs: 12, md: 6 }}>
              <ComponentTextChipTagModel
                name="ตำแหน่งภาษาอังกฤษ"
                titlename="กรุณากรอกตำแหน่งภาษาอังกฤษ"
                tags={positionEN}
                setsubject={setPositionEN}
                topon={0}
                handleFieldChange={handleFieldChange}
                error={error.positionEN}
                fieldKey="positionEN"
                specify
              />
            </Grid>
          </Grid>

          {/* ======================================================
             ปุ่ม submit
          ====================================================== */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 4,
            }}
          >
            <TextButton
              onClick={handleSubmit}
              sx={{
                backgroundColor:
                  isEditMode
                    ? theme.palette.warning.main
                    : theme.palette.secondary.main,
              }}
            >
              {isEditMode
                ? "แก้ไขข้อมูล"
                : "บันทึกข้อมูล"}
            </TextButton>
          </Box>
        </ComponentsFormSection>
      </ComponentsFormCard>

      {/* ======================================================
         กล่องยืนยันการทำรายการ
      ====================================================== */}

      <ConfirmDialog
        type={
          isEditMode
            ? "edit"
            : "add"
        }

        confirmDialog={confirmDialog}

        setConfirmDialog={setConfirmDialog}
      />

      {/* ======================================================
         กล่องแจ้งเตือน Popup
      ====================================================== */}

      <Notifications
        notify={notify}

        setNotify={setNotify}
      />
    </>
  );
};

export default ComponentsCompanyDirectorAddForm;
