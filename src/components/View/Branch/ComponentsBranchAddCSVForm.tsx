import { Avatar, Box, Grid, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react'
import TextButton from '../../Buttom/TextButton';
import { dataBranchType, dataBusinessSector } from '../../../API/StausData';
import AppIconButton from '../../Buttom/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';

import provinces from '../../../utils/Address/thai_provinces.json';
import amphures from '../../../utils/Address/thai_amphures.json';
import tambons from '../../../utils/Address/thai_tambons.json';
import { cleanPhone } from '../../../utils/Format/format-phone';
import { apiFetch } from '../../../API/client';
import type { BasicDropDownSeleteProps } from '../../../utils/types';
import { useNavigate } from 'react-router-dom';

interface ComponentsBranchAddCSVFormProps {
    duplicateMap: {
        [key: string]: boolean;
    }
    csvData: any[]
    fullnamePer: string
    IDPer: string
    typeUser: string
    setNotify: React.Dispatch<React.SetStateAction<{
        isOpen: boolean;
        message: string;
        type: "success" | "error" | "warning" | "info";
    }>>;

    setConfirmDialog: React.Dispatch<React.SetStateAction<{
        isOpen: boolean;
        isLoading: boolean;
        onConfirm: () => void;
    }>>
}

const ComponentsBranchAddCSVForm: React.FC<ComponentsBranchAddCSVFormProps> = ({
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

    const getFullAddress = (districtId: number) => {
        const tambon = tambons.find(t => t.id === districtId);
        if (!tambon) return { tambon: "-", amphure: "-", province: "-", zipcode: "-" };

        const amphure = amphures.find(a => a.id === tambon.amphure_id);
        const province = provinces.find(p => p.id === amphure?.province_id);

        return {
            tambon: tambon.name_th,
            amphure: amphure?.name_th || "-",
            province: province?.name_th || "-",
            zipcode: tambon.zip_code || "-"
        };
    };


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

    const handleSubmit = () => {
        if (!localData || localData.length === 0) {
            setNotify({
                isOpen: true,
                message: "ไม่มีข้อมูลสำหรับบันทึก",
                type: "warning"
            });
            return;
        }

        const cleanData = localData
            .filter(row => !duplicateMap[row.branchname])
            .map(row => {
                const tambon = tambons.find(t => t.id === Number(row.district));
                if (!tambon) return null;

                const amphure = amphures.find(a => a.id === tambon.amphure_id);
                const province = provinces.find(p => p.id === amphure?.province_id);

                return {
                    ...row,

                    // ✅ district
                    districtID: tambon.id,
                    district: tambon.name_th,

                    // ✅ amphoe
                    amphoeID: tambon.amphure_id,
                    amphoe: amphure?.name_th || "-",

                    // ✅ province (🔥 FIX ถูกต้อง)
                    provinceID: amphure?.province_id || null,
                    province: province?.name_th || "-",

                    zipcode: tambon.zip_code,

                    phone: `${cleanPhone(row.phone1)}${row.phone2 ? ` , ${cleanPhone(row.phone2)}` : ""
                        }`,

                    savename: fullnamePer,
                    active: "1"
                };
            })
            .filter(Boolean);

        if (cleanData.length === 0) {
            setNotify({
                isOpen: true,
                message: "ไม่มีข้อมูลใหม่ (ข้อมูลซ้ำทั้งหมด)",
                type: "warning"
            });
            return;
        }

        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: () => handleConfirmSubmit(cleanData)
        });
    };

    const handleConfirmSubmit = async (data: any[]) => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
            const response = await apiFetch(
                `/api/auther/branch/import`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ data }) // ✅ ส่ง array
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "นำเข้าข้อมูลไม่สำเร็จ");
            }

            // ✅ log
            const payloadlog = {
                actionType: 9,
                actionDetail: `นำเข้าข้อมูลหน่วยงาน (CSV) จำนวน ${result.inserted} รายการ`,
                typeUser,
                datatype: 'ค้นหาสาขา',
                dataID: null,
                dataname: `CSV Import`,
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
                        message: "เพิ่มข้อมูลสาขาสำเร็จ",
                        type: "success",
                    },
                },
            });

            // ✅ success notify
            setNotify({
                isOpen: true,
                message: `นำเข้าสำเร็จ ${result.inserted} รายการ`,
                type: "success"
            });

            // 🔥 reset
            setLocalData([]);

        } catch (error) {
            let errorMessage = "เกิดข้อผิดพลาดในการนำเข้าข้อมูล";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            setNotify({
                isOpen: true,
                message: errorMessage,
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
                    const isDup = duplicateMap[row.branchname];
                    const addr = getFullAddress(Number(row.district));
                    return (
                        <Grid key={i} size={{ xs: 12, lg: 6 }}>
                            <Box
                                sx={{

                                    p: 2,
                                    borderRadius: 3,
                                    backgroundColor: isDup
                                        ? theme.palette.mode === "dark"
                                            ? theme.palette.error.darker
                                            : theme.palette.error.lighter
                                        : theme.palette.mode === "dark"
                                            ? theme.palette.grey[900]
                                            : theme.palette.grey[50],

                                    border: isDup
                                        ? `1px solid ${theme.palette.mode === "dark"
                                            ? theme.palette.error.darker
                                            : theme.palette.error.lighter
                                        }`
                                        : `1px solid ${theme.palette.mode === "dark"
                                            ? theme.palette.grey[800]
                                            : "transparent"
                                        }`,
                                    display: "flex",
                                    flexDirection: "column",

                                    height: "100%"
                                }}
                            >
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
                                            {row.branchname?.charAt(0)}
                                        </Avatar>

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column' // ✅ ทำให้ลงบรรทัด
                                            }}
                                        >
                                            <Typography variant='body1' sx={{ fontWeight: 600 }}>
                                                {Number(row.branchType) === 3
                                                    ? row.branchname
                                                    : `${getBranchType(Number(row.branchType))}${row.branchname}`
                                                }
                                            </Typography>

                                            <Typography variant='caption' color="text.secondary">
                                                {(Number(row.region) === 18 && Number(row.businessSector) === 6)
                                                    ? getSector(Number(row.businessSector))
                                                    : `เขต${areaMap[Number(row.region)] || "-"} ${getSector(Number(row.businessSector))}`
                                                }
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
                                        {row.landmark}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        {row.address} ตำบล{addr.tambon} อำเภอ{addr.amphure} {addr.province} {addr.zipcode}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: theme.palette.secondary.main }}>
                                        <PhoneInTalkIcon fontSize="small" />
                                        <Typography variant="body2">{cleanPhone(row.phone1)}</Typography>

                                        {row.phone2 && (
                                            <>
                                                <PhoneInTalkIcon fontSize="small" />
                                                <Typography variant="body2">{cleanPhone(row.phone2)}</Typography>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
                                    {isDup && (
                                        <Typography color="error" variant='body2' >
                                            ⚠️ ข้อมูลซ้ำในระบบ
                                        </Typography>
                                    )}
                                    <TextButton size="small"
                                        onClick={() => handleOpenMap(Number(row.lat), Number(row.lag))}
                                        sx={{
                                            backgroundColor: '#6978d1'
                                        }}
                                    >
                                        พิกัด
                                    </TextButton>
                                </Box>

                            </Box>
                        </Grid>
                    );
                })}

                {/* ปุ่มบันทึก */}
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }} >
                        <TextButton onClick={handleSubmit}>
                            บันทึกข้อมูล
                        </TextButton>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}

export default ComponentsBranchAddCSVForm
