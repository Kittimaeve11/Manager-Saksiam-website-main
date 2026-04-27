import { Box,  Dialog, DialogActions, DialogContent, DialogTitle, styled, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react'
import type { ConfirmDialogProps } from '../../../utils/types';
import loaddata from '../../../assets/Image/clock_time.gif';
import tick from '../../../assets/Image/success_confetti.gif';
import addIcon from '../../../assets/Image/Glassmorphic.gif';
import editIcon from '../../../assets/Image/Drawing.gif';
import deleteIcon from '../../../assets/Image/raccoon_bin.gif';
import alternateIcon from '../../../assets/Image/Copy.gif';
import statusIcon from '../../../assets/Image/click.gif';
import TextButton from '../Buttom/TextButton';


const AnimatedDialog = styled(Dialog)({
    '@keyframes pulse': {
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.05)' },
        '100%': { transform: 'scale(1)' },
    },
});
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    type,
    confirmDialog,
    setConfirmDialog,
}) => {
    const theme = useTheme();
    const [animate, setAnimate] = useState(false);

    const confirmConfig = {
        add: {
            icon: addIcon,
            title: 'ยืนยันการบันทึกข้อมูล',
            subtitle: 'คุณต้องการบันทึกข้อมูลนี้หรือไม่?',
            color: theme.palette.error.main,
        },
        edit: {
            icon: editIcon,
            title: 'ยืนยันการแก้ไขข้อมูล',
            subtitle: 'คุณต้องการแก้ไขข้อมูลนี้หรือไม่?',
            color: theme.palette.warning.main,
        },
        delete: {
            icon: deleteIcon,
            title: 'ยืนยันการลบข้อมูล',
            subtitle: 'คุณต้องการลบข้อมูลนี้หรือไม่?',
            color: theme.palette.error.main,
        },
        alternate: {
            icon: alternateIcon,
            title: 'ยืนยันการสลับตำแหน่งข้อมูล',
            subtitle: 'คุณต้องการสลับตำแหน่งข้อมูลนี้หรือไม่?',
            color: theme.palette.secondary.main,
        },
        status: {
            icon: statusIcon,
            title: 'ยืนยันการเปลี่ยนสถานะข้อมูล',
            subtitle: 'คุณต้องการเปลี่ยนสถานะข้อมูลนี้หรือไม่?',
            color: theme.palette.success.main,
        },
        approve: {
            icon: statusIcon,
            title: 'ยืนยันการอนุมัติข้อมูล',
            subtitle: 'คุณต้องการอนุมัติข้อมูลนี้หรือไม่?',
            color: theme.palette.error.main,
        },
        reset: {
            icon: statusIcon,
            title: 'ยืนยันการรีเซ็ตรหัสผ่าน',
            subtitle: 'คุณต้องการรีเซ็ตรหัสผ่านข้อมูลนี้หรือไม่?',
            color: theme.palette.error.main,
        },
    };


    const config = type ? confirmConfig[type] : null;

    const finalIcon = config?.icon;
    const finalTitle = config?.title;
    const finalSubtitle = config?.subtitle;
    const finalColor = config?.color;

    useEffect(() => {
        if (confirmDialog.isOpen) {
            setAnimate(true);
            const timer = setTimeout(() => setAnimate(false), 500);
            return () => clearTimeout(timer);
        }
    }, [confirmDialog.isOpen]);

    const handleConfirm = async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        try {
            await confirmDialog.onConfirm();
            setConfirmDialog((prev) => ({ ...prev, isLoading: false, isSuccess: true }));
            setTimeout(() => {
                setConfirmDialog((prev) => ({ ...prev, isOpen: false, isSuccess: false }));
            }, 2000); // Show tick for 2 seconds
        } catch {
            setConfirmDialog((prev) => ({ ...prev, isLoading: false })); // Handle errors if needed
        }
    };

    return (
        <AnimatedDialog
            open={confirmDialog.isOpen}
            onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
            maxWidth="xs"
            fullWidth
            aria-hidden={!confirmDialog.isOpen} // Set aria-hidden dynamically based on dialog visibility
            sx={{
                ...(animate && confirmDialog.isOpen && {
                    animation: 'pulse 0.5s ease-in-out',
                }),
            }}
            PaperProps={{
                sx: {
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.darker : theme.palette.common.white,
                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0px 4px 20px rgba(0, 0, 0, 0.9)'
                        : '0px 4px 20px rgba(0, 0, 0, 0.1)',
                }
            }}
        >
            {confirmDialog.isLoading ? (
                <>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'center', pt: 5 }}>
                        <Box component="img" src={loaddata} sx={{ width: '100px' }} />
                    </DialogTitle>
                    <DialogContent sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography>กำลังดำเนินการ...</Typography>
                    </DialogContent>
                </>
            ) : confirmDialog.isSuccess ? (
                <>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'center', pt: 5 }}>
                        <Box component="img" src={tick} sx={{ width: 100 }} />
                    </DialogTitle>
                    <DialogContent sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography color="success.main">สำเร็จ!</Typography>
                    </DialogContent>
                </>
            ) : (
                <>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'center', pt: 5 }}>
                        {finalIcon && (
                            <Box component="img" src={finalIcon} sx={{ width: 100 }} />
                        )}
                    </DialogTitle>

                    <DialogContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5">{finalTitle}</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {finalSubtitle}
                        </Typography>
                    </DialogContent>

                    <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
                        <TextButton
                            
                            onClick={() =>
                                setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
                            }
                        >
                            ยกเลิก
                        </TextButton>

                        <TextButton
                            sx={{ backgroundColor: finalColor }}
                            onClick={handleConfirm}
                        >
                            ยืนยัน
                        </TextButton>
                    </DialogActions>
                </>
            )

            }
        </AnimatedDialog>
    )
}

export default ConfirmDialog
