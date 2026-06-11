import { Box, Grid } from '@mui/material';
import React, { useState } from 'react'
import BasicDropDownseletedata from '../../Model/Dropdown/BasicDropDownseletedata';
import { dataBranchType, dataBusinessSector } from '../../../API/StausData';
import type { FormBranchData, FormBranchDataErrors, PayloadBranch } from '../../../utils/types';
import { validataBranchForm } from '../../../utils/validation';
import { apiFetch } from '../../../API/client';
import { useNavigate } from 'react-router-dom';
import BasicTextField from '../../Model/TextField/BasicTextField';
import BasicDropDownselete from '../../Model/Dropdown/BasicDropDownselete';
import MenuAddressNumber from '../../Model/Dropdown/MenuAddressNumber';
import BasicTextFieldDetail from '../../Model/TextField/BasicTextFieldDetail';
import BasicTextChipModel from '../../Model/TextField/BasicTextChipModel';
import TextButton from '../../Buttom/TextButton';

interface ComponentsBranchAddFormProps {
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

const ComponentsBranchAddForm: React.FC<ComponentsBranchAddFormProps> = ({
    setConfirmDialog,
    setNotify,
    fullnamePer,
    typeUser,
    IDPer,
}) => {
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

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
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
        const payload = {
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
            savename: fullnamePer,
            active: "1"
        };

        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: () => handleConfirmSubmit(payload)
        });
    }

    const handleConfirmSubmit = async (payload: PayloadBranch) => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        try {
            const response = await apiFetch(
                `/api/auther/createBranchAPI`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }
            );
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || "สร้างข้อมูลไม่สำเร็จ");
            }

            const TypeProductID = responseData.int_saksiam_branch_id;
            const payloadlog = {
                actionType: 9,
                actionDetail: `ฟอร์มเพิ่มข้อมูลค้นหาหน่วยงาน รหัสสาขา: ${TypeProductID} ชื่อสาขา/หน้วย/สำนักงาน:${branchname}`,
                typeUser,
                datatype: 'ค้นหาสาขา',
                dataID: TypeProductID,
                dataname: branchname,
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
            setConfirmDialog({
                isOpen: false,
                isLoading: false,
                onConfirm: () => { },
            });
        }
    }
    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12,md:6 ,xl: 3 }}>
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
            <Grid size={{ xs: 12,md:6 , xl: 5 }}>
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

            <Grid size={{ xs: 12,md:6 , xl: 4 }}>
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
            <Grid size={{ xs: 12,md:6 , xl: 4 }}>
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
            <Grid size={ 12 }>
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
                    <TextButton onClick={handleSubmit}>
                        บันทึกข้อมูล
                    </TextButton>
                </Box>
            </Grid>

        </Grid>
    )
}

export default ComponentsBranchAddForm
