import { Box, Grid, MenuItem, TextField, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react'

import provinces from "../../../utils/Address/thai_provinces.json";
import amphures from "../../../utils/Address/thai_amphures.json";
import tambons from "../../../utils/Address/thai_tambons.json";
import type { Amphure, Tambon } from '../../../utils/Address/Address_Mannager';


interface MenuAddressNumberProps {
    address: string;
    setAddress: (v: string) => void;

    district: string;
    setDistrict: (v: string) => void;

    amphoe: string;
    setAmphoe: (v: string) => void;

    province: string;
    setProvince: (v: string) => void;

    zipcode: string;
    setZipcode: (v: string) => void;

    setDistrictID?: (v: number | null) => void;
    setAmphoeID?: (v: number | null) => void;
    setProvinceID?: (v: number | null) => void;

    handleFieldChange?: (field: string, value: unknown) => void;
    specify?: boolean;
    error?: string;
    topon?: number;
    fieldKeyPrefix?: string; // เช่น "address" → "address", "district", "amphoe"
}


const MenuAddressNumber: React.FC<MenuAddressNumberProps> = ({
    address,
    setAddress,

    district,
    setDistrict,

    amphoe,
    setAmphoe,

    province,
    setProvince,

    zipcode,
    setZipcode,
    setDistrictID,
    setAmphoeID,
    setProvinceID,

    handleFieldChange,
    error,
    specify = true,
    topon = 0,
    fieldKeyPrefix = "address"
}) => {
    const theme = useTheme();
    const [provinceId, setProvinceId] = useState(0);
    const [amphureId, setAmphureId] = useState(0);
    const [tambonId, setTambonId] = useState(0);

    useEffect(() => {
        if (!province) return;

        const foundProvince = provinces.find((p) => p.name_th === province);
        if (foundProvince) {
            setProvinceId(foundProvince.id);
        }

        if (amphoe) {
            const foundAmphure = amphures.find(
                (a) =>
                    a.name_th === amphoe &&
                    a.province_id === foundProvince?.id
            );
            if (foundAmphure) {
                setAmphureId(foundAmphure.id);
            }
        }

        if (district) {
            const foundTambon = tambons.find(
                (t) =>
                    t.name_th === district &&
                    t.amphure_id === amphureId
            );
            if (foundTambon) {
                setTambonId(foundTambon.id);
                setZipcode(foundTambon.zip_code.toString());
            }
        }
    }, [province, amphoe, district, amphureId, setZipcode]);

    const filteredAmphures: Amphure[] = useMemo(
        () => (provinceId ? amphures.filter((a) => a.province_id === provinceId) : []),
        [provinceId]
    );

    const filteredTambons: Tambon[] = useMemo(
        () => (amphureId ? tambons.filter((t) => t.amphure_id === amphureId) : []),
        [amphureId]
    );

    // เลือกจังหวัด
    const handleProvinceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const id = +e.target.value;
        setProvinceId(id);
        setAmphureId(0);
        setTambonId(0);

        const p = provinces.find((x) => x.id === id);
        const newProvince = p?.name_th || "";

        setProvince(newProvince);
        setProvinceID?.(id || null);
        setAmphoeID?.(null);
        setDistrictID?.(null);
        handleFieldChange?.(`${fieldKeyPrefix}_province`, newProvince);

        // reset district / amphoe / zipcode
        setDistrict("");
        setAmphoe("");
        setZipcode("");
    };

    // เลือกอำเภอ
    const handleAmphureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const id = +e.target.value;
        setAmphureId(id);
        setTambonId(0);

        const a = amphures.find((x) => x.id === id);
        const newAmphoe = a?.name_th || "";

        setAmphoe(newAmphoe);
        setAmphoeID?.(id || null);
        setDistrictID?.(null);
        handleFieldChange?.(`${fieldKeyPrefix}_amphoe`, newAmphoe);

        // reset tambon / zipcode
        setDistrict("");
        setZipcode("");
    };

    // เลือกตำบล
    const handleTambonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const id = +e.target.value;
        setTambonId(id);

        const t = tambons.find((x) => x.id === id);
        const newDistrict = t?.name_th || "";
        const newZipcode = t?.zip_code?.toString() || "";

        setDistrict(newDistrict);
        setDistrictID?.(id || null);
        setZipcode(newZipcode);

        handleFieldChange?.(`${fieldKeyPrefix}_district`, newDistrict);
        handleFieldChange?.(`${fieldKeyPrefix}_zipcode`, newZipcode);
    };

    return (
        <Box sx={{ mt: topon }}>
            <Typography variant="body1" >
                ที่อยู่ {specify && <span style={{ color: theme.palette.error.main }}>*</span>}
            </Typography>

            <Grid container spacing={2}>
                {/* บ้านเลขที่ */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        required
                        size="small"
                        variant="outlined"
                        placeholder="บ้านเลขที่"
                        fullWidth
                        value={address}
                        onChange={(e) => {
                            setAddress(e.target.value);
                            handleFieldChange?.(`${fieldKeyPrefix}_address`, e.target.value);
                        }}
                        slotProps={{
                            htmlInput: {
                                sx: { fontSize: theme.typography.body2.fontSize, }
                            }
                        }}

                        sx={{
                            '& .MuiInputLabel-root': {
                                color: theme.palette.primary.main
                            },
                            '& .MuiInputBase-input': {
                                fontWeight: 300,
                                color: error ? theme.palette.error.main : theme.palette.text.primary
                            },
                            '& .MuiInputBase-input::placeholder': {
                                color: error ? theme.palette.error.main : theme.palette.grey[500],
                                opacity: 1
                            },

                            '& .MuiInputLabel-root.Mui-focused': {
                                color: theme.palette.primary.main
                            },
                            '& .MuiFormHelperText-root': {
                                fontSize: theme.typography.caption.fontSize,
                                fontWeight: 400,
                            },
                            fontSize: theme.typography.body2.fontSize,
                            mt: 1
                        }}
                        error={!!error}
                        helperText={error}

                    />

                </Grid>

                {/* จังหวัด */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        select
                        size="small"
                        fullWidth
                        value={provinceId}
                        onChange={handleProvinceChange}
                        error={!!error}
                        sx={{ mt: 1 }}
                    >
                        <MenuItem value={0} sx={{fontSize:theme.typography.body2.fontSize}}>เลือกจังหวัด</MenuItem>
                        {[...provinces]
                            .sort((a, b) => a.name_th.localeCompare(b.name_th, 'th'))
                            .map((p) => (
                                <MenuItem key={p.id} value={p.id}>
                                    {p.name_th}
                                </MenuItem>
                            ))}
                    </TextField>
                </Grid>

                {/* อำเภอ */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        select
                        size="small"
                        fullWidth
                        value={amphureId}
                        onChange={handleAmphureChange}
                        error={!!error}
                    >
                        <MenuItem value={0}>เลือกอำเภอ</MenuItem>
                        {[...filteredAmphures]
                            .sort((a, b) => a.name_th.localeCompare(b.name_th, 'th'))
                            .map((a) => (
                                <MenuItem key={a.id} value={a.id}>
                                    {a.name_th}
                                </MenuItem>
                            ))}
                    </TextField>
                </Grid>

                {/* ตำบล */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        select
                        size="small"
                        fullWidth
                        value={tambonId}
                        onChange={handleTambonChange}
                        error={!!error}
                    >
                        <MenuItem value={0}>เลือกตำบล</MenuItem>
                        {[...filteredTambons]
                            .sort((a, b) => a.name_th.localeCompare(b.name_th, 'th'))
                            .map((t) => (
                                <MenuItem key={t.id} value={t.id}>
                                    {t.name_th}
                                </MenuItem>
                            ))}
                    </TextField>
                </Grid>

                {/* รหัสไปรษณีย์ */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="รหัสไปรษณีย์"
                        value={zipcode}
                        disabled
                        sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                                color: theme.palette.text.disabled,
                                WebkitTextFillColor: theme.palette.text.disabled, // สำคัญ (Chrome)
                            },
                            '& .MuiOutlinedInput-root.Mui-disabled': {
                                backgroundColor: theme.palette.action.disabledBackground,
                            }
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    )
}

export default MenuAddressNumber
