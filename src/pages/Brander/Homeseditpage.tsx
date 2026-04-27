import { Box, Container, Grid, Paper, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../Context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import type { FormBannerData, FormBannerDataErrors } from '../../utils/types';
import { validataBannerForm } from '../../utils/validation';
import BasicTextField from '../../components/Model/TextField/BasicTextField';
import BoxUploadBanner from '../../components/Model/Upload/BoxUploadBanner';
import Notifications from '../../components/Model/Pop_up/Notifications';
import ConfirmDialog from '../../components/Model/Pop_up/ConfirmDialog';
import TextButton from '../../components/Model/Buttom/TextButton';
import { apiFetch } from '../../API/client';

const Homeseditpage = () => {
    const { id } = useParams();
    const BranderID = id ? Number(id) : undefined;
    const theme = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [brandername, setBranderName] = useState("");
    const [linkpage, setLinkPage] = useState("");
    const [picturePC, setPicturePC] = useState<File | null>(null);
    const [pictureMoblie, setPictureMoblie] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [originalData, setOriginalData] = useState({
        brandername: '',
        linkpage: '',
        picturePC: null as string | File | null,
        pictureMoblie: null as string | File | null
    })

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
    useEffect(() => {
        const fetchData = async () => {
            if (!BranderID) return;

            setLoading(true);

            try {
                const response = await apiFetch(
                    `/api/auther/showbannerIDAPI/${BranderID}`,
                );

                const data = await response.json();

                const brand = data.data || {};

                setBranderName(brand.name || "");
                setLinkPage(brand.link || "");
                setPicturePC(brand.picturePC || "");
                setPictureMoblie(brand.pictureMoblie || "");

                setOriginalData({
                    brandername: brand.name || "",
                    linkpage: brand.link || "",
                    picturePC: brand.picturePC || "",
                    pictureMoblie: brand.pictureMoblie || "",
                });

            } catch (error) {
                console.error("Error loading Brander details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [BranderID]);

    const handleBranderSubmit = async (brander: React.FormEvent) => {
        brander.preventDefault();
        const branderformData = {
            brandername,
            linkpage,
            picturePC,
            pictureMoblie
        }
        const errors = validataBannerForm(branderformData)
        if (Object.values(errors).some((error) => error)) {
            setError(errors);
            return;
        }

        let hasChanges = false;
        const formData = new FormData();

        if (brandername !== originalData.brandername) {
            formData.append('brandername', brandername)
            hasChanges = true;
        }

        if (linkpage !== originalData.linkpage) {
            formData.append('linkpage', linkpage)
            hasChanges = true;
        }

        if (picturePC !== null && picturePC !== originalData.picturePC) {
            if (typeof picturePC !== 'string') {
                formData.append('picturePC', picturePC)
            }
            hasChanges = true;
        }

        if (pictureMoblie !== null && pictureMoblie !== originalData.pictureMoblie) {
            if (typeof pictureMoblie !== 'string') {
                formData.append('pictureMoblie', pictureMoblie)
            }
            hasChanges = true;
        }


        if (!hasChanges) {
            setNotify({
                isOpen: true,
                message: 'ไม่มีการเปลี่ยนแปลงข้อมูล',
                type: 'info',
            });
            return;
        }
        formData.append('updatename', `${user?.fname} ${user?.lname}`);

        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: () => handleConfirmSubmit(formData)
        });
    }

    const handleConfirmSubmit = async (FormData: FormData) => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
            // ---------- UPDATE API ----------
            const response = await apiFetch(`/api/auther/updatebannerAPI/${BranderID}`, {
                method: "POST",
                body: FormData,
            });

            if (!response.ok) {
                throw new Error("Update failed");
            }

            // ---------- CHECK CHANGES ----------
            const changes: string[] = [];

            if (originalData.brandername !== brandername) {
                changes.push(`ชื่อแบนเนอร์ "${originalData.brandername}" → "${brandername}"`);
            }
            if (originalData.linkpage !== linkpage) {
                changes.push(`ลิงค์หน้าผลิตภัณฑ์ "${originalData.linkpage}" → "${linkpage}"`);
            }
            if (originalData.picturePC !== picturePC) {
                changes.push(`รูปแบนเนอร์ขนาดเดสก์ท็อป`);
            }
            if (originalData.pictureMoblie !== pictureMoblie) {
                changes.push(`รูปแบนเนอร์ขนาดโทรศัพท์`);
            }

            const actionDetail = `ฟอร์มแก้ไขแบนเนอร์หน้าหลัก | ID: ${BranderID} ${changes.length > 0 ? changes.join(", ") : ""
                }`;

            // ---------- LOG API ----------
            const payloadlog = {
                actionType: 9,
                actionDetail,
                typeUser: user?.role_name,
                datatype: "หน้าหลัก",
                dataID: BranderID,
                dataname: brandername,
                IDPer: user?.id,
                FullPer: `${user?.fname} ${user?.lname}`,
            };

            await apiFetch(`/api/auther/log`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloadlog),
            });


            // ---------- UI FEEDBACK ----------
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
                                    loading={loading}
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
                                onClick={handleBranderSubmit}
                                sx={{ backgroundColor: theme.palette.warning.main }}
                            >
                                แก้ไขข้อมูล
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

export default Homeseditpage
