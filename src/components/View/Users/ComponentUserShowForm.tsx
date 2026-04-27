import { Box, Card, Fade, Grid, Typography, useTheme } from '@mui/material'
import React, { useEffect, useState } from 'react'
import type { AutherItems } from '../../../utils/types'
import { apiFetch } from '../../../API/client'
import NoImage from '../../../assets/Image/avatar-2.png'
import formatDate from '../../../utils/Format/format-date'
import ConfirmDialog from '../../Model/Pop_up/ConfirmDialog'
import SwitchButton from '../../Model/Buttom/SwitchButton'

interface ComponentUserShowFormProps {
    personelID: number | null
    fullnamePer: string
    typeUser: string
    IDPer: string
    onClose: () => void;
    handleRowClick: (reviewID: number) => void
    setNotify: React.Dispatch<React.SetStateAction<{
        isOpen: boolean;
        message: string;
        type: "success" | "error" | "warning" | "info";
    }>>;
    fetchUsers: (page: number, rowsPerPage: number) => void;
    page: number
    rowsPerPage: number
}
const BASE_URL_API = import.meta.env.VITE_BASE_URL_API_PHOTO;

const ComponentUserShowForm: React.FC<ComponentUserShowFormProps> = ({
    fullnamePer,
    personelID,
    typeUser,
    onClose,
    handleRowClick,
    setNotify,
    fetchUsers,
    page,
    rowsPerPage,
    IDPer
}) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);

    const [personelData, setPersonelData] = useState<AutherItems>()

    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        isLoading: false,
        onConfirm: () => { }
    });

    useEffect(() => {
        const fetchPersonel = async () => {
            if (!personelID) return;

            try {
                const response = await apiFetch(`/api/auther/showUserAPI/${personelID}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await response.json();
                setPersonelData(data.data || null);
            } catch (error) {
                console.error("Error fetching review details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPersonel()
    }, [personelID])

    const handleStatusChange = async (personelID: number, currentStatus: string) => {
        const active = currentStatus === "0" ? "1" : "0";
        const payload = new FormData();
        payload.append('status', active);
        payload.append('changename', fullnamePer);
        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: async () => {
                setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
                try {
                    const response = await apiFetch(`/api/auther/updateUserAPI/${personelID}`, {
                        method: "POST",
                        body: payload,
                    });

                    if (response.ok) {
                        setNotify({
                            isOpen: true,
                            message: 'เปลี่ยนแปลงสถานะสำเร็จ!',
                            type: 'success',
                        });
                        const payloadlog = {
                            actionType: 15,
                            actionDetail: `เปลี่ยนสถานะ รหัสผู้ใช้งาน: ${personelID}  เป็น ${active === "1" ? "ยังคงอยู่" : "ออก"}`,
                            typeUser,
                            datatype: 'ผู้ใช้งาน',
                            dataID: personelID,
                            dataname: `${personelData?.personnel_pname} ${personelData?.personnel_fname} ${personelData?.personnel_lname}`,
                            IDPer,
                            FullPer: fullnamePer,
                        };
                        await apiFetch(`/api/auther/log`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payloadlog),
                        });
                        fetchUsers(page, rowsPerPage);
                        if (personelID !== null) {
                            handleRowClick(personelID);
                        }
                    }
                } catch (error) {
                    console.error("Error updating status:", error);
                    setNotify({
                        isOpen: true,
                        message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ',
                        type: 'error',
                    });
                } finally {
                    setConfirmDialog({
                        isOpen: false,
                        isLoading: false,
                        onConfirm: () => { },
                    });
                    onClose();
                }
            }
        })
    }
    if (loading) {
        return (
            <Card
                variant="outlined"
                sx={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    alignItems: 'center',
                    gap: 1,
                    width: '100%',
                    border: '1px solid transparent',
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.darker : theme.palette.common.white,
                }}
            >
                <Box
                    sx={{
                        textAlign: 'left',
                        width: '100%',
                        maxWidth: '900px',
                        margin: '0 auto'
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid size={12} sx={{ backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.info.darker, px: 2.5 }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: { xs: 'flex-start', md: 'space-between' }, alignItems: { sx: 'left', md: 'center' }, ml: 2, my: 1.5, color: 'white', gap: 1.5, }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', md: 'row' },
                                        justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                        alignItems: { xs: 'flex-start', md: 'center' },
                                        mb: { xs: 0.5, md: 0 },
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        component="span"
                                        sx={{ mr: 1, mb: { xs: 0.5, md: 0 } }}
                                    >
                                        ข้อมูลส่วนตัวข้องผู้ใช้งาน
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }} >
                            <Box sx={{ pl: { xs: 0, md: 2 }, mx: { xs: 2, md: 0 }, mb: 2 }}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        textAlign: 'left',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        alignItems: 'flex-start',
                                        gap: 1,
                                        width: '100%',
                                        border: '1px solid transparent',
                                        padding: 2,
                                        height: 380
                                    }}
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Box sx={{ ml: 2, mt: 1 }}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        textAlign: 'left',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        alignItems: 'flex-start',
                                        gap: 1,
                                        width: '100%',
                                        border: '1px solid transparent',
                                        padding: 2,
                                        height: 400
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Card>
        )
    }
    return (
        <Card
            variant="outlined"
            sx={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                border: '1px solid transparent',
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.darker : theme.palette.common.white,
            }}
        >
            <Box sx={{
                textAlign: 'left',
                width: '100%',
                maxWidth: '900px',
                margin: '0 auto',
            }}>
                {personelData && (
                    <Grid container spacing={2}>
                        <Grid size={12} sx={{ backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.primary.main, px: 2.5 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    justifyContent: { xs: 'flex-start', md: 'space-between' },
                                    alignItems: { sx: 'left', md: 'center' },
                                    ml: 2,
                                    my: 1.5,
                                    color: 'white',
                                    gap: 1.5
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', md: 'row' },
                                        justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                        alignItems: { xs: 'flex-start', md: 'center' },
                                        mb: { xs: 0.5, md: 0 },
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        component="span"
                                        sx={{ mr: 1, mb: { xs: 0.5, md: 0 } }}
                                    >
                                        ข้อมูลส่วนตัวข้องผู้ใช้งาน
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        {(Number(personelData.status) === 1 || Number(personelData.status) === 0) && (
                            <Grid size={12} sx={{ textAlign: 'right', mr: 2 }}>
                                <Typography
                                    variant="body2"
                                    component="label"
                                    sx={{ alignItems: 'left', fontWeight: 400, mr: 1 }}
                                >
                                    ใช้งานอยู่ - ระงับ  สถานะผู้ใช้งาน
                                </Typography>
                                <SwitchButton
                                    checked={Number(personelData.status) === 1}
                                    handleChange={(event) =>
                                        handleStatusChange(personelData.personnel_ID, event.target.checked ? "0" : "1")
                                    }
                                />
                            </Grid>
                        )}
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Box sx={{ pl: { xs: 0, md: 2 }, mx: { xs: 2, md: 0 }, mb: 2 }}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        textAlign: 'left',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        alignItems: 'flex-start',
                                        gap: 1,
                                        width: '100%',
                                        border: '1px solid transparent',
                                        padding: 2,
                                        backgroundColor: 'transparent'
                                    }}
                                >
                                    <Fade in={true} timeout={2000}>
                                        <Box
                                            component="img"
                                            src={
                                                personelData?.photo
                                                    ? `${BASE_URL_API}/${personelData.photo}`
                                                    : NoImage
                                            }
                                            alt="Uploaded Preview"
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '100%',
                                                height: 'auto',
                                                maxWidth: '350px',
                                                maxHeight: '400px',
                                                margin: 'auto',
                                                my: 1
                                            }}
                                        />
                                    </Fade>
                                </Card>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Box sx={{ px: { xs: 2, md: 2 }, mb: 2 }}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        textAlign: 'left',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        alignItems: 'flex-start',
                                        gap: 1,
                                        width: '100%',
                                        border: '1px solid transparent',
                                        padding: 2,
                                        backgroundColor: 'transparent'
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body1" component="label" sx={{ alignItems: 'left', fontWeight: 400 }}>
                                            ชื่อ-นามสกุล :
                                            <span style={{ fontWeight: 300 }}> {personelData.personnel_pname} {personelData.personnel_fname} {personelData.personnel_lname}</span>
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" component="label" sx={{ alignItems: 'left', fontWeight: 400 }}>
                                            ชื่อเล่น :
                                            <span style={{ fontWeight: 300 }}> {personelData.nickname} </span>
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" component="label" sx={{ alignItems: 'left', fontWeight: 400 }}>
                                            เลขบัตรประชาชน :
                                            <span style={{ fontWeight: 300 }}> {personelData.IDCard} </span>
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" component="label" sx={{ alignItems: 'left', fontWeight: 400 }}>
                                            เบอร์โทร :
                                            <span style={{ fontWeight: 300 }}> {personelData.phone} </span>
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" component="label" sx={{ alignItems: 'left', fontWeight: 400 }}>
                                            เบอร์โทร 6 หลัก:
                                            <span style={{ fontWeight: 300 }}> {personelData.phone6} </span>
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" component="label" sx={{ alignItems: 'left', fontWeight: 400 }}>
                                            อีเมล:
                                            <span style={{ fontWeight: 300 }}> {personelData.email} </span>
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" component="label" sx={{ alignItems: 'left', fontWeight: 400 }}>
                                            วันเดือนปีเกิด:
                                            <span style={{ fontWeight: 300 }}> {formatDate(personelData.birthday)} </span>
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" component="label" sx={{ alignItems: 'left', fontWeight: 400 }}>
                                            ที่อยู่:
                                            <span style={{ fontWeight: 300 }}> {personelData.address} {personelData.amphoe} {personelData.district} {personelData.province} {personelData.zipcod}</span>
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" component="label" sx={{ alignItems: 'left', fontWeight: 400 }}>
                                            สิทธิการใช้งาน:
                                            <span style={{ fontWeight: 300 }}> {personelData.role_name}</span>
                                        </Typography>
                                    </Box>
                                    {personelData.updateby && (
                                        <>
                                            <Box >
                                                <Typography variant="body1" component="label" sx={{ alignItems: 'left', fontWeight: 400 }}>
                                                    ผู้แก้ไขข้อมูล :
                                                    <span style={{ fontWeight: 300 }}> {personelData.updateby}</span>
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{

                                                    width: '100%',
                                                    overflow: 'hidden',
                                                    whiteSpace: 'normal',
                                                    wordWrap: 'break-word',
                                                }}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    component="label"
                                                    sx={{
                                                        alignItems: 'left',
                                                        fontWeight: 400,
                                                        wordBreak: 'break-word',
                                                        overflowWrap: 'break-word',
                                                    }}
                                                >
                                                    วันที่มีการแก้ไขล่าสุด : &ensp;
                                                    <span
                                                        style={{
                                                            fontWeight: 300,
                                                            textDecoration: 'underline',

                                                        }}
                                                    >
                                                        {formatDate(personelData.updatedate)}
                                                    </span>
                                                </Typography>
                                            </Box>
                                        </>
                                    )}
                                </Card>
                            </Box>
                        </Grid>
                    </Grid>
                )}
            </Box>
            <ConfirmDialog
                type='status'
                confirmDialog={confirmDialog}
                setConfirmDialog={setConfirmDialog}
            />
        </Card>
    )
}

export default ComponentUserShowForm
