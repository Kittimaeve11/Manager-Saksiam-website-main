"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, SetStateAction } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Grid,
    Paper,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
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
import { useNavigate, useParams } from "react-router-dom";
import Placeholder from "@tiptap/extension-placeholder";

import { apiFetch } from "../../API/client";
import { useAuth } from "../../Context/AuthContext";
import { usePageTitle } from "../../Context/PageTitleContext";
import BasicTextField from "../../components/Model/TextField/BasicTextField";
import CategorySelectField from "../../components/Model/Dropdown/CategorySelectField";
import TextButton from "../../components/Buttom/TextButton";
import ConfirmDialog from "../../components/Model/Pop_up/ConfirmDialog";
import Notifications from "../../components/Model/Pop_up/Notifications";
import PanoramaUpload from "../../assets/Image/picture_14204933.gif";
import { parseGallery } from "../../utils/Format/format-JSON";
import ComponentsFormSection from "../../components/Form/ComponentsFormSection";
import ComponentsNewsRichTextField from "../../components/View/News/ComponentsNewsRichTextField";
import ImageRemoveButton from "../../components/Buttom/ImageRemoveButton";

type NotifyType = "success" | "error" | "warning" | "info";

type NewsTypeOption = {
    id: number;
    nameTH: string;
    nameEN: string;
    active: string | number;
};

type FormErrors = {
    typeId?: string;
    titleTH?: string;
    titleEN?: string;
    detailTH?: string;
    detailEN?: string;
    image?: string;
};

const editorExtensionsTH = [
    StarterKit,
    Placeholder.configure({
        placeholder: "กรุณากรอกรายละเอียดข่าวและกิจกรรมภาษาไทย",
    }),
];

const editorExtensionsEN = [
    StarterKit,
    Placeholder.configure({
        placeholder: "กรุณากรอกรายละเอียดข่าวและกิจกรรมภาษาอังกฤษ",
    }),
];

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

const typeListEndpoints = [
    "/api/auther/showEditorialTypelistAPI",
    "/api/auther/showEditorialTypeAPI",
    "/api/auther/showEditorialTypeDataAPI",
    "/api/auther/showNewsTypelistAPI",
];

const detailEndpoints = [
    "/api/auther/showEditorialIDAPI",
    "/api/auther/showNewsIDAPI",
    "/api/auther/showNewsActivityIDAPI",
];

const newsListEndpoints = [
    "/api/auther/showEditorialAPI",
    "/api/auther/showEditorialDataAPI",
    "/api/auther/showNewsAPI",
    "/api/auther/showNewsDataAPI",
];

const updateEndpoints = [
    "/api/auther/updateEditorialAPI",
    "/api/auther/updateNewsAPI",
    "/api/auther/updateNewsActivityAPI",
];
const createGalleryEndpoint = "/api/auther/createGalleryAPI";
const PHOTO_BASE =
    import.meta.env.VITE_BASE_URL_API_PHOTO || import.meta.env.VITE_BASE_URL_API || "";

const stripHtml = (html: string) =>
    html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, "")
        .trim();

const normalizeCompareValue = (value: unknown) => String(value ?? "").trim();

const buildNewsSnapshot = (value: {
    typeId: number | null;
    titleTH: string;
    titleEN: string;
    detailTH: string;
    detailEN: string;
    galleryPaths: string[];
}) =>
    JSON.stringify({
        typeId: normalizeCompareValue(value.typeId),
        titleTH: normalizeCompareValue(value.titleTH),
        titleEN: normalizeCompareValue(value.titleEN),
        detailTH: normalizeCompareValue(preserveHtmlSpacing(value.detailTH)),
        detailEN: normalizeCompareValue(preserveHtmlSpacing(value.detailEN)),
        galleryPaths: value.galleryPaths.map(normalizeCompareValue),
    });

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

const preserveHtmlSpacing = (html: string) =>
    html
        .split(/(<[^>]+>)/g)
        .map((part) => {
            if (part.startsWith("<") && part.endsWith(">")) return part;
            return part.replace(/ {2,}/g, (spaces) => "&nbsp;".repeat(spaces.length));
        })
        .join("");

const getImageFileKey = (file: File) =>
    `${file.name.trim().toLowerCase()}-${file.size}-${file.lastModified}`;

const getNewsErrorMessage = (message?: string) => {
    const text = message?.trim();

    if (!text) return "บันทึกข้อมูลข่าวและกิจกรรมไม่สำเร็จ";

    const lowerText = text.toLowerCase();

    if (
        lowerText.includes("news/activity image") &&
        lowerText.includes("already exists")
    ) {
        return "รูปข่าวและกิจกรรมนี้มีอยู่ในระบบแล้ว";
    }

    if (lowerText.includes("image") && lowerText.includes("already exists")) {
        return "รูปข่าวและกิจกรรมนี้มีอยู่ในระบบแล้ว";
    }

    if (lowerText.includes("at least one image is required")) {
        return "กรุณาเลือกรูปข่าวและกิจกรรมอย่างน้อย 1 รูป";
    }

    return text;
};

const normalizeEditorContent = (value: string) => {
    if (!value) return "";

    const html = /<[a-z][\s\S]*>/i.test(value)
        ? value
        : value
            .split(/\n{2,}/)
            .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
            .join("");

    return preserveHtmlSpacing(html);
};

const normalizeNewsType = (item: any): NewsTypeOption => ({
    id: Number(
        item.editorialtypeID ??
        item.editorialTypeID ??
        item.newstypeID ??
        item.newsTypeID ??
        item.int_saksiam_typeeditorial_id ??
        item.int_saksiam_typenews_id ??
        0
    ),
    nameTH:
        item.editorialtypenameTH ??
        item.editorialTypeNameTH ??
        item.newstypenameTH ??
        item.newsTypeNameTH ??
        item.int_saksiam_typeeditorial_nameTH ??
        item.int_saksiam_typenews_nameTH ??
        "",
    nameEN:
        item.editorialtypenameEN ??
        item.editorialTypeNameEN ??
        item.newstypenameEN ??
        item.newsTypeNameEN ??
        item.int_saksiam_typeeditorial_nameEN ??
        item.int_saksiam_typenews_nameEN ??
        "",
    active:
        item.editorialtypeactive ??
        item.editorialTypeActive ??
        item.newstypeactive ??
        item.newsTypeActive ??
        item.int_saksiam_typeeditorial_active ??
        item.int_saksiam_typenews_active ??
        1,
});

const isJpgFile = (file: File) =>
    file.type === "image/jpeg" || /\.(jpe?g)$/i.test(file.name);

const MAX_IMAGE_FILES = 15;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

type ImageItem = {
    id: string;
    url: string;
    name: string;
    file?: File;
    path?: string;
};

type SortableImageItemProps = {
    item: ImageItem;
    index: number;
    onRemove: (index: number) => void;
};

const SortableImageItem = ({ item, index, onRemove }: SortableImageItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    return (
        <Box
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            sx={{
                position: "relative",
                opacity: isDragging ? 0.7 : 1,
                transform: CSS.Transform.toString(transform),
                transition,
                cursor: "grab",
                touchAction: "none",
                zIndex: isDragging ? 2 : 1,
            }}
        >
            <Box
                component="img"
                src={item.url}
                alt={item.name}
                sx={{
                    width: "100%",
                    height: 120,
                    borderRadius: 1.5,
                    objectFit: "cover",
                    border: "1px solid",
                    borderColor: "grey.300",
                }}
            />
            <ImageRemoveButton onRemove={() => onRemove(index)} />
            <Typography
                variant="caption"
                noWrap
                title={item.name}
                sx={{ display: "block", mt: 0.5 }}
            >
                {item.name}
            </Typography>
        </Box>
    );
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

const getNewsCode = (item: any) =>
    String(
        item.code ??
        item.editoriaNum ??
        item.editoria_num ??
        item.editorialNum ??
        item.editorialnum ??
        item.newsNum ??
        item.int_saksiam_editoria_num ??
        item.int_saksiam_editorial_num ??
        ""
    );

const getNewsId = (item: any) =>
    Number(
        item.id ??
        item.editorialID ??
        item.editoriaID ??
        item.newsID ??
        item.int_saksiam_editoria_id ??
        item.int_saksiam_editorial_id ??
        item.int_saksiam_news_id ??
        0
    );

const getNewsList = (result: any) => {
    const data = result?.data ?? result;
    const rawNews =
        data?.editorias ??
        data?.editorials ??
        data?.editorial ??
        data?.articles ??
        data?.news ??
        data?.items ??
        result?.result ??
        [];

    return Array.isArray(rawNews) ? rawNews : [];
};

const resolveNewsId = async (code: string) => {
    if (/^\d+$/.test(code)) return code;

    const query = new URLSearchParams({
        typeID: "",
        status: "",
        active: "",
        startDate: "",
        endDate: "",
        postStartDate: "",
        postEndDate: "",
        createStartDate: "",
        createEndDate: "",
        offset: "0",
        limit: "999",
    }).toString();

    for (const endpoint of newsListEndpoints) {
        const response = await apiFetch(`${endpoint}?${query}`, { method: "GET" });
        if (!response.ok) {
            if (response.status === 404) continue;
            break;
        }

        const result = await response.json();
        const found = getNewsList(result).find((item) => getNewsCode(item) === code);
        const foundId = found ? getNewsId(found) : 0;

        if (foundId) return String(foundId);
    }

    throw new Error("ไม่พบข้อมูลข่าวสารและกิจกรรมตามรหัสบทความนี้");
};

const buildPhotoUrl = (path: string) => {
    if (/^(https?:|data:|blob:)/i.test(path)) return path;

    const base = String(PHOTO_BASE).replace(/\/+$/, "");
    const cleanPath = path.replace(/^\/+/, "");

    return `${base}/${cleanPath}`;
};

const NewsEditpage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const { setTitle } = usePageTitle();
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        })
    );
    const detailTHRef = useRef<RichTextEditorRef>(null);
    const detailENRef = useRef<RichTextEditorRef>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageItemsRef = useRef<ImageItem[]>([]);

    const [loading, setLoading] = useState(true);
    const [typeBlockOpen, setTypeBlockOpen] = useState(true);
    const [detailBlockOpen, setDetailBlockOpen] = useState(true);
    const [imageBlockOpen, setImageBlockOpen] = useState(true);
    const [newsTypes, setNewsTypes] = useState<NewsTypeOption[]>([]);
    const [typeId, setTypeId] = useState<number | null>(null);
    const [titleTH, setTitleTH] = useState("");
    const [titleEN, setTitleEN] = useState("");
    const [detailTH, setDetailTH] = useState("");
    const [detailEN, setDetailEN] = useState("");
    const [imageItems, setImageItems] = useState<ImageItem[]>([]);
    const [editorialId, setEditorialId] = useState<string>("");
    const [initialSnapshot, setInitialSnapshot] = useState("");
    const [error, setError] = useState<FormErrors>({});

    const [notify, setNotify] = useState({
        isOpen: false,
        message: "",
        type: "success" as NotifyType,
    });

    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        isLoading: false,
        onConfirm: () => { },
    });

    const updateImageItems = (updater: SetStateAction<ImageItem[]>) => {
        setImageItems((prev) => {
            const next =
                typeof updater === "function"
                    ? (updater as (value: ImageItem[]) => ImageItem[])(prev)
                    : updater;
            imageItemsRef.current = next;
            return next;
        });
    };

    useEffect(() => {
        setTitle("แก้ไขข่าวสารและกิจกรรม");

        const fetchData = async () => {
            if (!id) {
        navigate("/News_Activity");
                return;
            }

            try {
                setLoading(true);

                for (const endpoint of typeListEndpoints) {
                    const typeResponse = await apiFetch(endpoint, { method: "GET" });
                    if (!typeResponse.ok) {
                        if (typeResponse.status === 404) continue;
                        break;
                    }

                    const typeResult = await typeResponse.json();
                    const rawTypes =
                        typeResult?.result ??
                        typeResult?.data?.editorialtypes ??
                        typeResult?.data?.newstypes ??
                        [];
                    setNewsTypes(
                        Array.isArray(rawTypes)
                            ? rawTypes.map(normalizeNewsType).filter((item) => item.id)
                            : []
                    );
                    break;
                }

                const detailId = await resolveNewsId(id);
                let detailResponse: Response | null = null;
                for (const endpoint of detailEndpoints) {
                    detailResponse = await apiFetch(`${endpoint}/${detailId}`, { method: "GET" });
                    if (detailResponse.ok || detailResponse.status !== 404) break;
                }

                if (!detailResponse?.ok) {
                    throw new Error("ไม่พบข้อมูลข่าวสารและกิจกรรมที่ต้องการแก้ไข");
                }

                const detailResult = await detailResponse.json();
                const data = detailResult?.data ?? detailResult;
                const realEditorialId =
                    data.id ??
                    data.editorialID ??
                    data.editoriaID ??
                    data.newsID ??
                    data.int_saksiam_editoria_id ??
                    data.int_saksiam_editorial_id ??
                    data.int_saksiam_news_id ??
                    "";

                setEditorialId(String(realEditorialId || detailId));

                const nextTypeId =
                    Number(
                        data.typeID ??
                        data.editorialtypeID ??
                        data.newsTypeID ??
                        data.type ??
                        data.int_saksiam_editorial_type ??
                        data.int_saksiam_news_type ??
                        0
                    ) || null;
                const nextTitleTH =
                    data.titleTH ??
                    data.editorialtitleTH ??
                    data.newsTitleTH ??
                    data.int_saksiam_editorial_titleTH ??
                    data.int_saksiam_news_titleTH ??
                    "";
                const nextTitleEN =
                    data.titleEN ??
                    data.editorialtitleEN ??
                    data.newsTitleEN ??
                    data.int_saksiam_editorial_titleEN ??
                    data.int_saksiam_news_titleEN ??
                    "";
                const nextDetailTH =
                    normalizeEditorContent(
                        data.detailTH ??
                        data.contentTH ??
                        data.descriptionTH ??
                        data.editorialdetailTH ??
                        data.int_saksiam_editorial_detailTH ??
                        data.int_saksiam_news_detailTH ??
                        ""
                    );
                const nextDetailEN =
                    normalizeEditorContent(
                        data.detailEN ??
                        data.contentEN ??
                        data.descriptionEN ??
                        data.editorialdetailEN ??
                        data.int_saksiam_editorial_detailEN ??
                        data.int_saksiam_news_detailEN ??
                        ""
                    );

                setTypeId(nextTypeId);
                setTitleTH(nextTitleTH);
                setTitleEN(nextTitleEN);
                setDetailTH(nextDetailTH);
                setDetailEN(nextDetailEN);
                const singleImage =
                    data.imageURL ??
                    data.image ??
                    data.editorialimage ??
                    data.newsimage ??
                    data.int_saksiam_editorial_image ??
                    data.int_saksiam_editoria_image ??
                    "";
                const galleryCandidates = [
                    normalizeGallery(data.galleryList),
                    normalizeGallery(data.gallaryList),
                    normalizeGallery(data.gallery),
                    normalizeGallery(data.gallary),
                    normalizeGallery(data.editoriagallery),
                    normalizeGallery(data.editoria_gallery),
                    normalizeGallery(data.editoria_gallary),
                    normalizeGallery(data.int_saksiam_editoria_gallary),
                    normalizeGallery(data.int_saksiam_editorial_gallary),
                    normalizeGallery(singleImage),
                ];
                const galleryImages = galleryCandidates.find((items) => items.length > 0) ?? [];

                updateImageItems(
                    galleryImages.map((path, index) => ({
                        id: `existing-${index}-${path}`,
                        path,
                        url: buildPhotoUrl(path),
                        name: path.split("/").pop() || `รูปเดิม ${index + 1}`,
                    }))
                );
                setInitialSnapshot(
                    buildNewsSnapshot({
                        typeId: nextTypeId,
                        titleTH: nextTitleTH,
                        titleEN: nextTitleEN,
                        detailTH: nextDetailTH,
                        detailEN: nextDetailEN,
                        galleryPaths: galleryImages,
                    })
                );
            } catch (error) {
                setNotify({
                    isOpen: true,
                    message:
                        error instanceof Error
                            ? error.message
                            : "โหลดข้อมูลข่าวสารและกิจกรรมไม่สำเร็จ",
                    type: "error",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            imageItemsRef.current.forEach((item) => {
                if (item.url.startsWith("blob:")) URL.revokeObjectURL(item.url);
            });
        };
    }, [id, navigate, setTitle]);

    const handleFieldChange = (fieldName: string, value: unknown) => {
        setError((prev) => ({
            ...prev,
            [fieldName]: value ? "" : prev[fieldName as keyof FormErrors],
        }));
    };

    const handleTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value);
        setTypeId(value || null);
        handleFieldChange("typeId", value);
    };

    const addImageFiles = (files: File[]) => {
        if (!files.length) return;

        const validFiles: File[] = [];
        const existingFileKeys = new Set(
            imageItemsRef.current
                .filter((item) => item.file)
                .map((item) => getImageFileKey(item.file as File))
        );
        const newFileKeys = new Set<string>();
        let hasDuplicateFiles = false;

        for (const file of files) {
            const fileKey = getImageFileKey(file);

            if (existingFileKeys.has(fileKey) || newFileKeys.has(fileKey)) {
                hasDuplicateFiles = true;
                continue;
            }

            newFileKeys.add(fileKey);

            if (file.size > MAX_IMAGE_SIZE_BYTES) {
                setNotify({
                    isOpen: true,
                    message: `ไฟล์ ${file.name} มีขนาดเกิน 2 MB`,
                    type: "warning",
                });
                continue;
            }

            if (!isJpgFile(file)) {
                setNotify({
                    isOpen: true,
                    message: `ไฟล์ ${file.name} ไม่ใช่ JPG`,
                    type: "warning",
                });
                continue;
            }

            validFiles.push(file);
        }

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

        updateImageItems((prev) => {
            const allowed = MAX_IMAGE_FILES - prev.length;

            if (allowed <= 0) {
                setNotify({
                    isOpen: true,
                    message: `สามารถอัปโหลดได้สูงสุด ${MAX_IMAGE_FILES} รูปเท่านั้น`,
                    type: "warning",
                });
                return prev;
            }

            const nextFiles = validFiles.slice(0, allowed);
            if (nextFiles.length < validFiles.length) {
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

            const previews = nextFiles.map((file) => ({
                id: `new-${crypto.randomUUID()}-${file.name}`,
                file,
                url: URL.createObjectURL(file),
                name: file.name,
            }));

            return [...prev, ...previews];
        });

        setError((prev) => ({ ...prev, image: "" }));
    };

    const removeImageFile = (index: number) => {
        updateImageItems((prev) => {
            const target = prev[index];
            if (target?.url.startsWith("blob:")) URL.revokeObjectURL(target.url);
            return prev.filter((_, itemIndex) => itemIndex !== index);
        });
    };

    const removeAllImageFiles = () => {
        updateImageItems((prev) => {
            prev.forEach((item) => {
                if (item.url.startsWith("blob:")) URL.revokeObjectURL(item.url);
            });
            return [];
        });
        setError((prev) => ({ ...prev, image: "" }));
    };

    const handleImageSortEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        updateImageItems((prev) => {
            const oldIndex = prev.findIndex((item) => item.id === active.id);
            const newIndex = prev.findIndex((item) => item.id === over.id);

            if (oldIndex < 0 || newIndex < 0) return prev;
            return arrayMove(prev, oldIndex, newIndex);
        });
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        addImageFiles(Array.from(event.dataTransfer.files ?? []));
    };

    const getEditorValues = () => ({
        detailTH: detailTHRef.current?.editor?.getHTML() ?? detailTH,
        detailEN: detailENRef.current?.editor?.getHTML() ?? detailEN,
    });

    const validateForm = () => {
        const details = getEditorValues();
        const errors: FormErrors = {
            typeId: !typeId ? "กรุณาเลือกประเภทข่าวและกิจกรรม" : "",
            titleTH: !titleTH.trim() ? "กรุณากรอกหัวข้อข่าวภาษาไทย" : "",
            titleEN: !titleEN.trim() ? "กรุณากรอกหัวข้อข่าวภาษาอังกฤษ" : "",
            detailTH: !stripHtml(details.detailTH) ? "กรุณากรอกรายละเอียดข่าวและกิจกรรมภาษาไทย" : "",
            detailEN: !stripHtml(details.detailEN) ? "กรุณากรอกรายละเอียดข่าวและกิจกรรมภาษาอังกฤษ" : "",
            image: imageItems.length === 0 ? "กรุณาเลือกรูปข่าวและกิจกรรม" : "",
        };

        setError(errors);
        return {
            isValid: !Object.values(errors).some(Boolean),
            ...details,
        };
    };

    const buildPayload = (details: { detailTH: string; detailEN: string }, galleryPaths: string[] = []) => {
        const fullName = `${user?.fname ?? ""} ${user?.lname ?? ""}`.trim() || "Unknown";
        const formData = new FormData();
        const detailTHHtml = preserveHtmlSpacing(details.detailTH);
        const detailENHtml = preserveHtmlSpacing(details.detailEN);

        formData.append("typeID", String(typeId ?? ""));
        formData.append("editorialtypeID", String(typeId ?? ""));
        formData.append("type", String(typeId ?? ""));
        formData.append("titleTH", titleTH.trim());
        formData.append("titleEN", titleEN.trim());
        formData.append("detailTH", detailTHHtml);
        formData.append("detailEN", detailENHtml);
        formData.append("contentTH", detailTHHtml);
        formData.append("contentEN", detailENHtml);
        formData.append("descriptionTH", detailTHHtml);
        formData.append("descriptionEN", detailENHtml);
        formData.append("updatename", fullName);
        formData.append("active", "2");
        formData.append("gallerypath", JSON.stringify(galleryPaths));
        formData.append("gallary", JSON.stringify(galleryPaths));
        formData.append("gallery", JSON.stringify(galleryPaths));

        return formData;
    };

    const buildGalleryPayload = () => {
        const formData = new FormData();

        formData.append("module", "editoria");
        formData.append("type", "editoria");
        formData.append("namepage", "ข่าวและกิจกรรม");
        formData.append("page", "ข่าวและกิจกรรม");

        imageItems
            .filter((item) => item.file)
            .forEach(({ file }) => {
                if (file) formData.append("gallery[]", file);
            });

        return formData;
    };

    const getUploadedGalleryPaths = (result: any) => {
        const paths = result?.pathj ?? result?.paths ?? result?.data?.pathj ?? result?.data?.paths ?? [];
        return Array.isArray(paths) ? paths.filter((path) => typeof path === "string") : [];
    };

    const uploadGalleryImages = async () => {
        if (!imageItems.some((item) => item.file)) return [];

        const response = await apiFetch(createGalleryEndpoint, {
            method: "POST",
            body: buildGalleryPayload(),
        });

        const result = await response.json().catch(() => ({}));
        const paths = getUploadedGalleryPaths(result);
        if (!response.ok || paths.length === 0) {
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

    const handleSubmit = () => {
        const validation = validateForm();
        if (!validation.isValid || !id) return;

        const currentGalleryPaths = imageItems
            .map((item) => item.path ?? "")
            .filter(Boolean);
        const hasNewImages = imageItems.some((item) => item.file);
        const currentSnapshot = buildNewsSnapshot({
            typeId,
            titleTH,
            titleEN,
            detailTH: validation.detailTH,
            detailEN: validation.detailEN,
            galleryPaths: currentGalleryPaths,
        });

        if (initialSnapshot && !hasNewImages && currentSnapshot === initialSnapshot) {
            setNotify({
                isOpen: true,
                message: "ไม่มีการเปลี่ยนแปลงข้อมูล",
                type: "info",
            });
            return;
        }

        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: async () => {
                setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

                try {
                    const uploadedGalleryPaths = await uploadGalleryImages();
                    let uploadedIndex = 0;
                    const galleryPaths = imageItems
                        .map((item) => {
                            if (item.path) return item.path;
                            if (item.file) {
                                const uploadedPath = uploadedGalleryPaths[uploadedIndex];
                                uploadedIndex += 1;
                                return uploadedPath;
                            }
                            return "";
                        })
                        .filter((path): path is string => Boolean(path));
                    const updateId = editorialId || id;
                    let response: Response | null = null;
                    for (const endpoint of updateEndpoints) {
                        response = await apiFetch(`${endpoint}/${updateId}`, {
                            method: "POST",
                            body: buildPayload(validation, galleryPaths),
                        });
                        if (response.ok || response.status !== 404) break;
                    }

                    const result = await response?.json().catch(() => ({}));
                    if (!response?.ok) {
                        throw new Error(
                            getNewsErrorMessage(
                                result?.message ||
                                result?.error ||
                                `แก้ไขข้อมูลไม่สำเร็จ (${response?.status ?? 404})`
                            )
                        );
                    }

          navigate("/News_Activity", {
                        state: {
                            notify: {
                                message: "แก้ไขข้อมูลสำเร็จ",
                                type: "success",
                            },
                        },
                    });
                } catch (error) {
                    setNotify({
                        isOpen: true,
                        message:
                            error instanceof Error
                                ? getNewsErrorMessage(error.message)
                                : "เกิดข้อผิดพลาดในการแก้ไขข้อมูล",
                        type: "error",
                    });
                } finally {
                    setConfirmDialog({
                        isOpen: false,
                        isLoading: false,
                        onConfirm: () => { },
                    });
                }
            },
        });
    };

    const renderImageUpload = () => (
        <Box
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
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
            <input
                ref={fileInputRef}
                hidden
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                multiple
                onChange={(event) => {
                    addImageFiles(Array.from(event.target.files ?? []));
                    event.target.value = "";
                }}
            />

            {imageItems.length > 0 ? (
                <Box sx={{ width: "100%" }}>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleImageSortEnd}
                    >
                        <SortableContext
                            items={imageItems.map((item) => item.id)}
                            strategy={rectSortingStrategy}
                        >
                            <Box
                                onClick={(event) => event.stopPropagation()}
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
                                {imageItems.map((item, index) => (
                                    <SortableImageItem
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        onRemove={removeImageFile}
                                    />
                                ))}
                            </Box>
                        </SortableContext>
                    </DndContext>

                    <Stack
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="center"
                        spacing={2}
                        sx={{ mt: 2 }}
                        onClick={(event) => event.stopPropagation()}
                    >
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
                        <Button
                            variant="contained"
                            startIcon={<CloudUploadIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{
                                borderRadius: 1.5,
                                textTransform: "none",
                                color: theme.palette.mode === "dark" ? "black" : "white",
                                backgroundColor:
                                    theme.palette.mode === "dark" ? "white" : "black",
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

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        เลือกแล้ว {imageItems.length}/{MAX_IMAGE_FILES} รูป
                    </Typography>
                </Box>
            ) : (
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

                    <Typography fontWeight={600}>
                        เลือกไฟล์หรือลากและวางก็ได้
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            maxWidth: 760,
                            lineHeight: 1.6,
                        }}
                    >
                        รองรับเฉพาะไฟล์ภาพนามสกุล JPG เท่านั้น ขนาดไม่เกิน 2 MB ต่อรูป อัปโหลดได้สูงสุด {MAX_IMAGE_FILES} รูป หรือคลิก{" "}
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
                        จากเครื่องของคุณ
                    </Typography>
                </Box>
            )}
        </Box>
    );

    if (loading) {
        return (
            <Container maxWidth="xl">
                <Paper elevation={0} sx={{ mt: 5, py: 8, borderRadius: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <CircularProgress />
                    </Box>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Paper elevation={0} sx={{ mt: 5, py: 2, borderRadius: 3, width: "100%" }}>
                <Box sx={{ px: { xs: 2, sm: 5 }, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <Typography variant="h6" fontWeight={600}>
                            ฟอร์มแก้ไขข้อมูลข่าวสารและกิจกรรม
                        </Typography>
                    </Box>

                    <ComponentsFormSection
                        title="ประเภทข่าวสารและกิจกรรม"
                        open={typeBlockOpen}
                        onToggle={() => setTypeBlockOpen((prev) => !prev)}
                    >
                        <CategorySelectField
                            label="เลือกประเภทข่าวสารและกิจกรรม"
                            placeholder="กรุณาเลือกประเภทข่าวสารและกิจกรรม"
                            value={typeId ?? 0}
                            onChange={handleTypeChange}
                            options={newsTypes}
                            error={error.typeId}
                            required
                        />
                    </ComponentsFormSection>

                    <ComponentsFormSection
                        title="รายละเอียดข้อมูลข่าวสารและกิจกรรม"
                        open={detailBlockOpen}
                        onToggle={() => setDetailBlockOpen((prev) => !prev)}
                    >
                        <Grid container spacing={4}>
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

                            <Grid size={{ xs: 12 }}>
                                <ComponentsNewsRichTextField
                                    ref={detailTHRef}
                                    label="รายละเอียดข่าวและกิจกรรมภาษาไทย"
                                    error={error.detailTH}
                                    extensions={editorExtensionsTH}
                                    content={detailTH}
                                    renderControls={editorControls}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <ComponentsNewsRichTextField
                                    ref={detailENRef}
                                    label="รายละเอียดข่าวและกิจกรรมภาษาอังกฤษ"
                                    error={error.detailEN}
                                    extensions={editorExtensionsEN}
                                    content={detailEN}
                                    renderControls={editorControls}
                                />
                            </Grid>
                        </Grid>
                    </ComponentsFormSection>

                    <ComponentsFormSection
                        title="รูปข่าวและกิจกรรม"
                        open={imageBlockOpen}
                        onToggle={() => setImageBlockOpen((prev) => !prev)}
                        iconType="image"
                        noMargin
                        contentSx={{ py: 4 }}
                    >
                        {renderImageUpload()}
                        {error.image && (
                            <Typography color="error" variant="caption" sx={{ mt: 0.75, display: "block" }}>
                                {error.image}
                            </Typography>
                        )}

                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                            <TextButton
                                onClick={handleSubmit}
                                sx={{ backgroundColor: theme.palette.warning.main }}
                            >
                                แก้ไขข้อมูล
                            </TextButton>
                        </Box>
                    </ComponentsFormSection>
                </Box>
            </Paper>

            <ConfirmDialog
                type="edit"
                confirmDialog={confirmDialog}
                setConfirmDialog={setConfirmDialog}
            />
            <Notifications notify={notify} setNotify={setNotify} />
        </Container>
    );
};

export default NewsEditpage;
