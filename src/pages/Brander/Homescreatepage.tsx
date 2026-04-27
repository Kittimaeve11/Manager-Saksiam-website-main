import { Box, Container, Grid, Paper, Typography, useTheme } from '@mui/material'
import React, { useState } from 'react'
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { FormBannerData, FormBannerDataErrors } from '../../utils/types';
import { validataBannerForm } from '../../utils/validation';
import { apiFetch } from '../../API/client';
import TextButton from '../../components/Model/Buttom/TextButton';
import BasicTextField from '../../components/Model/TextField/BasicTextField';
import BoxUploadBanner from '../../components/Model/Upload/BoxUploadBanner';
import ConfirmDialog from '../../components/Model/Pop_up/ConfirmDialog';
import Notifications from '../../components/Model/Pop_up/Notifications';

const Homescreatepage = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [brandername, setBranderName] = useState("");
    const [linkpage, setLinkPage] = useState("");
    const [picturePC, setPicturePC] = useState<File | null>(null);
    const [pictureMoblie, setPictureMoblie] = useState<File | null>(null);
    const [error, setError] = useState<FormBannerDataErrors>({
        brandername: '',
        picturePC: '',
        pictureMoblie: ''
    })

    const [notify, setNotify] = useState({
        isOpen: false,
        message: "",
        type: "success" as "success" | "error" | "warning" | "info",
    });

    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        isLoading: false,
        onConfirm: () => { }
    });

    const handleFieldChange = (fieldName: string, value: unknown) => {
        const formData: FormBannerData = {
            brandername,
            picturePC,
            pictureMoblie,
        }
        const updateFormData = {
            ...formData,
            [fieldName]: value
        }

        const errors = validataBannerForm(updateFormData)
        setError(prevErrors => ({
            ...prevErrors,
            [fieldName]: errors[fieldName]
        }))
    }


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const branderfomeData = {
            brandername,
            picturePC,
            pictureMoblie,
        }
        const errors = validataBannerForm(branderfomeData)

        if (Object.values(errors).some((error) => error)) {
            setError(errors);
            return;
        }
        const formDataAddbrander = new FormData()
        if (picturePC !== null) {
            formDataAddbrander.append('picturePC', picturePC)
        }
        if (pictureMoblie !== null) {
            formDataAddbrander.append('pictureMoblie', pictureMoblie)
        }
        formDataAddbrander.append('bannername', brandername);
        formDataAddbrander.append('linkpage', linkpage);
        formDataAddbrander.append('typename', "หน้าหลัก");
        formDataAddbrander.append('active', "1");
        formDataAddbrander.append('savename', `${user?.fname} ${user?.lname}`);

        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: () => handleConfirmSubmit(formDataAddbrander)
        });
    }


    const handleConfirmSubmit = async (formData: FormData) => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
            // ---------- CREATE BRANDER API ----------
            const response = await apiFetch(`/api/auther/createbannerAPI`, {
                method: "POST",
                body: formData,
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || "สร้างข้อมูลไม่สำเร็จ");
            }

            const branderID = responseData.data?.int_saksolar_brander_ID;

            // ---------- LOG API ----------
            const payloadlog = {
                actionType: 8,
                actionDetail: `ฟอร์มเพิ่มแบนเนอร์หน้าหลัก | รหัสแบนเนอร์: ${branderID} | ชื่อแบนเนอร์: ${brandername} ${linkpage ? `(ลิงค์: ${linkpage})` : ""
                    }`,
                typeUser: user?.role_name,
                datatype: "หน้าแบนเนอร์",
                dataID: branderID,
                dataname: brandername,
                IDPer: user?.id,
                FullPer: `${user?.fname} ${user?.lname}`,
            };

            await apiFetch(`/api/auther/log`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payloadlog),
            });

            navigate("/Banner", {
                state: {
                    notify: {
                        message: "เพิ่มข้อมูลแบนเนอร์สำเร็จ",
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
    };

    return (
        <Container maxWidth='xl'>
            <Paper
                elevation={0}
                sx={{
                    mt: 5,
                    py: 5,
                    borderRadius: 3,
                    width: '100%',
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.darker : "white"
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        width: '100%',
                        flexWrap: 'nowrap',
                        gap: 2,
                        px: 3,
                        pb: 4
                    }}
                >
                    <Typography variant="h6" component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                        ฟอร์มการบันทึกข้อมูลแบนเนอร์
                    </Typography>
                    <Box width='100%' sx={{ px: { xs: 2, sm: 5 } }}>
                        <Grid container spacing={5}>
                            <Grid size={{ xs: 12, xl: 6 }}>
                                <BasicTextField
                                    name="ชื่อแบนเนอร์"
                                    titlename="กรุณากรอกชื่อแบนเนอร์"
                                    subject={brandername}
                                    setsubject={setBranderName}
                                    handleFieldChange={handleFieldChange}
                                    error={error.brandername}
                                    topon={0}
                                    fieldKey="brandername"
                                    specify={true}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, xl: 6 }}>
                                <BasicTextField
                                    name="ลิงค์หน้าผลิตภัณฑ์"
                                    titlename="https://solar/your-product-link/productnumber"
                                    subject={linkpage}
                                    setsubject={setLinkPage}
                                    handleFieldChange={handleFieldChange}
                                    error={error.linkpage}
                                    topon={0}
                                    fieldKey="linkpage"
                                    specify={false}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, xl: 12 }}>
                                <BoxUploadBanner
                                    filepicturePC={picturePC}
                                    filpictureMoblie={pictureMoblie}
                                    setFilepicturePC={setPicturePC}
                                    setFilepictureMoblie={setPictureMoblie}
                                    fieldKey1="picturePC"
                                    fieldKey2="pictureMoblie"
                                    error1={error.picturePC}
                                    error2={error.pictureMoblie}
                                    handleFieldChange={handleFieldChange}
                                    loading={null}
                                    topon={0}
                                />
                            </Grid>
                        </Grid>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                mt: 7
                            }}
                        >

                            <TextButton
                                onClick={handleSubmit}
                            >
                                บันทึกข้อมูล
                            </TextButton>
                        </Box>
                    </Box>
                </Box>
            </Paper>
            <ConfirmDialog
                type='add'
                confirmDialog={confirmDialog}
                setConfirmDialog={setConfirmDialog}
            />
            <Notifications notify={notify} setNotify={setNotify} />
        </Container>
    )
}

export default Homescreatepage
