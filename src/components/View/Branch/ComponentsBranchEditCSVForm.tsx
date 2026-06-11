import { Avatar, Box, Grid, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import type { BasicDropDownSeleteProps } from '../../../utils/types';
import { dataBranchType, dataBusinessSector } from '../../../API/StausData';
import { apiFetch } from '../../../API/client';
import { cleanPhone } from '../../../utils/Format/format-phone';
import CloseIcon from '@mui/icons-material/Close';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import provinces from '../../../utils/Address/thai_provinces.json';
import amphures from '../../../utils/Address/thai_amphures.json';
import tambons from '../../../utils/Address/thai_tambons.json';
import AppIconButton from '../../Buttom/IconButton';
import TextButton from '../../Buttom/TextButton';

interface DuplicateData {
    exists: boolean;
    old: any | null;
}


interface ComponentsBranchEditCSVFormProps {
    duplicateMap: {
        [key: string]: DuplicateData;
    };
    csvData: any[];
    fullnamePer: string;
    IDPer: string;
    typeUser: string;
    setNotify: React.Dispatch<React.SetStateAction<{
        isOpen: boolean;
        message: string;
        type: "success" | "error" | "warning" | "info";
    }>>;
    setConfirmDialog: React.Dispatch<React.SetStateAction<{
        isOpen: boolean;
        isLoading: boolean;
        onConfirm: () => void;
    }>>;
}

const ComponentsBranchEditCSVForm: React.FC<ComponentsBranchEditCSVFormProps> = ({
    duplicateMap,
    csvData,
    setConfirmDialog,
    setNotify,
    fullnamePer,
    typeUser,
    IDPer,
}) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [localData, setLocalData] = useState(csvData);
    const [areaList, setAreaList] = React.useState<BasicDropDownSeleteProps[]>([]);
    const getBranchType = (id: number) =>
        dataBranchType.find(x => x.id == id)?.labelname || "-";

    const getSector = (id: number) =>
        dataBusinessSector.find(x => x.id == id)?.labelname || "-";

    useEffect(() => {
        const fetchArea = async () => {
            try {
                const res = await apiFetch(`/api/auther/areaapi`, {
                    method: "GET"
                });

                const data = await res.json();
                setAreaList(data?.result || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchArea();
        setLocalData(csvData);
    }, [csvData]);
    const areaMap = useMemo(() => {
        const map: Record<number, string> = {};
        areaList.forEach((item) => {
            map[item.id] = item.name;
        });
        return map;
    }, [areaList]);

    const handleRemove = (index: number) => {
        const updated = [...localData];
        updated.splice(index, 1);
        setLocalData(updated);
    };
    const handleOpenMap = (lat: number, lng: number) => {
        if (!lat || !lng) {
            setNotify({
                isOpen: true,
                message: "ไม่มีข้อมูลพิกัด",
                type: "warning"
            });
            return;
        }

        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(url, "_blank");
    };

    const isFilled = (value: any) => {
        return value !== undefined && value !== null && String(value).trim() !== "";
    };

    const renderDiff = (oldValue: any, newValue: any) => {
        const oldText = oldValue ?? "-";

        if (!isFilled(newValue) || String(newValue).trim() === String(oldText).trim()) {
            return (
                <Typography component="span" variant="body2">
                    {oldText}
                </Typography>
            );
        }

        return (
            <Box component="span">
                <Typography
                    component="span"
                    variant="body2"
                    sx={{
                        textDecoration: "line-through",
                        color: "text.disabled"
                    }}
                >
                    {oldText}
                </Typography>

                <Typography
                    component="span"
                    variant="caption"
                    sx={{
                        display: "block",
                        color: "warning.dark",
                        fontWeight: 700,
                        mt: 0.2
                    }}
                >
                    {newValue}
                </Typography>
            </Box>
        );
    };

    const getDiffValue = (_oldVal?: number, newVal?: number) => {
        return newVal ?? 0;
    };

    const buildPayload = () => {
        return localData
            .filter(row => duplicateMap[row.branchID]?.exists)
            .map(row => {
                const data = duplicateMap[row.branchID];
                const old = data.old;

                const districtValue = isFilled(row.district)
                    ? row.district
                    : old?.int_saksiam_branch_districtid;

                const tambon = tambons.find(t => Number(t.id) === Number(districtValue));
                const amphure = amphures.find(a => Number(a.id) === Number(tambon?.amphure_id));
                const province = provinces.find(p => Number(p.id) === Number(amphure?.province_id));

                return {
                    branchID: row.branchID,

                    branchType: isFilled(row.branchType)
                        ? row.branchType
                        : old?.type,

                    branchname: isFilled(row.branchname)
                        ? row.branchname
                        : old?.name,

                    region: isFilled(row.region)
                        ? row.region
                        : old?.region,

                    businessSector: isFilled(row.businessSector)
                        ? row.businessSector
                        : old?.area,

                    landmark: isFilled(row.landmark)
                        ? row.landmark
                        : old?.detail,

                    address: isFilled(row.address)
                        ? row.address
                        : old?.address,

                    districtID: tambon?.id ?? old?.districtid,
                    district: tambon?.name_th ?? old?.districtname,

                    amphoeID: amphure?.id ?? old?.amphurid,
                    amphoe: amphure?.name_th ?? old?.amphurname,

                    provinceID: province?.id ?? old?.provinceid,
                    province: province?.name_th ?? old?.provincename,

                    zipcode: tambon?.zip_code ?? old?.zipcode,

                    phone: isFilled(row.phone1) || isFilled(row.phone2)
                        ? `${isFilled(row.phone1) ? cleanPhone(row.phone1) : ""}${isFilled(row.phone2) ? ` , ${cleanPhone(row.phone2)}` : ""}`
                        : old?.tel,

                    lat: isFilled(row.lat)
                        ? row.lat
                        : old?.lat,

                    lag: isFilled(row.lag)
                        ? row.lag
                        : old?.lng,

                    updatename: fullnamePer,
                };
            });
    };


    const handleSubmit = () => {
        if (!localData || localData.length === 0) {
            setNotify({
                isOpen: true,
                message: "ไม่มีข้อมูลสำหรับแก้ไข",
                type: "warning"
            });
            return;
        }

        const notFound = localData.filter(row => !duplicateMap[row.branchID]?.exists);

        if (notFound.length > 0) {
            setNotify({
                isOpen: true,
                message: `มีรหัสสาขาที่ไม่พบในระบบ ${notFound.length} รายการ กรุณาลบออกก่อน`,
                type: "error"
            });
            return;
        }

        const payload = buildPayload();

        if (payload.length === 0) {
            setNotify({
                isOpen: true,
                message: "ไม่มีข้อมูลที่สามารถแก้ไขได้",
                type: "warning"
            });
            return;
        }

        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: () => handleConfirmSubmit(payload)
        });
    };

    const handleConfirmSubmit = async (data: any[]) => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
            const response = await apiFetch(`/api/auther/branch/update-csv`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "แก้ไขข้อมูลไม่สำเร็จ");
            }

            const payloadlog = {
                actionType: 1,
                actionDetail: `แก้ไขข้อมูลหน่วยงาน (CSV) จำนวน ${result.updated ?? data.length} รายการ`,
                typeUser,
                datatype: 'ค้นหาสาขา',
                dataID: null,
                dataname: `CSV Edit`,
                IDPer,
                FullPer: fullnamePer
            };

            await apiFetch(`/api/auther/log`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloadlog),
            });

            navigate("/Branch", {
                state: {
                    notify: {
                        message: `แก้ไขข้อมูลสาขาสำเร็จ ${result.updated ?? data.length} รายการ`,
                        type: "success",
                    },
                },
            });

        } catch (error) {
            setNotify({
                isOpen: true,
                message: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการแก้ไขข้อมูล",
                type: "error",
            });
        } finally {
            setConfirmDialog({
                isOpen: false,
                isLoading: false,
                onConfirm: () => { },
            });
        }
    };
    return (
        <Box
            sx={{
                maxHeight: localData.length > 6 ? 500 : "auto", // 🔥 เงื่อนไข
                overflowY: localData.length > 6 ? "auto" : "visible",
                pr: 1 // กัน scrollbar ชนขอบ
            }}
        >
            <Grid container spacing={2}>
                {localData.map((row, i) => {
                    const checked = duplicateMap[row.branchID];
                    const exists = checked?.exists;
                    const old = checked?.old;

                    return (
                        <Grid key={i} size={{ xs: 12, lg: 6 }}>
                            <Box
                                sx={{

                                    p: 2,
                                    borderRadius: 3,
                                    backgroundColor: exists
                                        ? theme.palette.mode === "dark"
                                            ? theme.palette.grey[900]
                                            : theme.palette.grey[50]
                                        : theme.palette.mode === "dark"
                                            ? theme.palette.error.darker
                                            : theme.palette.error.lighter,


                                    border: exists
                                        ? `1px solid ${theme.palette.mode === "dark"
                                            ? theme.palette.grey[800]
                                            : "transparent"
                                        }`
                                        : `1px solid ${theme.palette.mode === "dark"
                                            ? theme.palette.error.darker
                                            : theme.palette.error.lighter

                                        }`,
                                    display: "flex",
                                    flexDirection: "column",

                                    height: "100%"
                                }}
                            >
                                {!exists ? (
                                    <Box
                                        sx={{
                                            position: "relative",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            textAlign: "center",
                                            minHeight: '100%', // 🔥 ทำให้มันดูเป็นกล่อง
                                            px: 2
                                        }}
                                    >

                                        {/* ❌ ปุ่มลบ (มุมขวาบน) */}
                                        <AppIconButton
                                            onClick={() => handleRemove(i)}
                                            sx={{
                                                position: "absolute",
                                                top: 6,
                                                right: -16,
                                                color: "error.main",
                                                borderColor: "transparent",
                                                '&:hover': {
                                                    borderColor: "transparent",
                                                }
                                            }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </AppIconButton>

                                        {/* 📦 กลางกล่อง */}
                                        <Box>
                                            <Typography color="error" sx={{ fontWeight: 700 }}>
                                                ไม่พบรหัสสาขา: {row.branchID}
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                กรุณาตรวจสอบรหัสสาขาในไฟล์ CSV
                                            </Typography>
                                        </Box>

                                    </Box>
                                ) : (
                                    <>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between', // ✅ ดันซ้าย-ขวา
                                                width: '100%',
                                                mb: 1.5
                                            }}
                                        >
                                            {/* ซ้าย */}
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1

                                                }}
                                            >
                                                <Avatar sx={{ bgcolor: "#5c6bc0" }}>
                                                    {(row.branchname || old?.name || "?")?.charAt(0)}
                                                </Avatar>

                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column' // ✅ ทำให้ลงบรรทัด
                                                    }}
                                                >
                                                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                                                        {renderDiff(
                                                            getBranchType(old?.type),
                                                            isFilled(row.branchType) ? getBranchType(row.branchType) : ""
                                                        )}{renderDiff(
                                                            old?.name,
                                                            row.branchname
                                                        )}
                                                    </Typography>

                                                    <Typography variant='caption' color="text.secondary">
                                                        {renderDiff(
                                                            `เขต${areaMap[Number(old?.region)] || "-"} ${getSector(old?.area)}`,
                                                            isFilled(row.region) || isFilled(row.businessSector)
                                                                ? `เขต${areaMap[Number(row.region || old?.region)] || "-"} ${getSector(row.businessSector || old?.area)}`
                                                                : ""
                                                        )}
                                                    </Typography>
                                                </Box>
                                            </Box>



                                            {/* ขวา (ปุ่มลบ) */}
                                            <AppIconButton
                                                onClick={() => handleRemove(i)}

                                                sx={{
                                                    color: "error.main",
                                                    borderColor: 'transparent',
                                                    '&:hover': {
                                                        borderColor: 'transparent',
                                                    }, mr: -1.5
                                                }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </AppIconButton>
                                        </Box>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'left',
                                            flexDirection: 'column',
                                            width: '100%',
                                            mb: 2,
                                            gap: 1
                                        }}>



                                            <Typography variant="body2" color="text.secondary">
                                                {renderDiff(
                                                    old?.detail,
                                                    row.landmark
                                                )}
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                {renderDiff(old?.address, row.address)} ตำบล{renderDiff(old?.districtname, row.tambon)} อำเภอ{renderDiff(old?.amphurname, row.amphure)} {renderDiff(old?.amphurname, row.provincename)}{renderDiff(old?.zipcode, row.zipcode)}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: theme.palette.secondary.main }}>
                                                <PhoneInTalkIcon fontSize="small" />
                                                <Typography variant="body2">  {renderDiff(
                                                    old?.tel,
                                                    isFilled(row.phone1) || isFilled(row.phone2)
                                                        ? `${isFilled(row.phone1) ? cleanPhone(row.phone1) : ""}${isFilled(row.phone2) ? ` , ${cleanPhone(row.phone2)}` : ""}`
                                                        : ""
                                                )}

                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
                                            <TextButton size="small"
                                                onClick={() =>
                                                    handleOpenMap(
                                                        getDiffValue(old?.lat, row.lat),
                                                        getDiffValue(old?.lng, row.lng)
                                                    )
                                                } sx={{
                                                    backgroundColor: '#6978d1'
                                                }}
                                            >
                                                พิกัด
                                            </TextButton>
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Grid>
                    );
                })}

                {/* ปุ่มบันทึก */}
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }} >
                        <TextButton
                            onClick={handleSubmit}
                            sx={{ backgroundColor: theme.palette.warning.main }}
                        >
                            แก้ไขข้อมูล
                        </TextButton>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}

export default ComponentsBranchEditCSVForm
