import { Box, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react'
import { apiFetch } from '../../../API/client';
import TextButton from '../../Buttom/TextButton';
import AppIconButton from '../../Buttom/IconButton';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

interface DuplicateItem {
    exists: boolean;
    old: any | null;
}

interface Props {
    setCsvData: (data: any[]) => void;
    setDuplicateMap: (data: { [key: string]: DuplicateItem }) => void;
    setNotify: any;
}

const headerMap: Record<string, string> = {
    "รหัสสาขา": "branchID",
    "ประเภทหน่วยงาน": "branchType",
    "ชื่อหน่วยงาน": "branchname",
    "เขตธุรกิจ": "region",
    "ภาคธุรกิจ": "businessSector",
    "หมายเลขโทรศัพท์1": "phone1",
    "หมายเลขโทรศัพท์2": "phone2",
    "รายละเอียดสาขา/จุดตลาด": "landmark",
    "ที่อยู่": "address",
    "ตำบล": "district",
    "อำเภอ": "amphoe",
    "จังหวัด": "province",
    "รหัสไปรษณีย์": "zipcode",
    "พิกัดละติจูด": "lat",
    "พิกัดลองจิจูด": "lag",
};

const MAX_ROWS = 100;

const BoxEditUploadCSV: React.FC<Props> = ({ setCsvData, setDuplicateMap, setNotify }) => {
    const theme = useTheme();
    const [fileName, setFileName] = useState<string | null>(null);
    const parseCSV = (text: string) => {
        const rows = text.split("\n").filter(r => r.trim() !== "");

        const parseRow = (row: string) => {
            const result: string[] = [];
            let current = "";
            let inQuotes = false;

            for (let i = 0; i < row.length; i++) {
                const char = row[i];

                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === "," && !inQuotes) {
                    result.push(current.trim());
                    current = "";
                } else {
                    current += char;
                }
            }

            result.push(current.trim());
            return result;
        };

        const headers = parseRow(rows[0]);
        const dataRows = rows.slice(1);

        return dataRows.map(row => {
            const cols = parseRow(row);
            const obj: any = {};

            headers.forEach((h, i) => {
                const key = headerMap[h.trim()];
                if (!key) return;

                let value = cols[i]?.replace(/^"|"$/g, "").trim() || "";

                // 🔥 FIX สำคัญ: แปลง branchID ให้ตรง DB
                if (key === "branchID" && value !== "") {
                    value = value.replace(/"/g, "").padStart(6, "0");
                }

                obj[key] = value;
            });

            return obj;
        });
    };
    const checkDuplicate = async (data: any[]) => {
        try {
            const response = await apiFetch(
                `/api/auther/branch/check-Editduplicate`, // ✅ ต้องมี /branch/
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ data })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "ตรวจสอบข้อมูลล้มเหลว");
            }

            setDuplicateMap(result);

        } catch (error) {
            console.error(error);
            setNotify({
                isOpen: true,
                message: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล",
                type: "error"
            });
        }
    };

    const handleFile = async (file: File) => {
        const text = await file.text();
        setFileName(file.name);
        const rows = text.split("\n").filter(r => r.trim() !== "");

        if (rows.length - 1 > MAX_ROWS) {
            setNotify({
                isOpen: true,
                message: "อัปโหลดได้ไม่เกิน 100 รายการ",
                type: "error"
            });
            setFileName(null);
            return;
        }

        const parsed = parseCSV(text);

        setCsvData(parsed);
        checkDuplicate(parsed);
    };
    const handleRemoveFile = () => {
        setFileName(null);
        setCsvData([]);
        setDuplicateMap({});
    };
    return (
        <Box
            sx={{
                border: `1px dashed ${theme.palette.grey[400]}`,
                borderRadius: 3,
                p: 3,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
            }}
        >
            <UploadFileIcon
                sx={{ fontSize: 40, color: theme.palette.mode === 'dark' ? '#8f9ead' : theme.palette.secondary.darker, mb: 1 }}
            />
            <Typography variant="body2" >เลือกไฟล์หรือลากและวางที่นี่</Typography>
            <Typography variant="caption" color="error">
                กรุณาอัปโหลดไฟล์ csv เท่านั้น และไม่เกิน 100 รายการ
            </Typography>
            {!fileName ? (
                // 👉 ยังไม่เลือกไฟล์
                <TextButton
                    component="label"
                    sx={{
                        mt: 2,
                        backgroundColor: theme.palette.warning.dark,
                    }}
                >
                    เลือกไฟล์
                    <input
                        type="file"
                        hidden
                        accept=".csv"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file);
                        }}
                    />
                </TextButton>
            ) : (
                // 👉 เลือกแล้ว
                <Box
                    sx={{
                        mt: 2,
                        px: 2,

                        borderRadius: 2,
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        maxWidth: 300
                    }}
                >
                    <Typography variant="body2" noWrap>
                        {fileName}
                    </Typography>
                    <AppIconButton
                        onClick={handleRemoveFile}
                        sx={{
                            color: theme.palette.error.main,
                            mr: -2,
                            borderColor: 'transparent'
                        }}
                    >
                        <DeleteForeverIcon sx={{ fontSize: 24 }} />
                    </AppIconButton>
                </Box>
            )}

        </Box>
    )
}

export default BoxEditUploadCSV
