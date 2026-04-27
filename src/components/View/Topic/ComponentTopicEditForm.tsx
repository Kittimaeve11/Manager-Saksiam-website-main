import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react'
import type { FormTopicsData, FormTopicsDataErrors } from '../../../utils/types';
import { validataTopicsForm } from '../../../utils/validation';
import { apiFetch } from '../../../API/client';
import BasicTextField from '../../Model/TextField/BasicTextField';
import TextButton from '../../Model/Buttom/TextButton';
import ConfirmDialog from '../../Model/Pop_up/ConfirmDialog';

interface ComponentTopicsEditFormProps {
    fullnamePer: string
    IDPer: string
    typeUser: string
    setOpenPopup: React.Dispatch<React.SetStateAction<boolean>>;
    setNotify: React.Dispatch<React.SetStateAction<{
        isOpen: boolean;
        message: string;
        type: "success" | "error" | "warning" | "info";
    }>>;
    fetchshowTopics: (page: number, rowsPerPage: number) => void;
    page: number
    rowsPerPage: number
    topicId: number | null

}

const ComponentTopicEditForm: React.FC<ComponentTopicsEditFormProps> = ({
    fullnamePer,
    typeUser,
    IDPer,
    setOpenPopup,
    setNotify,
    fetchshowTopics,
    page,
    rowsPerPage,
    topicId
}) => {
    const theme = useTheme();
    const [topicnameTH, setTopicnameTH] = useState("")
    const [topicnameEN, setTopicnameEN] = useState("")

    const [originalData, setOriginalData] = useState({
        topicnameTH: '',
        topicnameEN: ''
    })
    const [error, setError] = useState<FormTopicsDataErrors>({
        topicnameTH: '',
        topicnameEN: '',
    });

    const hasChanges = () => (
        topicnameTH !== originalData.topicnameTH || topicnameEN !== originalData.topicnameEN
    )

    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        isLoading: false,
        onConfirm: () => { }
    });

    const handleFieldChange = (fieldName: string, value: unknown) => {
        const formData: FormTopicsData = {
            topicnameTH,
            topicnameEN
        };

        const updateFormData = {
            ...formData,
            [fieldName]: value
        }

        const errors = validataTopicsForm(updateFormData)
        setError(prevErrors => ({
            ...prevErrors,
            [fieldName]: errors[fieldName]
        }))
    }

    useEffect(() => {
        const fetchTopicDetail = async () => {
            if (!topicId) return;

            try {
                const response = await apiFetch(
                    `/api/auther/showTopicIDAPI/${topicId}`
                );

                const result = await response.json();
                const topic = result.data || {};

                setTopicnameTH(topic.nameTH || "");
                setTopicnameEN(topic.nameEN || "");

                setOriginalData({
                    topicnameTH: topic.nameTH || "",
                    topicnameEN: topic.nameEN || "",
                });

            } catch (error) {
                console.error("Error loading Topic details:", error);
            }
        };

        fetchTopicDetail();
    }, [topicId]);

    const handleSubmit = async () => {
        if (!hasChanges()) {
            setNotify({
                isOpen: true,
                message: 'ไม่มีการเปลี่ยนแปลงข้อมูล',
                type: 'info',
            });
            return;
        }
        const formData = {
            topicnameTH,
            topicnameEN
        };

        const errors = validataTopicsForm(formData);
        if (Object.values(errors).some((error) => error)) {
            setError(errors);
            return;
        }
        const changes: string[] = [];

        if (originalData.topicnameTH !== topicnameTH) {
            changes.push(`หัวข้อแบบสอบถามภาษาไทย "${originalData.topicnameTH}" เป็น "${topicnameTH}"`);
        }
        if (originalData.topicnameEN !== topicnameEN) {
            changes.push(`หัวข้อแบบสอบถามภาษาอังกฤษ "${originalData.topicnameEN}" เป็น "${topicnameEN}"`);
        }

        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: async () => {
                setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
                try {
                    const response = await apiFetch(`/api/auther/updateTopicAPI/${topicId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            nameTH: topicnameTH,
                            nameEN: topicnameEN,
                            updatename: fullnamePer
                        }),
                    });

                    const responseData = await response.json();

                    if (!response.ok) {
                        throw new Error(responseData.message || "สร้างข้อมูลไม่สำเร็จ");
                    }
                    const changes: string[] = [];
                    if (originalData.topicnameTH !== topicnameTH) {
                        changes.push(`หัวข้อแบบสอบถามภาษาไทย "${originalData.topicnameTH}" เป็น "${topicnameTH}"`);
                    }
                    if (originalData.topicnameEN !== topicnameEN) {
                        changes.push(`หัวข้อแบบสอบถามภาษาอังกฤษ"${originalData.topicnameEN}" เป็น "${topicnameEN}"`);
                    }

                    const actionDetail = `ฟอร์มแก้ไขหัวข้อแบบสอบถาม หัวข้อแบบสอบถามID: ${topicId} ${changes.length > 0 ? changes.join(', ') : ''
                        }`;
                    const payloadlog = {
                        actionType: 9,
                        actionDetail: actionDetail,
                        typeUser,
                        datatype: 'หัวข้อแบบสอบถาม',
                        dataID: topicId,
                        dataname: topicnameTH,
                        IDPer,
                        FullPer: fullnamePer
                    };

                    await apiFetch(`/api/auther/log`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payloadlog),
                    });
                    fetchshowTopics(page, rowsPerPage);
                    setNotify({
                        isOpen: true,
                        message: 'แก้ไขข้อมูลสำเร็จ!',
                        type: 'success',
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
                    setOpenPopup(false);
                }
            }
        })
    }

    return (
        <Paper
            elevation={0} sx={{
                mt: 5,
                py: 2,
                borderRadius: 3,
                width: '100%',
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.darker : "white"
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: { xs: 'flex-start', lg: 'space-between' },
                    alignItems: 'flex-start',
                    width: '100%',
                    flexWrap: 'nowrap',
                    gap: 2,
                    px: { xs: 2, sm: 5 },
                    mb: 2
                }}
            >
                <Typography variant="h6" component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                    ฟอร์มการแก้ไขข้อมูลหัวข้อแบบสอบถาม
                </Typography>
                <Box width='100%' >
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 5 }} >
                            <BasicTextField
                                name="หัวข้อแบบสอบถามภาษาไทย"
                                titlename="กรุณากรอกหัวข้อแบบสอบถามภาษาไทย"
                                subject={topicnameTH}
                                setsubject={setTopicnameTH}
                                handleFieldChange={handleFieldChange}
                                error={error.topicnameTH}
                                topon={0}
                                fieldKey="topicnameTH"
                                specify={true}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }} >
                            <BasicTextField
                                name="หัวข้อแบบสอบถามภาษาอังกฤษ"
                                titlename="กรุณากรอกหัวข้อแบบสอบถามภาษาอังกฤษ"
                                subject={topicnameEN}
                                setsubject={setTopicnameEN}
                                handleFieldChange={handleFieldChange}
                                error={error.topicnameEN}
                                topon={0}
                                fieldKey="topicnameEN"
                                specify={true}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }} >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    mt: 4
                                }}
                            >
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
            </Box>
            <ConfirmDialog
                type='edit'
                confirmDialog={confirmDialog}
                setConfirmDialog={setConfirmDialog}
            />

        </Paper>
    )
}

export default ComponentTopicEditForm
