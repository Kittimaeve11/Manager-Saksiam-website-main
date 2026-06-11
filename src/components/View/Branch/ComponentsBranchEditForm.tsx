import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormBranchData, FormBranchDataErrors } from '../../../utils/types'
import { validataBranchForm } from '../../../utils/validation'
import { apiFetch } from '../../../API/client'
import { Box, Grid, useTheme } from '@mui/material'
import BasicDropDownseletedata from '../../Model/Dropdown/BasicDropDownseletedata'
import BasicTextField from '../../Model/TextField/BasicTextField'
import { dataBranchType, dataBusinessSector } from '../../../API/StausData'
import BasicDropDownselete from '../../Model/Dropdown/BasicDropDownselete'
import BasicTextChipModel from '../../Model/TextField/BasicTextChipModel'
import BasicTextFieldDetail from '../../Model/TextField/BasicTextFieldDetail'
import MenuAddressNumber from '../../Model/Dropdown/MenuAddressNumber'
import TextButton from '../../Buttom/TextButton'

interface ComponentsBranchEditFormProps {
    branchID: string | undefined
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

const ComponentsBranchEditForm: React.FC<ComponentsBranchEditFormProps> = ({
    branchID,
    setConfirmDialog,
    setNotify,
    fullnamePer,
    typeUser,
    IDPer,
}) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [selectedBranchType, setSelectedBranchType] = useState<number | null>(0);
    const [branchname, setBranchname] = useState("")
    const [selectedBusinessSector, setSelectedBusinessSector] = useState<number | null>(0);
    const [selectedRegion, setSelectedRegione] = useState<number | null>(0);
    const [address, setAddress] = useState("")
    const [districtID, setDistrictID] = useState<number | null>(0);
    const [district, setDistrict] = useState("")
    const [amphoeID, setAmphoeID] = useState<number | null>(0);
    const [amphoe, setAmphoe] = useState("")
    const [provinceID, setProvinceID] = useState<number | null>(0);
    const [province, setProvince] = useState("")
    const [zipcode, setZipcode] = useState("")
    const [landmark, setLandmark] = useState("")
    const [phone, setPhone] = useState("")
    const [lat, setLat] = useState("")
    const [lag, setLlag] = useState("")

    const [originalData, setOriginalData] = useState({
        selectedBranchType: 0,
        branchname: '',
        selectedBusinessSector: 0,
        selectedRegion: 0,
        address: '',
        district: '',
        amphoe: '',
        province: '',
        zipcode: '',
        landmark: '',
        phone: '',
        lat: '',
        lag: '',
    })


    const [error, setError] = useState<FormBranchDataErrors>({
        selectedBranchType: '',
        branchname: '',
        selectedBusinessSector: '',
        selectedRegion: '',
        address: '',
        district: '',
        amphoe: '',
        province: '',
        zipcode: '',
        landmark: '',
        phone: '',
        lat: '',
        lag: '',
    });

    const handleFieldChange = (fieldName: string, value: unknown) => {
        const formData: FormBranchData = {
            selectedBranchType,
            branchname,
            selectedBusinessSector,
            selectedRegion,
            address,
            district,
            amphoe,
            province,
            zipcode,
            landmark,
            phone,
            lat,
            lag,
        };

        const updateFormData = {
            ...formData,
            [fieldName]: value
        }

        const errors = validataBranchForm(updateFormData)
        setError(prevErrors => ({
            ...prevErrors,
            [fieldName]: errors[fieldName]
        }))
    }
    useEffect(() => {
        const fetchData = async () => {
            if (!branchID) return;
            try {
                const response = await apiFetch(
                    `/api/auther/showBranchAPI/${branchID}`,
                );

                const data = await response.json();

                const branch = data.data || {};

                setSelectedBranchType(branch.type || "");
                setBranchname(branch.name || "");
                setSelectedBusinessSector(branch.region || 0);
                setSelectedRegione(branch.area || 0);
                setAddress(branch.address || "");
                setDistrict(branch.districtname || "");
                setAmphoe(branch.amphurname || "");
                setProvince(branch.provincename || "");
                setZipcode(branch.zipcode || "");
                setLandmark(branch.detail || "");
                setPhone(branch.tel || "");
                setLat(branch.lat || "");
                setLlag(branch.lng || "");

                setOriginalData({
                    selectedBranchType: branch.type || "",
                    branchname: branch.name || "",
                    selectedBusinessSector: branch.region || 0,
                    selectedRegion: branch.area || 0,
                    address: branch.address || "",
                    district: branch.districtname || "",
                    amphoe: branch.amphurname || "",
                    province: branch.provincename || "",
                    zipcode: branch.zipcode || "",
                    landmark: branch.detail || "",
                    phone: branch.tel || "",
                    lat:branch.lat || "",
                    lag: branch.lng || "",
                })

            } catch (error) {
                console.error("Error loading Brander details:", error);

            }
        }
        fetchData()
    }, [branchID])
    const hasChanges = () => (
        selectedBranchType !== originalData.selectedBranchType ||
        branchname !== originalData.branchname,
        selectedBusinessSector !== originalData.selectedBusinessSector,
        selectedRegion !== originalData.selectedRegion,
        address !== originalData.address,
        district !== originalData.district,
        amphoe !== originalData.amphoe,
        province !== originalData.province,
        zipcode !== originalData.zipcode,
        landmark !== originalData.landmark,
        phone !== originalData.phone,
        lat !== originalData.lat,
        lag !== originalData.lag
    )
    const handleBranchSubmit = async () => {
        if (!hasChanges()) {
            setNotify({
                isOpen: true,
                message: 'ไม่มีการเปลี่ยนแปลงข้อมูล',
                type: 'info',
            });
            return;
        }
        const formData = {
            selectedBranchType,
            branchname,
            selectedBusinessSector,
            selectedRegion,
            address,
            district,
            amphoe,
            province,
            zipcode,
            landmark,
            phone,
            lat,
            lag,
        };

        const errors = validataBranchForm(formData);
        if (Object.values(errors).some((error) => error)) {
            setError(errors);
            return;
        }
        const changes: string[] = [];

        if (originalData.selectedBranchType !== selectedBranchType) {
            changes.push(`ประเภทหน่วยงาน "${originalData.selectedBranchType}" เป็น "${selectedBranchType}"`);
        }
        if (originalData.branchname !== branchname) {
            changes.push(`ชื่อหน่วยงาน "${originalData.branchname}" เป็น "${branchname}"`);
        }
        if (originalData.selectedBusinessSector !== selectedBusinessSector) {
            changes.push(`เขตธุรกิจ  "${originalData.selectedBusinessSector}" เป็น "${selectedBusinessSector}"`);
        }
        if (originalData.selectedRegion !== selectedRegion) {
            changes.push(`ภาคธุรกิจ   "${originalData.selectedRegion}" เป็น "${selectedRegion}"`);
        }
        if (originalData.address !== address) {
            changes.push(`ที่อยู่   "${originalData.address}" เป็น "${address}"`);
        }
        if (originalData.district !== district) {
            changes.push(`ตำบล   "${originalData.district}" เป็น "${district}"`);
        }
        if (originalData.amphoe !== amphoe) {
            changes.push(`อำเภอ   "${originalData.amphoe}" เป็น "${amphoe}"`);
        }
        if (originalData.province !== province) {
            changes.push(`จังหวัด   "${originalData.province}" เป็น "${province}"`);
        }
        if (originalData.zipcode !== zipcode) {
            changes.push(`รหัสไปรษณีย์   "${originalData.zipcode}" เป็น "${zipcode}"`);
        }
        if (originalData.landmark !== landmark) {
            changes.push(`รายละเอียดสาขา/จุดตลาด   "${originalData.landmark}" เป็น "${landmark}"`);
        }
        if (originalData.phone !== phone) {
            changes.push(`หมายเลขโทรศัพท์  "${originalData.phone}" เป็น "${phone}"`);
        }
        if (originalData.lat !== lat) {
            changes.push(`พิกัดละติจูด  "${originalData.lat}" เป็น "${lat}"`);
        }
        if (originalData.lag !== lag) {
            changes.push(`พิกัดลองจิจูด  "${originalData.lag}" เป็น "${lag}"`);
        }

        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: async () => {
                setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
                try {

                    const response = await apiFetch(`/api/auther/updateBranchAPI/${branchID}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            branchType: selectedBranchType,
                            branchname: branchname,
                            businessSector: selectedBusinessSector,
                            region: selectedRegion,
                            address: address,
                            districtID: districtID,
                            district: district,
                            amphoeID: amphoeID,
                            amphoe: amphoe,
                            provinceID: provinceID,
                            province: province,
                            zipcode: zipcode,
                            landmark: landmark,
                            phone: phone,
                            lat: lat,
                            lag: lag,
                            updatename: fullnamePer
                        }),
                    });

                    const responseData = await response.json();

                    if (!response.ok) {
                        throw new Error(responseData.message || "สร้างข้อมูลไม่สำเร็จ");
                    }
                    const changes: string[] = [];


                    const actionDetail = `ฟอร์มแก้ไขข้อมูลหน่วยงาน รหัสสาขาID: ${branchID} ${changes.length > 0 ? changes.join(', ') : ''
                        }`;
                    const payloadlog = {
                        actionType: 10,
                        actionDetail: actionDetail,
                        typeUser,
                        datatype: 'ค้นหาสาขา',
                        dataID: branchID,
                        dataname: branchname,
                        IDPer,
                        FullPer: fullnamePer
                    };

                    await apiFetch(`/api/auther/log`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payloadlog),
                    });
                    // ---------- UI FEEDBACK ----------
                    navigate("/Branch", {
                        state: {
                            notify: {
                                message: "เพิ่มข้อมูลสาขาสำเร็จ",
                                type: "success",
                            },
                        },
                    });

                } catch (error) {
                    let errorMessage = "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
                    if (error instanceof Error) {
                        errorMessage = error.message;
                    }
                    setNotify({
                        isOpen: true,
                        message: errorMessage,
                        type: "error",
                    });
                } finally {
                    setConfirmDialog({ isOpen: false, isLoading: false, onConfirm: () => { } });
                }
            }
        })
    }

    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6, xl: 3 }}>
                <BasicDropDownseletedata
                    selecte={selectedBranchType}
                    setSelected={setSelectedBranchType}
                    handleFieldChange={handleFieldChange}
                    error={error.selectedBranchType}
                    statusOptions={dataBranchType}
                    topon={0}
                    fieldKey="selectedBranchType"
                    specify={true}
                    titlename="ประเภทหน่วยงาน"
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 5 }}>
                <BasicTextField
                    name="ชื่อหน่วยงาน"
                    titlename="กรุณากรอกสาขา/หน่วย/สำนักงาน"
                    subject={branchname}
                    setsubject={setBranchname}
                    handleFieldChange={handleFieldChange}
                    error={error.branchname}
                    topon={0}
                    fieldKey="branchname"
                    specify={true}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <BasicDropDownselete
                    selecte={selectedRegion}
                    setSelected={setSelectedRegione}
                    nameroutes="areaapi"
                    handleFieldChange={handleFieldChange}
                    error={error.selectedRegion}
                    topon={0}
                    fieldKey="selectedRegion"
                    specify={true}
                    titlename="เขตธุรกิจ"
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
                <BasicDropDownseletedata
                    selecte={selectedBusinessSector}
                    setSelected={setSelectedBusinessSector}
                    handleFieldChange={handleFieldChange}
                    error={error.selectedBusinessSector}
                    statusOptions={dataBusinessSector}
                    topon={0}
                    fieldKey="selectedBusinessSector"
                    specify={true}
                    titlename="ภาคธุรกิจ"
                />
            </Grid>
            <Grid size={{ xs: 12, xl: 8 }}>
                <BasicTextChipModel
                    name="หมายเลขโทรศัพท์"
                    titlename="กรุณากรอกหมายเลขโทรศัพท์"
                    subject={phone}
                    setsubject={setPhone}
                    handleFieldChange={handleFieldChange}
                    error={error.phone}
                    topon={0}
                    fieldKey="phone"
                    specify={true}
                />
            </Grid>
            <Grid size={12}>
                <BasicTextFieldDetail
                    name="รายละเอียดสาขา/จุดตลาด"
                    titlename="กรุณากรอกสาขา/หน่วย/สำนักงาน"
                    subject={landmark}
                    setsubject={setLandmark}
                    handleFieldChange={handleFieldChange}
                    error={error.landmark}
                    topon={0}
                    row={4}
                    fieldKey="landmark"
                    specify={true}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 12 }}>
                <MenuAddressNumber
                    address={address}
                    setAddress={setAddress}

                    district={district}
                    setDistrict={setDistrict}

                    amphoe={amphoe}
                    setAmphoe={setAmphoe}

                    province={province}
                    setProvince={setProvince}

                    zipcode={zipcode}
                    setZipcode={setZipcode}

                    setDistrictID={setDistrictID}
                    setAmphoeID={setAmphoeID}
                    setProvinceID={setProvinceID}

                    handleFieldChange={handleFieldChange}
                    fieldKeyPrefix="userAddress"
                    error={error.address}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <BasicTextField
                    name="พิกัดละติจูด"
                    titlename="กรุณากรอกพิกัดละติจูด"
                    subject={lat}
                    setsubject={setLat}
                    handleFieldChange={handleFieldChange}
                    error={error.lat}
                    topon={0}
                    fieldKey="lat"
                    specify={true}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <BasicTextField
                    name="พิกัดลองจิจูด"
                    titlename="กรุณากรอกพิกัดลองจิจูด"
                    subject={lag}
                    setsubject={setLlag}
                    handleFieldChange={handleFieldChange}
                    error={error.lag}
                    topon={0}
                    fieldKey="lag"
                    specify={true}
                />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        width: '100%',
                        mt: 2
                    }}
                >
                    <TextButton
                        onClick={handleBranchSubmit}
                        sx={{ backgroundColor: theme.palette.warning.main }}
                    >
                        แก้ไขข้อมูล
                    </TextButton>
                </Box>
            </Grid>
        </Grid>
    )
}

export default ComponentsBranchEditForm
