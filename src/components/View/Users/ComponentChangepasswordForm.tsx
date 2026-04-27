import React, { useState } from 'react'
import { apiFetch, type ApiResponse } from '../../../API/client';
import { Box, Card, Grid, useTheme } from '@mui/material';
import type { ForChangePassword, ForChangePasswordErrors } from '../../../utils/types';
import { validataChangePasswordForm } from '../../../utils/validation';
import Notifications from '../../Model/Pop_up/Notifications';
import ConfirmDialog from '../../Model/Pop_up/ConfirmDialog';
import BasicTextField from '../../Model/TextField/BasicTextField';
import TextButton from '../../Model/Buttom/TextButton';

interface ComponentChangeFormProps {
    onClose: () => void;
    fullnamePer: string
    typeUser: string
    IDPer: string
}

const ComponentChangepasswordForm: React.FC<ComponentChangeFormProps> = ({
    onClose,
    IDPer,
    typeUser,
    fullnamePer
}) => {
    const theme = useTheme();
    const [passwordOld, setPasswordOld] = useState("")
    const [passwordNew, setPasswordNew] = useState("")
    const [passwordConform, setPasswordConform] = useState("")
    const [error, setError] = useState<ForChangePasswordErrors>({
        passwordOld: '',
        passwordNew: '',
        passwordConform: ''
    })
    const [notify, setNotify] = useState({
        isOpen: false,
        message: '',
        type: 'success' as 'success' | 'error' | 'warning' | 'info'
    });
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        isLoading: false,
        onConfirm: () => { }
    });

    const handleFieldChange = (fieldName: string, value: unknown) => {
        const formData: ForChangePassword = {
            passwordOld,
            passwordNew,
            passwordConform
        };
        const updateFormData = {
            ...formData,
            [fieldName]: value
        }

        const errors = validataChangePasswordForm(updateFormData)
        setError(prevErrors => ({
            ...prevErrors,
            [fieldName]: errors[fieldName]
        }))
    }
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const formData = {
            passwordOld,
            passwordNew,
            passwordConform
        }
        const errors = validataChangePasswordForm(formData)
        if (Object.values(errors).some((error) => error)) {
            setError(errors);
            return;
        }
        const fd = new FormData();
        fd.append('UserID', IDPer);
        fd.append('oldPassword', passwordOld);
        fd.append('newPassword', passwordNew);
        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: () => handleConfirmSubmit(fd)
        });
    }

    const handleConfirmSubmit = async (formData: FormData) => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
            const response = await apiFetch(
                `/api/auther/changePasswordapi`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const result: ApiResponse = await response.json();

            if (!result.status) {
                // ❌ รหัสผ่านเดิมไม่ถูกต้อง
                setNotify({
                    isOpen: true,
                    message: result.message || 'เกิดข้อผิดพลาด',
                    type: 'error',
                });
                return;
            }

            // ✅ สำเร็จ
            const payloadlog = {
                actionType: 9,
                actionDetail: `ฟอร์มเปลี่ยนรหัสผ่าน ผู้ใช้งานID: ${IDPer}`,
                typeUser,
                datatype: 'ผู้ใช้งาน',
                dataID: IDPer,
                dataname: fullnamePer,
                IDPer,
                FullPer: fullnamePer,
            };

            await apiFetch(`/api/auther/log`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloadlog),
            });

            setNotify({
                isOpen: true,
                message: 'เปลี่ยนรหัสผ่านสำเร็จ',
                type: 'success',
            });

            onClose();

        } catch (error) {
            console.error("Submission error:", error);
            setNotify({
                isOpen: true,
                message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
                type: 'error',
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
        <Card variant="outlined"
            sx={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                border: '1px solid transparent',
                backgroundColor:'transparent'
                // backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
            }}>
            <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{
                    textAlign: 'left',
                    width: '100%',
                    maxWidth: '900px',
                    margin: '0 auto',
                    mt:2
                }}
            >
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, lg: 12 }}>
                        <Box sx={{ mx: 2, mb: 2 }}>
                            <BasicTextField
                                name="รหัสผ่านเดิม"
                                titlename="กรุณากรอกรหัสผ่านเดิม"
                                subject={passwordOld}
                                setsubject={setPasswordOld}
                                handleFieldChange={handleFieldChange}
                                error={error.passwordOld}
                                topon={0}
                                fieldKey="passwordOld"
                                specify={true}
                            />
                            <BasicTextField
                                name="รหัสผ่านใหม่"
                                titlename="กรุณากรอกรหัสผ่านใหม่"
                                subject={passwordNew}
                                setsubject={setPasswordNew}
                                handleFieldChange={handleFieldChange}
                                error={error.passwordNew}
                                topon={2}
                                fieldKey="passwordNew"
                                specify={true}
                            />
                            <BasicTextField
                                name="ยืนยันรหัสผ่านใหม่"
                                titlename="กรุณากรอกยืนยันรหัสผ่านใหม่"
                                subject={passwordConform}
                                setsubject={setPasswordConform}
                                handleFieldChange={handleFieldChange}
                                error={error.passwordConform}
                                topon={2}
                                fieldKey="passwordConform"
                                specify={true}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                mt: 4,mb:2
                            }}
                        >
                            <TextButton
                                onClick={handleSubmit}
                                sx={{backgroundColor:theme.palette.secondary.main}}
                            >
                                บันทึกการเปลี่ยนรหัสผ่าน
                            </TextButton>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <ConfirmDialog
                type='edit'
                confirmDialog={confirmDialog}
                setConfirmDialog={setConfirmDialog}
            />
            <Notifications notify={notify} setNotify={setNotify} />
        </Card>
    )
}

export default ComponentChangepasswordForm
