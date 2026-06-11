import React, { useState } from 'react'
import type { BoxUploadBannerProps } from '../../../utils/types';
import { Box, Divider, Fade, Skeleton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import imageCompression from 'browser-image-compression';
import ComputerIcon from '@mui/icons-material/Computer';
import CloseIcon from '@mui/icons-material/Close';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import TextButton from '../../Buttom/TextButton';
import AppIconButton from '../../Buttom/IconButton';
import Notifications from '../Pop_up/Notifications';

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API_PHOTO;

const BoxUploadBanner: React.FC<BoxUploadBannerProps> = ({
    filepicturePC,
    setFilepicturePC,
    filpictureMoblie,
    setFilepictureMoblie,
    error1,
    error2,
    fieldKey1,
    fieldKey2,
    handleFieldChange,
    loading,
    topon
}) => {
    const theme = useTheme();
    const [previewUrlpicturePC, setPreviewUrlpicturePC] = useState<string | null>(null);
    const [previewUrlpictureMoblie, setPreviewUrlpictureMoblie] = useState<string | null>(null);
    const [isProcessingpicturePC, setIsProcessingpicturePC] = useState(false);
    const [isProcessingpictureMoblie, setIsProcessingpictureMoblie] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [notify, setNotify] = useState({
        isOpen: false,
        message: "",
        type: "success" as "success" | "error" | "warning" | "info",
    });
    const handleFilepicturePCChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFile = event.target.files && event.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 4 * 1024 * 1024) {
                setNotify({
                    isOpen: true,
                    message: "ขนาดไฟล์ต้องไม่เกิน 4 MB",
                    type: "warning",
                });
                return;
            }
            if (!selectedFile.type.includes("jpeg")) {
                setNotify({
                    isOpen: true,
                    message: "กรุณาอัปโหลดไฟล์ JPG เท่านั้น",
                    type: "warning",
                });
                return;
            }
            setFilepicturePC(selectedFile);
            await generatePreview(selectedFile);
            handleFieldChange(fieldKey1, selectedFile)
        }
    };

    const handleFilepictureMoblieChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFile = event.target.files && event.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 4 * 1024 * 1024) {
                setNotify({
                    isOpen: true,
                    message: "ขนาดไฟล์ต้องไม่เกิน 4 MB",
                    type: "warning",
                });
                return;
            }
            if (!selectedFile.type.includes("jpeg")) {
                setNotify({
                    isOpen: true,
                    message: "กรุณาอัปโหลดไฟล์ JPG เท่านั้น",
                    type: "warning",
                });
                return;
            }
            setFilepictureMoblie(selectedFile);
            await generatepictureMobliePreview(selectedFile);
            handleFieldChange(fieldKey2, selectedFile)
        }
    };

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const droppedFile = event.dataTransfer.files && event.dataTransfer.files[0];
        if (droppedFile) {
            if (droppedFile.size > 10 * 1024 * 1024) {
                setNotify({
                    isOpen: true,
                    message: "ขนาดไฟล์ต้องไม่เกิน 10MB",
                    type: "warning",
                });
                return;
            }
            if (!droppedFile.type.includes("jpeg")) {
                setNotify({
                    isOpen: true,
                    message: "กรุณาอัปโหลดไฟล์ JPG เท่านั้น",
                    type: "warning",
                });
                return;
            }
            setFilepicturePC(droppedFile);
            await generatePreview(droppedFile);
            handleFieldChange(fieldKey1, droppedFile)
        }
    };

    const handleDroppictureMoblie = async (
        event: React.DragEvent<HTMLDivElement>
    ) => {
        event.preventDefault();
        setIsDragging(false);
        const droppedFile = event.dataTransfer.files && event.dataTransfer.files[0];
        if (droppedFile) {
            if (droppedFile.size > 4 * 1024 * 1024) {
                setNotify({
                    isOpen: true,
                    message: "ขนาดไฟล์ต้องไม่เกิน 4 MB",
                    type: "warning",
                });
                return;
            }
            if (!droppedFile.type.includes("jpeg")) {
                setNotify({
                    isOpen: true,
                    message: "กรุณาอัปโหลดไฟล์ JPG เท่านั้น",
                    type: "warning",
                });
                return;
            }
            setFilepictureMoblie(droppedFile);
            await generatepictureMobliePreview(droppedFile);
            handleFieldChange(fieldKey2, droppedFile)
        }
    };

    const generatePreview = async (file: File) => {
        setIsProcessingpicturePC(true);
        try {
            const options = { maxSizeMB: 0.5, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);
            const compressedFileUrl = URL.createObjectURL(compressedFile);
            setPreviewUrlpicturePC(compressedFileUrl);
        } catch (error) {
            console.error("Error creating preview:", error);
        } finally {
            setIsProcessingpicturePC(false);
        }
    };
    const generatepictureMobliePreview = async (file: File) => {
        setIsProcessingpictureMoblie(true);
        try {
            const options = { maxSizeMB: 0.5, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);
            const compressedFileUrl = URL.createObjectURL(compressedFile);
            setPreviewUrlpictureMoblie(compressedFileUrl);
        } catch (error) {
            console.error("Error creating preview:", error);
        } finally {
            setIsProcessingpictureMoblie(false);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDragEnter = () => {
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    return (
        <Box
            sx={{
                border: `1px solid ${theme.palette.grey[200]}`,
                borderRadius: "8px",
                p: 3,
                textAlign: "center",
                width: "auto",
                height: "auto",
                margin: "0 auto",
                backgroundColor: isDragging
                    ? theme.palette.action.hover
                    : "transparent",
                gap: 2,
                mt:topon
            }}
        >
            {loading ? (
                <Stack spacing={1}>
                    <Skeleton variant="rounded" width="auto" height="250px" />
                </Stack>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 2,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {filepicturePC === null ? (
                        <Box
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                border: `1px dashed ${error1
                                    ? theme.palette.error.main
                                    : theme.palette.grey[200]
                                    }`,
                                borderRadius: "8px",
                                p: 3,
                                height: "250px",
                                width: "100%",
                                flex: 1,
                            }}
                        >
                            <ComputerIcon
                                sx={{ fontSize: 40, color: theme.palette.mode === 'dark' ? '#8f9ead' : theme.palette.secondary.darker }}
                            />
                            <Typography
                                variant="h6"
                                sx={{ mt: 1, mb: 0.5, color: theme.palette.mode === 'dark' ? '#89ABCF' : theme.palette.secondary.darker }}
                            >
                                อัปโหลดรูปแบนเนอร์ขนาดเดสก์ท็อป
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1, mb: 0.5 }}>
                                เลือกไฟล์หรือลากและวางก็ได้
                            </Typography>
                            <Typography variant="body2" color="error">
                                กรุณาอัปโหลดไฟล์รูปภาพ JPG เท่านั้น
                            </Typography>
                            <TextButton
                                component="label"
                                sx={{
                                    mt: 2,
                                    backgroundColor: theme.palette.warning.main,
                                }}
                            >
                                เลือกไฟล์
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFilepicturePCChange}
                                    accept="image/jpeg"
                                />
                            </TextButton>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "8px",
                                p: 3,
                                height: "250px",
                                width: "100%",
                                flex: 1,
                            }}
                        >
                            {isProcessingpicturePC ? (
                                <Typography variant="body1" sx={{ mt: 1, mb: 0.5 }}>
                                    กำลังประมวลผลไฟล์...
                                </Typography>
                            ) : filepicturePC && filepicturePC instanceof File &&
                            filepicturePC.type.startsWith("image/") && (
                                <Fade in={true} timeout={2000}>
                                    <Box sx={{ position: 'relative' }}>
                                        <Box
                                            component="img"
                                            src={previewUrlpicturePC!}
                                            alt={filepicturePC.name}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                width: "100%",
                                                height: "auto",
                                                maxHeight: "180px",
                                                margin: "auto",
                                                imageRendering: "auto",
                                                my: 1,
                                            }}
                                        />
                                        <AppIconButton
                                            onClick={() => setFilepicturePC(null)}
                                            sx={{
                                                position: 'absolute',

                                                backgroundColor: theme.palette.error.light, // 🔥 สีแดง
                                                color: 'white',
                                                borderColor: theme.palette.error.main
                                            }}
                                        >
                                            <CloseIcon sx={{ fontSize: 16 }} />
                                        </AppIconButton>
                                    </Box>
                                </Fade>
                            )}
                            {typeof filepicturePC === 'string' && (
                                <Box>
                                    <Fade in={true} timeout={2000}>
                                        <Box sx={{ position: 'relative' }}>
                                            <Box
                                                component="img"
                                                src={`${BASE_URL_API}/${filepicturePC}`}
                                                alt="Uploaded Preview"
                                                sx={{
                                                    display: "flex",
                                                    // alignItems: "center",
                                                    // justifyContent: "center",
                                                    width: "100%",
                                                    height: "auto",
                                                    maxHeight: "180px",
                                                    margin: "auto",
                                                    imageRendering: "auto",
                                                    my: 0.5,
                                                }}
                                            />
                                            <AppIconButton
                                                onClick={() => setFilepicturePC(null)}
                                                sx={{
                                                position: 'absolute',

                                                left: '50%',         
                                                transform: 'translateX(-50%)', 

                                                backgroundColor: theme.palette.error.main,
                                                color: 'white',

                                                borderColor: theme.palette.error.main
                                            }}
                                            >
                                                <CloseIcon sx={{ fontSize: 16 }} />
                                            </AppIconButton>
                                        </Box>
                                    </Fade>
                                </Box>
                            )}
                        </Box>
                    )}
                    <Divider
                        sx={{
                            m: 2,
                            width: isMobile ? "100%" : "auto",
                            height: isMobile ? "auto" : 250,
                        }}
                        orientation={isMobile ? "horizontal" : "vertical"}
                    />
                    {filpictureMoblie === null ? (
                        <Box
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDroppictureMoblie}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                border: `1px dashed ${error2
                                    ? theme.palette.error.main
                                    : theme.palette.mode === "dark"
                                        ? theme.palette.grey[100]
                                        : theme.palette.grey[400]
                                    }`,
                                borderRadius: "8px",
                                p: 3,
                                height: "250px",
                                width: "100%",
                                flex: 1,
                            }}
                        >
                            <PhoneAndroidIcon
                                sx={{ fontSize: 40, color: theme.palette.mode === 'dark' ? '#8f9ead' : theme.palette.secondary.darker }}
                            />
                            <Typography
                                variant="h6"
                                sx={{ mt: 1, mb: 0.5, color: theme.palette.mode === 'dark' ? '#89ABCF' : theme.palette.secondary.darker }}
                            >
                                อัปโหลดรูปแบนเนอร์ขนาดโทรศัพท์
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1, mb: 0.5 }}>
                                เลือกไฟล์หรือลากและวางก็ได้
                            </Typography>
                            <Typography variant="body2" color="error">
                                กรุณาอัปโหลดไฟล์รูปภาพ JPG เท่านั้น
                            </Typography>
                            <TextButton
                                component="label"
                                sx={{
                                    mt: 2,
                                    backgroundColor: theme.palette.warning.main,
                                }}
                            >
                                เลือกไฟล์
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFilepictureMoblieChange}
                                    accept="image/jpeg"
                                />
                            </TextButton>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                //   border: error.file
                                //     ? `1px dashed ${theme.palette.error.main}`
                                //     : `1px ${theme.palette.grey[200]}`,
                                borderRadius: "8px",
                                p: 3,
                                height: "250px",
                                width: "100%",
                                flex: 1,
                            }}
                        >
                            {isProcessingpictureMoblie ? (
                                <Typography variant="body1" sx={{ mt: 1, mb: 0.5 }}>
                                    กำลังประมวลผลไฟล์...
                                </Typography>
                            ) : filpictureMoblie &&
                            filpictureMoblie instanceof File &&
                            filpictureMoblie.type.startsWith("image/") && (
                                <Fade in={true} timeout={2000}>
                                    <Box sx={{ position: 'relative' }}>
                                        <Box
                                            component="img"
                                            src={previewUrlpictureMoblie!}
                                            alt={filpictureMoblie.name}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                width: "100%",
                                                height: "auto",
                                                maxHeight: "180px",

                                                margin: "auto",
                                                imageRendering: "auto",
                                                my: 1,
                                            }}
                                        />
                                        <AppIconButton
                                            onClick={() => setFilepictureMoblie(null)}
                                            sx={{
                                                position: 'absolute',

                                                left: '50%',         
                                                transform: 'translateX(-50%)', 

                                                backgroundColor: theme.palette.error.main,
                                                color: 'white',

                                                borderColor: theme.palette.error.main
                                            }}
                                        >
                                            <CloseIcon sx={{ fontSize: 16 }} />
                                        </AppIconButton>
                                    </Box>
                                </Fade>

                            )}
                            {typeof filpictureMoblie === "string" && (
                                <Box>
                                    <Fade in={true} timeout={2000}>
                                        <Box sx={{ position: 'relative' }}>
                                            <Box
                                                component="img"
                                                src={`${BASE_URL_API}/${filpictureMoblie}`}
                                                alt="Uploaded Preview"
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    width: "100%",
                                                    height: "auto",
                                                    maxHeight: "180px",
                                                    margin: "auto",
                                                    imageRendering: "auto",
                                                    my: 0.5,
                                                }}
                                            />
                                            <AppIconButton
                                                onClick={() => setFilepictureMoblie(null)}
                                                 sx={{
                                                position: 'absolute',

                                                left: '50%',         
                                                transform: 'translateX(-50%)', 

                                                backgroundColor: theme.palette.error.main,
                                                color: 'white',

                                                borderColor: theme.palette.error.main
                                            }}
                                            >
                                                <CloseIcon sx={{ fontSize: 16 }} />
                                            </AppIconButton>

                                        </Box>
                                    </Fade>
                                </Box>
                            )}

                        </Box>
                    )}
                </Box>
            )}
            <Notifications notify={notify} setNotify={setNotify} />
        </Box>
    )
}

export default BoxUploadBanner
