// “ฟอร์มเพิ่มข่าวและกิจกรรม”

"use client";

/* ======================================================
   IMPORT React Hook และ TYPE ที่จำเป็น
====================================================== */

import { useEffect, useRef, useState } from "react";
import type { DragEvent, SetStateAction } from "react";

/* ======================================================
   IMPORT COMPONENT จาก MUI
====================================================== */

import {
    Box,
    Button,
    Container,
    Grid,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";

/* ======================================================
   IMPORT ICON จาก MUI
====================================================== */

import CloudUploadIcon from "@mui/icons-material/CloudUpload"; // icon อัปโหลดไฟล์

/* ======================================================
   IMPORT Drag & Drop จาก dnd-kit
====================================================== */

import {
    closestCenter,
    DndContext,
    PointerSensor,
    type DragEndEvent,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/* ======================================================
   IMPORT Rich Text Editor
====================================================== */

import StarterKit from "@tiptap/starter-kit";

import {
    MenuButtonBlockquote,
    MenuButtonBold,
    MenuButtonBulletedList,
    MenuButtonCode,
    MenuButtonEditLink,
    MenuButtonHorizontalRule,
    MenuButtonItalic,
    MenuButtonOrderedList,
    MenuButtonStrikethrough,
    MenuControlsContainer,
    MenuDivider,
    MenuSelectHeading,
    type RichTextEditorRef,
} from "mui-tiptap";

import Placeholder from "@tiptap/extension-placeholder";

/* ======================================================
   IMPORT Router
====================================================== */

import { useNavigate } from "react-router-dom";

/* ======================================================
   IMPORT API และ Context
====================================================== */

import { apiFetch } from "../../../API/client";
import { useAuth } from "../../../Context/AuthContext";
import { usePageTitle } from "../../../Context/PageTitleContext";

/* ======================================================
   IMPORT COMPONENT ที่ใช้งานในฟอร์ม
====================================================== */

import BasicTextField from "../../Model/TextField/BasicTextField";
import BasicDropDownseletedata from "../../Model/Dropdown/BasicDropDownseletedata";
import TextButton from "../../Buttom/TextButton";
import ConfirmDialog from "../../Model/Pop_up/ConfirmDialog";
import Notifications from "../../Model/Pop_up/Notifications";
import PanoramaUpload from "../../../assets/Image/picture_14204933.gif";
import ComponentsFormSection from "../../Form/ComponentsFormSection";
import ComponentsFormCard from "../../Form/ComponentsFormCard";
import ComponentsNewsRichTextField from "./ComponentsNewsRichTextField";
import ImageRemoveButton from "../../Buttom/ImageRemoveButton";

/* ======================================================
   TYPE : รูปแบบ Notification
====================================================== */

type NotifyType = "success" | "error" | "warning" | "info";

/* ======================================================
   TYPE : ข้อมูลประเภทข่าวและกิจกรรม
====================================================== */

type NewsTypeOption = {
    id: number; // รหัสประเภทข่าว
    nameTH: string; // ชื่อประเภทข่าวภาษาไทย
    nameEN: string; // ชื่อประเภทข่าวภาษาอังกฤษ
    active: string | number; // สถานะการใช้งาน
};

/* ======================================================
   TYPE : Error ของฟอร์ม
====================================================== */

type FormErrors = {
    typeId?: string; // error ประเภทข่าว
    titleTH?: string; // error หัวข้อภาษาไทย
    titleEN?: string; // error หัวข้อภาษาอังกฤษ
    detailTH?: string; // error รายละเอียดภาษาไทย
    detailEN?: string; // error รายละเอียดภาษาอังกฤษ
    image?: string; // error รูปภาพ
};

/* ======================================================
   EXTENSIONS : Editor ภาษาไทย
====================================================== */

const editorExtensionsTH = [
    StarterKit,
    Placeholder.configure({
        placeholder: "กรุณากรอกรายละเอียดข่าวและกิจกรรมภาษาไทย",
    }),
];

/* ======================================================
   EXTENSIONS : Editor ภาษาอังกฤษ
====================================================== */

const editorExtensionsEN = [
    StarterKit,
    Placeholder.configure({
        placeholder: "กรุณากรอกรายละเอียดข่าวและกิจกรรมภาษาอังกฤษ",
    }),
];

/* ======================================================
   FUNCTION : Toolbar ของ Rich Text Editor
====================================================== */

const editorControls = () => (
    <MenuControlsContainer>
        <MenuSelectHeading />
        <MenuDivider />
        <MenuButtonBold />
        <MenuButtonItalic />
        <MenuButtonStrikethrough />
        <MenuButtonCode />
        <MenuDivider />
        <MenuButtonBulletedList />
        <MenuButtonOrderedList />
        <MenuButtonBlockquote />
        <MenuButtonHorizontalRule />
        <MenuButtonEditLink />
    </MenuControlsContainer>
);

/* ======================================================
   API ENDPOINT : ดึงรายการประเภทข่าวและกิจกรรม
====================================================== */

const typeListEndpoints = [
    "/api/auther/showEditorialTypelistAPI",
    "/api/auther/showEditorialTypeAPI",
    "/api/auther/showEditorialTypeDataAPI",
    "/api/auther/showNewsTypelistAPI",
];

/* ======================================================
   API ENDPOINT : บันทึกข่าวและกิจกรรม
====================================================== */

const createEndpoint = "/api/auther/createEditorialAPI";

/* ======================================================
   API ENDPOINT : อัปโหลดรูปภาพ Gallery
====================================================== */

const createGalleryEndpoint = "/api/auther/createGalleryAPI";

/* ======================================================
   FUNCTION : ลบ HTML Tag ออกจากข้อความ
====================================================== */

const stripHtml = (html: string) =>
    html
        .replace(/<[^>]*>/g, "") // ลบ HTML Tag
        .replace(/&nbsp;/g, "") // ลบ &nbsp;
        .trim(); // ลบช่องว่างหน้า-หลัง

/* ======================================================
   FUNCTION : รักษาระยะ spacing ของ HTML
====================================================== */

const preserveHtmlSpacing = (html: string) =>
    html
        .split(/(<[^>]+>)/g)
        .map((part) => {

            // ถ้าเป็น HTML Tag ให้ return กลับทันที
            if (part.startsWith("<") && part.endsWith(">"))
                return part;

            // แปลง space หลายตัวเป็น &nbsp;
            return part.replace(
                / {2,}/g,
                (spaces) =>
                    "&nbsp;".repeat(spaces.length)
            );
        })
        .join("");

const getImageFileKey = (file: File) =>
    `${file.name.trim().toLowerCase()}-${file.size}-${file.lastModified}`;

const getNewsErrorMessage = (message?: string) => {
    const text = message?.trim();

    if (!text) {
        return "บันทึกข้อมูลข่าวและกิจกรรมไม่สำเร็จ";
    }

    const lowerText = text.toLowerCase();

    if (
        lowerText.includes("news/activity image") &&
        lowerText.includes("already exists")
    ) {
        return "รูปข่าวและกิจกรรมนี้มีอยู่ในระบบแล้ว";
    }

    if (
        lowerText.includes("image") &&
        lowerText.includes("already exists")
    ) {
        return "รูปข่าวและกิจกรรมนี้มีอยู่ในระบบแล้ว";
    }

    if (lowerText.includes("at least one image is required")) {
        return "กรุณาเลือกรูปข่าวและกิจกรรมอย่างน้อย 1 รูป";
    }

    return text;
};

/* ======================================================
   FUNCTION : แปลงข้อมูลประเภทข่าวจาก API
====================================================== */

const normalizeNewsType = (
    item: any
): NewsTypeOption => ({

    // รหัสประเภทข่าว
    id: Number(
        item.editorialtypeID ??
        item.editorialTypeID ??
        item.newstypeID ??
        item.newsTypeID ??
        item.int_saksiam_typeeditorial_id ??
        item.int_saksiam_typenews_id ??
        0
    ),

    // ชื่อประเภทข่าวภาษาไทย
    nameTH:
        item.editorialtypenameTH ??
        item.editorialTypeNameTH ??
        item.newstypenameTH ??
        item.newsTypeNameTH ??
        item.int_saksiam_typeeditorial_nameTH ??
        item.int_saksiam_typenews_nameTH ??
        "",

    // ชื่อประเภทข่าวภาษาอังกฤษ
    nameEN:
        item.editorialtypenameEN ??
        item.editorialTypeNameEN ??
        item.newstypenameEN ??
        item.newsTypeNameEN ??
        item.int_saksiam_typeeditorial_nameEN ??
        item.int_saksiam_typenews_nameEN ??
        "",

    // สถานะการใช้งาน
    active:
        item.editorialtypeactive ??
        item.editorialTypeActive ??
        item.newstypeactive ??
        item.newsTypeActive ??
        item.int_saksiam_typeeditorial_active ??
        item.int_saksiam_typenews_active ??
        1,
});

/* ======================================================
   FUNCTION : ตรวจสอบว่าเป็นไฟล์ JPG หรือไม่
====================================================== */

const isJpgFile = (file: File) =>
    file.type === "image/jpeg" ||
    /\.(jpe?g)$/i.test(file.name);

/* ======================================================
   CONSTANT : จำนวนรูปสูงสุดที่อัปโหลดได้
====================================================== */

const MAX_IMAGE_FILES = 15;

/* ======================================================
   CONSTANT : ขนาดไฟล์สูงสุด 2 MB
====================================================== */

const MAX_IMAGE_SIZE_BYTES =
    2 * 1024 * 1024;

/* ======================================================
   TYPE : ข้อมูลรูปภาพ preview
====================================================== */

type PreviewFile = {

    file: File; // ไฟล์รูปภาพ

    url: string; // URL preview
};

/* ======================================================
   TYPE : Props ของ SortableImageItem
====================================================== */

type SortableImageItemProps = {

    item: PreviewFile; // ข้อมูลรูปภาพ

    index: number; // index ของรูป

    onRemove: (index: number) => void; // function ลบรูป
};

/* ======================================================
   COMPONENT : รูปภาพแบบลากเรียงลำดับได้
====================================================== */

const SortableImageItem = ({
    item,
    index,
    onRemove,
}: SortableImageItemProps) => {

    /* ======================================================
       HOOK : useSortable สำหรับ drag & drop
    ====================================================== */

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({

        // ใช้ url เป็น id ของ item
        id: item.url,
    });

    return (

        /* ======================================================
           CONTAINER : รูปภาพสำหรับ drag & drop
        ====================================================== */

        <Box
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            sx={{
                position: "relative",

                // ลด opacity ระหว่างลากรูป
                opacity: isDragging ? 0.7 : 1,

                // animation transform ระหว่าง drag
                transform: CSS.Transform.toString(transform),

                // transition animation
                transition,

                // เปลี่ยน cursor ตอนลาก
                cursor: "grab",

                // ป้องกัน touch action
                touchAction: "none",

                // layer ระหว่างลาก
                zIndex: isDragging ? 2 : 1,
            }}
        >

            {/* ======================================================
               IMAGE : รูป preview
            ====================================================== */}

            <Box
                component="img"
                src={item.url}
                alt={item.file.name}
                sx={{
                    width: "100%",
                    height: 120,
                    borderRadius: 1.5,
                    objectFit: "cover",
                    border: "1px solid",
                    borderColor: "grey.300",
                }}
            />

            {/* ======================================================
               BUTTON : ปุ่มลบรูปภาพ
            ====================================================== */}

            <ImageRemoveButton onRemove={() => onRemove(index)} />

            {/* ======================================================
               TEXT : ชื่อไฟล์รูปภาพ
            ====================================================== */}

            <Typography
                variant="caption"
                noWrap
                title={item.file.name}
                sx={{ display: "block", mt: 0.5 }}
            >

                {/* แสดงชื่อไฟล์ */}
                {item.file.name}
            </Typography>
        </Box>
    );
};

/* ======================================================
   COMPONENT : ฟอร์มเพิ่มข่าวและกิจกรรม
====================================================== */

const ComponentsNewsAddForm = () => {

    /* ======================================================
       HOOK : Theme และ Navigation
    ====================================================== */

    const theme = useTheme(); // theme ของ MUI
    const navigate = useNavigate(); // navigate เปลี่ยนหน้า

    /* ======================================================
       CONTEXT : ข้อมูลผู้ใช้ และ title page
    ====================================================== */

    const { user } = useAuth(); // ข้อมูล user ที่ login
    const { setTitle } = usePageTitle(); // set title หน้าเว็บ

    /* ======================================================
       SENSOR : Drag & Drop Sensor
    ====================================================== */

    const sensors = useSensors(
        useSensor(PointerSensor, {

            // เริ่ม drag เมื่อเลื่อนเกิน 6px
            activationConstraint: { distance: 6 },
        })
    );

    /* ======================================================
       REF : Rich Text Editor และ Input File
    ====================================================== */

    const detailTHRef = useRef<RichTextEditorRef>(null); // editor ภาษาไทย
    const detailENRef = useRef<RichTextEditorRef>(null); // editor ภาษาอังกฤษ

    const fileInputRef = useRef<HTMLInputElement>(null); // input file upload

    const imageFilesRef = useRef<PreviewFile[]>([]); // เก็บรูปภาพปัจจุบัน

    /* ======================================================
       STATE : เปิด / ปิด section
    ====================================================== */

    const [typeBlockOpen, setTypeBlockOpen] = useState(true); // section ประเภทข่าว
    const [detailBlockOpen, setDetailBlockOpen] = useState(true); // section รายละเอียด
    const [imageBlockOpen, setImageBlockOpen] = useState(true); // section รูปภาพ

    /* ======================================================
       STATE : ข้อมูลฟอร์ม
    ====================================================== */

    const [newsTypes, setNewsTypes] = useState<NewsTypeOption[]>([]); // รายการประเภทข่าว
    const [typeId, setTypeId] = useState<number | null>(null); // ประเภทข่าวที่เลือก

    const [titleTH, setTitleTH] = useState(""); // หัวข้อภาษาไทย
    const [titleEN, setTitleEN] = useState(""); // หัวข้อภาษาอังกฤษ
    const [detailTH, setDetailTH] = useState("");
    const [detailEN, setDetailEN] = useState("");

    const [imageFiles, setImageFiles] = useState<PreviewFile[]>([]); // รูปภาพที่อัปโหลด

    /* ======================================================
       STATE : Error ของฟอร์ม
    ====================================================== */

    const [error, setError] = useState<FormErrors>({});

    /* ======================================================
       STATE : Notification Popup
    ====================================================== */

    const [notify, setNotify] = useState({
        isOpen: false,
        message: "",
        type: "success" as NotifyType,
    });

    /* ======================================================
       STATE : Confirm Dialog
    ====================================================== */

    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        isLoading: false,
        onConfirm: () => { },
    });

    /* ======================================================
       FUNCTION : update รายการรูปภาพ
    ====================================================== */

    const updateImageFiles = (
        updater: SetStateAction<PreviewFile[]>
    ) => {

        setImageFiles((prev) => {

            // ตรวจสอบว่า updater เป็น function หรือ value
            const next =
                typeof updater === "function"
                    ? (updater as (value: PreviewFile[]) => PreviewFile[])(prev)
                    : updater;

            // update ref
            imageFilesRef.current = next;

            return next;
        });
    };

    /* ======================================================
       EFFECT : โหลดประเภทข่าวและตั้งชื่อหน้า
    ====================================================== */

    useEffect(() => {

        // ตั้งชื่อหน้า
        setTitle("เพิ่มข่าวสารและกิจกรรม");

        /* ======================================================
           FUNCTION : ดึงข้อมูลประเภทข่าว
        ====================================================== */

        const fetchTypes = async () => {

            // loop endpoint สำหรับ fallback
            for (const endpoint of typeListEndpoints) {

                const response = await apiFetch(endpoint, {
                    method: "GET",
                });

                // ถ้า request ไม่สำเร็จ
                if (!response.ok) {

                    // ถ้า endpoint ไม่มีให้ข้ามไป endpoint ถัดไป
                    if (response.status === 404)
                        continue;

                    return;
                }

                // แปลง response เป็น json
                const result = await response.json();

                // ดึง raw data
                const rawTypes =
                    result?.result ??
                    result?.data?.editorialtypes ??
                    result?.data?.newstypes ??
                    [];

                // set ประเภทข่าว
                setNewsTypes(
                    Array.isArray(rawTypes)
                        ? rawTypes
                            .map(normalizeNewsType)
                            .filter((item) => item.id)
                        : []
                );

                return;
            }
        };

        // เรียกโหลดประเภทข่าว
        fetchTypes();

        /* ======================================================
           CLEANUP : ลบ URL preview รูปภาพเมื่อ component unmount
        ====================================================== */

        return () => {
            imageFilesRef.current.forEach((item) =>
                URL.revokeObjectURL(item.url)
            );
        };
    }, [setTitle]);

    /* ======================================================
       FUNCTION : ล้าง error ของ field
    ====================================================== */

    const handleFieldChange = (
        fieldName: string,
        value: unknown
    ) => {

        setError((prev) => ({
            ...prev,

            // ถ้ามีค่าให้ล้าง error
            [fieldName]:
                value
                    ? ""
                    : prev[
                    fieldName as keyof FormErrors
                    ],
        }));
    };

    /* ======================================================
       FUNCTION : เพิ่มรูปภาพเข้า state
    ====================================================== */

    const addImageFiles = (
        files: File[]
    ) => {

        // ถ้าไม่มีไฟล์ให้หยุดทำงาน
        if (!files.length)
            return;

        /* ======================================================
           ARRAY : เก็บไฟล์ที่ผ่าน validation
        ====================================================== */

        const validFiles: File[] = [];
        const existingFileKeys = new Set(
            imageFilesRef.current.map((item) =>
                getImageFileKey(item.file)
            )
        );
        const newFileKeys = new Set<string>();
        let hasDuplicateFiles = false;

        /* ======================================================
           LOOP : ตรวจสอบไฟล์แต่ละรูป
        ====================================================== */

        for (const file of files) {
            const fileKey = getImageFileKey(file);

            if (
                existingFileKeys.has(fileKey) ||
                newFileKeys.has(fileKey)
            ) {
                hasDuplicateFiles = true;
                continue;
            }

            newFileKeys.add(fileKey);

            // ตรวจสอบขนาดไฟล์
            if (
                file.size >
                MAX_IMAGE_SIZE_BYTES
            ) {

                setNotify({
                    isOpen: true,
                    message: `ไฟล์ ${file.name} มีขนาดเกิน 2 MB`,
                    type: "warning",
                });

                continue;
            }

            // ตรวจสอบนามสกุลไฟล์
            if (!isJpgFile(file)) {

                setNotify({
                    isOpen: true,
                    message: `ไฟล์ ${file.name} ไม่ใช่ JPG`,
                    type: "warning",
                });

                continue;
            }

            // เพิ่มไฟล์ที่ผ่าน validation
            validFiles.push(file);
        }

        /* ======================================================
           ตรวจสอบว่ามีไฟล์ที่ผ่าน validation หรือไม่
        ====================================================== */

        if (!validFiles.length) {
            if (hasDuplicateFiles) {
                setNotify({
                    isOpen: true,
                    message: "พบรูปข่าวและกิจกรรมซ้ำ กรุณาเลือกรูปที่ไม่ซ้ำกัน",
                    type: "warning",
                });

                return;
            }

            setError((prev) => ({
                ...prev,
                image: "รองรับเฉพาะไฟล์ภาพนามสกุล JPG เท่านั้น",
            }));

            return;
        }

        /* ======================================================
           UPDATE : เพิ่มรูปภาพเข้า state
        ====================================================== */

        updateImageFiles((prev) => {

            // จำนวนรูปที่สามารถเพิ่มได้
            const allowed =
                MAX_IMAGE_FILES - prev.length;

            // ถ้าเกินจำนวนสูงสุด
            if (allowed <= 0) {

                setNotify({
                    isOpen: true,
                    message: `สามารถอัปโหลดได้สูงสุด ${MAX_IMAGE_FILES} รูปเท่านั้น`,
                    type: "warning",
                });

                return prev;
            }

            // ตัดจำนวนรูปให้ไม่เกิน limit
            const nextFiles =
                validFiles.slice(0, allowed);

            // แจ้งเตือนถ้าจำนวนรูปเกิน
            if (
                nextFiles.length <
                validFiles.length
            ) {

                setNotify({
                    isOpen: true,
                    message: `สามารถอัปโหลดได้สูงสุด ${MAX_IMAGE_FILES} รูปเท่านั้น`,
                    type: "warning",
                });
            }

            if (hasDuplicateFiles) {
                setNotify({
                    isOpen: true,
                    message: "พบรูปข่าวและกิจกรรมซ้ำ ระบบเพิ่มเฉพาะรูปที่ไม่ซ้ำ",
                    type: "warning",
                });
            }

            /* ======================================================
               สร้าง preview URL ของรูปภาพ
            ====================================================== */

            const previews =
                nextFiles.map((file) => ({
                    file,
                    url: URL.createObjectURL(file),
                }));

            // รวมรูปเดิมกับรูปใหม่
            return [
                ...prev,
                ...previews,
            ];
        });

        /* ======================================================
           ล้าง error รูปภาพ
        ====================================================== */

        setError((prev) => ({
            ...prev,
            image: "",
        }));
    };

    /* ======================================================
       FUNCTION : ลบรูปภาพตาม index
    ====================================================== */

    const removeImageFile = (
        index: number
    ) => {

        updateImageFiles((prev) => {

            // ดึงรูปที่ต้องการลบ
            const target = prev[index];

            // ลบ object URL ออกจาก memory
            if (target)
                URL.revokeObjectURL(target.url);

            // คืนค่ารูปใหม่ที่ลบ index ออกแล้ว
            return prev.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            );
        });
    };

    /* ======================================================
       FUNCTION : ลบรูปภาพทั้งหมด
    ====================================================== */

    const removeAllImageFiles = () => {

        updateImageFiles((prev) => {

            // ลบ object URL ทุกภาพ
            prev.forEach((item) =>
                URL.revokeObjectURL(item.url)
            );

            return [];
        });

        // ล้าง error รูปภาพ
        setError((prev) => ({
            ...prev,
            image: "",
        }));
    };

    /* ======================================================
       FUNCTION : จัดเรียงรูปภาพหลัง drag & drop
    ====================================================== */

    const handleImageSortEnd = (
        event: DragEndEvent
    ) => {

        const { active, over } = event;

        // ถ้าไม่มีตำแหน่งปลายทาง หรือเป็นตำแหน่งเดิม
        if (
            !over ||
            active.id === over.id
        )
            return;

        updateImageFiles((prev) => {

            // index เดิม
            const oldIndex =
                prev.findIndex(
                    (item) =>
                        item.url === active.id
                );

            // index ใหม่
            const newIndex =
                prev.findIndex(
                    (item) =>
                        item.url === over.id
                );

            // ถ้า index ไม่ถูกต้อง
            if (
                oldIndex < 0 ||
                newIndex < 0
            )
                return prev;

            // reorder array
            return arrayMove(
                prev,
                oldIndex,
                newIndex
            );
        });
    };

    /* ======================================================
       FUNCTION : drag & drop รูปภาพ
    ====================================================== */

    const handleDrop = (
        event: DragEvent<HTMLDivElement>
    ) => {

        // ป้องกัน browser open file
        event.preventDefault();

        // เพิ่มไฟล์รูปภาพ
        addImageFiles(
            Array.from(
                event.dataTransfer.files ?? []
            )
        );
    };

    /* ======================================================
       FUNCTION : ดึงค่า HTML จาก editor
    ====================================================== */

    const getEditorValues = () => ({
        detailTH:
            detailTHRef.current
                ?.editor
                ?.getHTML() ?? detailTH,

        detailEN:
            detailENRef.current
                ?.editor
                ?.getHTML() ?? detailEN,
    });

    /* ======================================================
       FUNCTION : validate ฟอร์ม
    ====================================================== */

    const validateForm = () => {

        // ดึงค่าจาก editor
        const details =
            getEditorValues();

        /* ======================================================
           OBJECT : เก็บ error ของแต่ละ field
        ====================================================== */

        const errors: FormErrors = {

            typeId:
                !typeId
                    ? "กรุณาเลือกประเภทข่าวและกิจกรรม"
                    : "",

            titleTH:
                !titleTH.trim()
                    ? "กรุณากรอกหัวข้อข่าวภาษาไทย"
                    : "",

            titleEN:
                !titleEN.trim()
                    ? "กรุณากรอกหัวข้อข่าวภาษาอังกฤษ"
                    : "",

            detailTH:
                !stripHtml(details.detailTH)
                    ? "กรุณากรอกรายละเอียดข่าวและกิจกรรมภาษาไทย"
                    : "",

            detailEN:
                !stripHtml(details.detailEN)
                    ? "กรุณากรอกรายละเอียดข่าวและกิจกรรมภาษาอังกฤษ"
                    : "",

            image:
                imageFiles.length === 0
                    ? "กรุณาเลือกรูปข่าวและกิจกรรม"
                    : "",
        };

        // set error เข้า state
        setError(errors);

        return {

            // ตรวจสอบว่ามี error หรือไม่
            isValid:
                !Object.values(errors)
                    .some(Boolean),

            ...details,
        };
    };

    /* ======================================================
       FUNCTION : สร้าง payload สำหรับบันทึกข่าว
    ====================================================== */

    const buildPayload = (
        details: {
            detailTH: string;
            detailEN: string;
        }
    ) => {

        /* ======================================================
           เตรียมชื่อผู้ใช้งาน
        ====================================================== */

        const fullName =
            `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim() ||
            "Unknown";

        /* ======================================================
           จัดรูปแบบ spacing ของ HTML
        ====================================================== */

        const detailTHHtml =
            preserveHtmlSpacing(
                details.detailTH
            );

        const detailENHtml =
            preserveHtmlSpacing(
                details.detailEN
            );

        /* ======================================================
           FORM DATA : payload สำหรับ API
        ====================================================== */

        const formData =
            new FormData();

        // ข้อมูลประเภทและหัวข้อข่าว
        formData.append(
            "typeID",
            String(typeId ?? "")
        );

        formData.append(
            "titleTH",
            titleTH.trim()
        );

        formData.append(
            "titleEN",
            titleEN.trim()
        );

        // รายละเอียดข่าว
        formData.append(
            "detailTH",
            detailTHHtml
        );

        formData.append(
            "detailEN",
            detailENHtml
        );

        formData.append(
            "contentTH",
            detailTHHtml
        );

        formData.append(
            "contentEN",
            detailENHtml
        );

        formData.append(
            "descriptionTH",
            detailTHHtml
        );

        formData.append(
            "descriptionEN",
            detailENHtml
        );

        // สถานะข่าว
        formData.append("active", "2");
        formData.append("pin", "0");

        // ข้อมูลผู้สร้าง
        formData.append(
            "createname",
            fullName
        );

        formData.append(
            "savename",
            fullName
        );

        // path รูป gallery
        // รูปหลักสำหรับ ControllerEditoria.php
        imageFiles.forEach(({ file }) => {
            formData.append(
                "gallary[]",
                file
            );
        });

        return formData;
    };

    /* ======================================================
       FUNCTION : สร้าง payload upload gallery
    ====================================================== */

    const buildGalleryPayload = () => {

        const formData =
            new FormData();

        // ข้อมูล module
        formData.append(
            "module",
            "editoria"
        );

        formData.append(
            "type",
            "editoria"
        );

        formData.append(
            "namepage",
            "ข่าวและกิจกรรม"
        );

        formData.append(
            "page",
            "ข่าวและกิจกรรม"
        );

        // เพิ่มรูปภาพลง payload
        imageFiles.forEach(({ file }) => {
            formData.append(
                "gallery[]",
                file
            );
        });

        return formData;
    };

    /* ======================================================
       FUNCTION : ดึง path รูปจาก API response
    ====================================================== */

    const getUploadedGalleryPaths = (
        result: any
    ) => {

        const paths =
            result?.pathj ??
            result?.paths ??
            result?.data?.pathj ??
            result?.data?.paths ??
            [];

        return Array.isArray(paths)
            ? paths.filter(
                (path) =>
                    typeof path === "string"
            )
            : [];
    };

    /* ======================================================
       FUNCTION : upload รูป gallery
    ====================================================== */

    const uploadGalleryImages = async () => {

        const response =
            await apiFetch(
                createGalleryEndpoint,
                {
                    method: "POST",
                    body: buildGalleryPayload(),
                }
            );

        // response json
        const result =
            await response
                .json()
                .catch(() => ({}));

        // path รูปภาพ
        const paths =
            getUploadedGalleryPaths(result);

        // ถ้า upload ไม่สำเร็จ
        if (
            !response.ok ||
            paths.length === 0
        ) {

            throw new Error(
                getNewsErrorMessage(
                    result?.message ||
                    result?.error ||
                    `Upload gallery failed (${response.status})`
                )
            );
        }

        return paths;
    };


    /* ======================================================
       FUNCTION : submit ฟอร์มบันทึกข่าว
    ====================================================== */

    const handleSubmit = () => {

        /* ======================================================
           VALIDATE : ตรวจสอบข้อมูลฟอร์ม
        ====================================================== */

        const validation = validateForm();

        // ถ้า validation ไม่ผ่านให้หยุดทำงาน
        if (!validation.isValid)
            return;

        /* ======================================================
           OPEN : Confirm Dialog
        ====================================================== */

        setConfirmDialog({
            isOpen: true,
            isLoading: false,

            /* ======================================================
               CONFIRM : เมื่อกดยืนยันบันทึกข้อมูล
            ====================================================== */

            onConfirm: async () => {

                // เปิด loading
                setConfirmDialog((prev) => ({
                    ...prev,
                    isLoading: true,
                }));

                try {

                    /* ======================================================
                       UPLOAD : อัปโหลดรูปภาพ gallery
                    ====================================================== */

                    /* ======================================================
                       API : บันทึกข้อมูลข่าว
                    ====================================================== */

                    const response =
                        await apiFetch(
                            createEndpoint,
                            {
                                method: "POST",

                                body: buildPayload(
                                    validation
                                ),
                            }
                        );

                    // แปลง response เป็น json
                    const result =
                        await response
                            .json()
                            .catch(() => ({}));

                    // ถ้าบันทึกไม่สำเร็จ
                    if (!response.ok) {

                        throw new Error(
                            getNewsErrorMessage(
                                result?.message ||
                                result?.error ||
                                `บันทึกข้อมูลไม่สำเร็จ (${response.status})`
                            )
                        );
                    }

                    try {
                        await uploadGalleryImages();
                    } catch (galleryError) {
                        console.warn("Gallery upload warning:", galleryError);
                    }

                    /* ======================================================
                       NAVIGATE : กลับไปหน้าข่าวและกิจกรรม
                    ====================================================== */

                    navigate("/News_Activity", {
                        state: {

                            // notification หลังบันทึกสำเร็จ
                            notify: {
                                message: "บันทึกข้อมูลสำเร็จ",
                                type: "success",
                            },
                        },
                    });

                } catch (error) {

                    /* ======================================================
                       ERROR : แจ้งเตือนเมื่อเกิดข้อผิดพลาด
                    ====================================================== */

                    setNotify({
                        isOpen: true,

                        message:
                            error instanceof Error
                                ? getNewsErrorMessage(error.message)
                                : "เกิดข้อผิดพลาดในการบันทึกข้อมูล",

                        type: "error",
                    });

                } finally {

                    /* ======================================================
                       RESET : ปิด confirm dialog และ loading
                    ====================================================== */

                    setConfirmDialog({
                        isOpen: false,
                        isLoading: false,
                        onConfirm: () => { },
                    });
                }
            },
        });
    };


    /* ======================================================
       FUNCTION : Render ส่วนอัปโหลดรูปภาพ
    ====================================================== */

    const renderImageUpload = () => (
        <Box

            // ป้องกัน browser เปิดไฟล์เมื่อ drag over
            onDragOver={(event) =>
                event.preventDefault()
            }

            // drop รูปภาพ
            onDrop={handleDrop}

            // กดเพื่อเปิด file input
            onClick={() =>
                fileInputRef.current?.click()
            }

            sx={{

                // เปลี่ยนสี border เมื่อ error
                border: `1px dashed ${error.image ? theme.palette.error.main : theme.palette.grey[400]}`,

                borderRadius: 2,

                p: 3,

                minHeight: 300,

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                textAlign: "center",

                cursor: "pointer",

                backgroundColor: "#fff",
            }}
        >

            {/* ======================================================
               INPUT : เลือกรูปภาพ
            ====================================================== */}

            <input
                ref={fileInputRef}

                hidden

                type="file"

                accept=".jpg,.jpeg,image/jpeg"

                multiple

                onChange={(event) => {

                    // เพิ่มรูปภาพเข้า state
                    addImageFiles(
                        Array.from(
                            event.target.files ?? []
                        )
                    );

                    // reset input file
                    event.target.value = "";
                }}
            />

            {/* ======================================================
               CONDITION : มีรูปภาพหรือไม่
            ====================================================== */}

            {imageFiles.length > 0 ? (

                /* ======================================================
                   SECTION : แสดงรายการรูปภาพ
                ====================================================== */

                <Box sx={{ width: "100%" }}>

                    {/* ======================================================
                       DND CONTEXT : ระบบ drag & drop
                    ====================================================== */}

                    <DndContext
                        sensors={sensors}

                        collisionDetection={closestCenter}

                        onDragEnd={handleImageSortEnd}
                    >

                        {/* ======================================================
                           SORTABLE CONTEXT : เรียงลำดับรูปภาพ
                        ====================================================== */}

                        <SortableContext
                            items={imageFiles.map(
                                (item) => item.url
                            )}

                            strategy={rectSortingStrategy}
                        >

                            {/* ======================================================
                               GRID : แสดงรูปภาพแบบ grid
                            ====================================================== */}

                            <Box

                                // ป้องกัน click trigger input
                                onClick={(event) =>
                                    event.stopPropagation()
                                }

                                sx={{

                                    display: "grid",

                                    gridTemplateColumns: {
                                        xs: "repeat(2, minmax(0, 1fr))",
                                        sm: "repeat(3, minmax(0, 1fr))",
                                        md: "repeat(5, minmax(0, 1fr))",
                                    },

                                    gap: 2,
                                }}
                            >

                                {/* ======================================================
                                   LOOP : แสดงรูปภาพแต่ละรายการ
                                ====================================================== */}

                                {imageFiles.map((item, index) => (

                                    <SortableImageItem
                                        key={item.url}

                                        item={item}

                                        index={index}

                                        onRemove={removeImageFile}
                                    />
                                ))}
                            </Box>
                        </SortableContext>
                    </DndContext>

                    {/* ======================================================
                       ACTION BUTTON : ปุ่มจัดการรูปภาพ
                    ====================================================== */}

                    <Stack
                        direction="row"

                        justifyContent="flex-end"

                        alignItems="center"

                        spacing={2}

                        sx={{ mt: 2 }}

                        // ป้องกัน click trigger input upload
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* ======================================================
                           BUTTON : ลบรูปภาพทั้งหมด
                        ====================================================== */}

                        <Button
                            variant="outlined"

                            onClick={removeAllImageFiles}

                            sx={{
                                borderRadius: 1.5,
                                textTransform: "none",
                                color: "#2563eb",
                                borderColor: "#93c5fd",
                                backgroundColor: "#eff6ff",

                                "&:hover": {
                                    borderColor: "#60a5fa",
                                    backgroundColor: "#dbeafe",
                                },
                            }}
                        >
                            Remove all
                        </Button>

                        {/* ======================================================
                           BUTTON : เพิ่มรูปภาพ
                        ====================================================== */}

                        <Button
                            variant="contained"

                            startIcon={<CloudUploadIcon />}

                            // เปิด file input
                            onClick={() =>
                                fileInputRef.current?.click()
                            }

                            sx={{
                                borderRadius: 1.5,

                                textTransform: "none",

                                color:
                                    theme.palette.mode === "dark"
                                        ? "black"
                                        : "white",

                                backgroundColor:
                                    theme.palette.mode === "dark"
                                        ? "white"
                                        : "black",

                                "&:hover": {
                                    backgroundColor:
                                        theme.palette.mode === "dark"
                                            ? theme.palette.grey[200]
                                            : theme.palette.grey[900],
                                },
                            }}
                        >
                            Upload
                        </Button>
                    </Stack>

                    {/* ======================================================
                       TEXT : จำนวนรูปภาพที่เลือก
                    ====================================================== */}

                    <Typography
                        variant="body2"

                        color="text.secondary"

                        sx={{ mt: 2 }}
                    >

                        {/* แสดงจำนวนรูปที่เลือก */}
                        เลือกแล้ว {imageFiles.length}/{MAX_IMAGE_FILES} รูป
                    </Typography>
                </Box>
            ) : (

                /* ======================================================
                   EMPTY STATE : ยังไม่มีรูปภาพ
                ====================================================== */

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        gap: 1,
                    }}
                >

                    {/* ======================================================
                       IMAGE : รูป placeholder upload
                    ====================================================== */}

                    <Box
                        component="img"

                        src={PanoramaUpload}

                        alt="Upload"

                        sx={{
                            width: 170,
                            height: 130,
                            objectFit: "contain",
                        }}
                    />

                    {/* ======================================================
                       TEXT : ข้อความแนะนำการอัปโหลด
                    ====================================================== */}

                    <Typography fontWeight={600}>
                        เลือกไฟล์หรือลากและวางก็ได้
                    </Typography>

                    {/* ======================================================
                       TEXT : รายละเอียดเงื่อนไขการอัปโหลด
                    ====================================================== */}

                    <Typography
                        variant="body2"

                        color="text.secondary"

                        sx={{
                            maxWidth: 760,
                            lineHeight: 1.6,
                        }}
                    >

                        {/* ข้อกำหนดการอัปโหลด */}
                        รองรับเฉพาะไฟล์ภาพนามสกุล JPG เท่านั้น ขนาดไม่เกิน 2 MB ต่อรูป อัปโหลดได้สูงสุด {MAX_IMAGE_FILES} รูป หรือคลิก{" "}

                        {/* ======================================================
                           TEXT LINK : เลือกไฟล์
                        ====================================================== */}

                        <Box
                            component="span"

                            sx={{
                                color: theme.palette.secondary.main,
                                textDecoration: "underline",
                                textUnderlineOffset: 3,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            เลือกไฟล์
                        </Box>{" "}

                        {/* ข้อความปิดท้าย */}
                        จากเครื่องของคุณ
                    </Typography>
                </Box>
            )}
        </Box>
    );
    return (

        /* ======================================================
           CONTAINER : ฟอร์มเพิ่มข่าวและกิจกรรม
        ====================================================== */

        <Container maxWidth="xl">

            {/* ======================================================
               CARD : กล่องฟอร์มหลัก
            ====================================================== */}

            <ComponentsFormCard
                title="ฟอร์มการบันทึกข่าวสารและกิจกรรม"
            >

                {/* ======================================================
                   SECTION : ประเภทข่าวสารและกิจกรรม
                ====================================================== */}

                <ComponentsFormSection
                    title="ประเภทข่าวสารและกิจกรรม"

                    open={typeBlockOpen}

                    onToggle={() =>
                        setTypeBlockOpen(
                            (prev) => !prev
                        )
                    }
                >

                    {/* ======================================================
                       DROPDOWN : เลือกประเภทข่าว
                    ====================================================== */}

                    <BasicDropDownseletedata
                        titlename="เลือกประเภทข่าวสารและกิจกรรม"
                        placeholder="กรุณาเลือกประเภทข่าวสารและกิจกรรม"
                        selecte={typeId}
                        setSelected={setTypeId}
                        topon={0}
                        handleFieldChange={handleFieldChange}
                        error={error.typeId}
                        fieldKey="typeId"
                        specify
                        showPlaceholderOption={false}
                        // map option จาก newsTypes
                        statusOptions={newsTypes.map((item) => ({
                            id: item.id,
                            valuename: String(item.id),
                            labelname: item.nameTH,
                        }))}
                    />
                </ComponentsFormSection>

                {/* ======================================================
                   SECTION : รายละเอียดข่าวสารและกิจกรรม
                ====================================================== */}

                <ComponentsFormSection
                    title="รายละเอียดข้อมูลข่าวสารและกิจกรรม"

                    open={detailBlockOpen}

                    onToggle={() =>
                        setDetailBlockOpen(
                            (prev) => !prev
                        )
                    }
                >

                    {/* ======================================================
                       GRID FORM : จัด layout ฟอร์ม
                    ====================================================== */}

                    <Grid
                        container
                        spacing={4}
                    >

                        {/* ======================================================
                           INPUT : หัวข้อข่าวภาษาไทย
                        ====================================================== */}

                        <Grid size={{ xs: 12, md: 6 }}>

                            <BasicTextField
                                name="หัวข้อข่าวภาษาไทย"
                                titlename="กรุณากรอกหัวข้อข่าวภาษาไทย"
                                subject={titleTH}
                                setsubject={setTitleTH}
                                topon={0}
                                handleFieldChange={handleFieldChange}
                                error={error.titleTH}
                                fieldKey="titleTH"
                                specify
                            />
                        </Grid>

                        {/* ======================================================
                           INPUT : หัวข้อข่าวภาษาอังกฤษ
                        ====================================================== */}

                        <Grid size={{ xs: 12, md: 6 }}>

                            <BasicTextField
                                name="หัวข้อข่าวภาษาอังกฤษ"
                                titlename="กรุณากรอกหัวข้อข่าวภาษาอังกฤษ"
                                subject={titleEN}
                                setsubject={setTitleEN}
                                topon={0}
                                handleFieldChange={handleFieldChange}
                                error={error.titleEN}
                                fieldKey="titleEN"
                                specify
                            />
                        </Grid>

                        {/* ======================================================
                           EDITOR : รายละเอียดข่าวและกิจกรรมภาษาไทย
                        ====================================================== */}

                        <Grid size={{ xs: 12 }}>
                            <ComponentsNewsRichTextField
                                ref={detailTHRef}
                                label="รายละเอียดข่าวและกิจกรรมภาษาไทย"
                                error={error.detailTH}
                                extensions={editorExtensionsTH}
                                content=""
                                renderControls={editorControls}
                                onChange={(html) => {
                                    setDetailTH(html);
                                    setError((prev) => ({ ...prev, detailTH: "" }));
                                }}
                            />
                        </Grid>

                        {/* ======================================================
                           EDITOR : รายละเอียดข่าวและกิจกรรมภาษาอังกฤษ
                        ====================================================== */}

                        <Grid size={{ xs: 12 }}>
                            <ComponentsNewsRichTextField
                                ref={detailENRef}
                                label="รายละเอียดข่าวและกิจกรรมภาษาอังกฤษ"
                                error={error.detailEN}
                                extensions={editorExtensionsEN}
                                content=""
                                renderControls={editorControls}
                                onChange={(html) => {
                                    setDetailEN(html);
                                    setError((prev) => ({ ...prev, detailEN: "" }));
                                }}
                            />
                        </Grid>
                    </Grid>
                </ComponentsFormSection>

                {/* ======================================================
                   SECTION : ส่วนรูปข่าวและกิจกรรม
                ====================================================== */}

                <ComponentsFormSection
                    title="รูปข่าวและกิจกรรม"
                    open={imageBlockOpen}
                    onToggle={() => setImageBlockOpen((prev) => !prev)}
                    iconType="image"
                    noMargin
                >

                    {/* ======================================================
                       RENDER : แสดงส่วนอัปโหลดรูปภาพ
                    ====================================================== */}

                    {renderImageUpload()}

                    {/* ======================================================
                       ERROR : ข้อความแจ้งเตือนรูปภาพ
                    ====================================================== */}

                    {error.image && (
                        <Typography
                            color="error"
                            variant="caption"
                            sx={{ mt: 0.75, display: "block" }}
                        >
                            {error.image}
                        </Typography>
                    )}

                    {/* ======================================================
                       BUTTON : ปุ่มบันทึกข้อมูล
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
                                backgroundColor: theme.palette.secondary.main,
                            }}
                        >
                            บันทึกข้อมูล
                        </TextButton>
                    </Box>
                </ComponentsFormSection>
            </ComponentsFormCard>

            {/* ======================================================
               POPUP : กล่องยืนยันการทำรายการ
            ====================================================== */}

            <ConfirmDialog
                type="add"
                confirmDialog={confirmDialog}
                setConfirmDialog={setConfirmDialog}
            />

            {/* ======================================================
               POPUP : กล่องแจ้งเตือนข้อความ
            ====================================================== */}

            <Notifications
                notify={notify}
                setNotify={setNotify}
            />
        </Container>
    );
};

export default ComponentsNewsAddForm;
