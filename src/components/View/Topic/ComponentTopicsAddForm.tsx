import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react'
import type { FormTopicsData, FormTopicsDataErrors, PayloadType } from '../../../utils/types';
import { validataTopicsForm } from '../../../utils/validation';
import { apiFetch } from '../../../API/client';
import TextButton from '../../Buttom/TextButton';
import BasicTextField from '../../Model/TextField/BasicTextField';
import ConfirmDialog from '../../Model/Pop_up/ConfirmDialog';


interface ComponentTopicsAddFormProps {
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

}

const ComponentTopicsAddForm: React.FC<ComponentTopicsAddFormProps> = ({
    fullnamePer,
    typeUser,
    IDPer,
    setOpenPopup,
    setNotify,
    fetchshowTopics,
    page,
    rowsPerPage,
}) => {
    const theme = useTheme();
    const [topicnameTH, setTopicnameTH] = useState("")
    const [topicnameEN, setTopicnameEN] = useState("")

    const [error, setError] = useState<FormTopicsDataErrors>({
        topicnameTH: '',
        topicnameEN: '',
    });

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

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const formData = {
            topicnameTH,
            topicnameEN
        };

        const errors = validataTopicsForm(formData);
        if (Object.values(errors).some((error) => error)) {
            setError(errors);
            return;
        }
        const payload = {
            nameTH: topicnameTH,
            nameEN: topicnameEN,
            savename: fullnamePer,
            active: "1"
        };

        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: () => handleConfirmSubmit(payload)
        });
    }
    const handleConfirmSubmit = async (payload: PayloadType) => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        try {
            const response = await apiFetch(
                `/api/auther/createTopicAPI`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }
            );
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || "สร้างข้อมูลไม่สำเร็จ");
            }

            const TypeProductID = responseData.int_saksolar_topic_id;
            const payloadlog = {
                actionType: 8,
                actionDetail: `ฟอร์มเพิ่มข้อมูลหัวข้อแบบสอบถาม รหัสหัวข้อแบบสอบถาม: ${TypeProductID} หัวข้อแบบสอบถามภาษาไทย: ${topicnameTH}`,
                typeUser,
                datatype: 'หัวข้อแบบสอบถาม',
                dataID: TypeProductID,
                dataname: topicnameTH,
                IDPer,
                FullPer: fullnamePer
            };
            await apiFetch(`/api/auther/log`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloadlog),
            });
            setNotify({
                isOpen: true,
                message: 'บันทึกข้อมูลสำเร็จ!',
                type: 'success',
            });
            fetchshowTopics(page, rowsPerPage)
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
                    flexDirection:  'column' ,
                    justifyContent: { xs: 'flex-start', lg: 'space-between' },
                    alignItems: 'flex-start',
                    width: '100%',
                    flexWrap: 'nowrap',
                    gap: 2,
                    px: { xs: 2, sm: 5 },
                    mb:2
                }}
            >
                <Typography variant="h6" component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                    ฟอร์มการบันทึกข้อมูลหัวข้อแบบสอบถาม
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
                                    sx={{ backgroundColor: theme.palette.secondary.main }}
                                >
                                    บันทึกข้อมูล
                                </TextButton>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
             <ConfirmDialog
                type='add'
                confirmDialog={confirmDialog}
                setConfirmDialog={setConfirmDialog}
            />
        </Paper>
    )
}

export default ComponentTopicsAddForm
