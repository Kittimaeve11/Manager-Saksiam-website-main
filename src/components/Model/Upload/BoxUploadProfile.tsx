import { alpha, Box, Fade, IconButton,  Skeleton, Stack, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react'
import type { BoxUploadProfileProps } from '../../../utils/types';
import imageCompression from 'browser-image-compression';
import Person3Icon from '@mui/icons-material/Person3';
import CloseIcon from '@mui/icons-material/Close';
import Notifications from '../Pop_up/Notifications';

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API_PHOTO;

const BoxUploadProfile: React.FC<BoxUploadProfileProps> = ({
    profile,
    setProfile,
    handleFieldChange,
    error,
    fieldKey,
    loading,
      topon
}) => {
    const theme = useTheme();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notify, setNotify] = useState({
        isOpen: false,
        message: '',
        type: 'success' as 'success' | 'error' | 'warning' | 'info'
    });

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFile = event.target.files && event.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 2 * 1024 * 1024) {
                setNotify({
                    isOpen: true,
                    message: "ขนาดไฟล์ต้องไม่เกิน 2 MB",
                    type: "warning",
                });
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(selectedFile.type)) {
                setNotify({
                    isOpen: true,
                    message: "กรุณาอัปโหลดไฟล์ JPG, PNG หรือ GIF เท่านั้น",
                    type: "warning",
                });
                return;
            }

            setProfile(selectedFile);
            await generatePreview(selectedFile);
            handleFieldChange(fieldKey, selectedFile);
        }
    };

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const droppedFile = event.dataTransfer.files && event.dataTransfer.files[0];
        if (droppedFile) {
            if (droppedFile.size > 2 * 1024 * 1024) {
                setNotify({
                    isOpen: true,
                    message: "ขนาดไฟล์ต้องไม่เกิน 2 MB",
                    type: "warning",
                });
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(droppedFile.type)) {
                setNotify({
                    isOpen: true,
                    message: "กรุณาอัปโหลดไฟล์ JPG, PNG หรือ GIF เท่านั้น",
                    type: "warning",
                });
                return;
            }

            setProfile(droppedFile);
            await generatePreview(droppedFile);
            handleFieldChange(fieldKey, droppedFile);
        }
    };
    const generatePreview = async (file: File) => {
        setIsProcessing(true);
        try {
            const options = { maxSizeMB: 0.5, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);
            const compressedFileUrl = URL.createObjectURL(compressedFile);
            setPreviewUrl(compressedFileUrl);
        } catch (error) {
            console.error("Error creating preview:", error);
        } finally {
            setIsProcessing(false);
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
       
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{

                border: error ? `1px dashed ${theme.palette.error.main}` : `1px dashed  ${theme.palette.grey[200]}`,
                borderRadius: 1,
                p: 3,
                textAlign: 'center',
                width: 'auto',
                height: '400px',
          
                mt:topon,
                backgroundColor: isDragging ? theme.palette.action.hover : 'transparent',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                // boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
            }}
        >
            {loading ? (
                <Stack spacing={1}>
                    <Skeleton variant="rounded" width='auto' height='300px' />
                </Stack>
            ) : profile === null ? (
                <Stack spacing={3} alignItems="center">
                    <Box sx={{
                        width: 130,
                        height: 130,
                        borderRadius: '50%',
                        border: `1px dashed ${error
                            ? theme.palette.error.main
                            : theme.palette.mode === "dark"
                                ? theme.palette.grey[100]
                                : theme.palette.grey[300]
                            }`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        cursor: 'pointer',
                    }}
                        component="label">
                        <input
                            type="file"
                            accept="image/jpeg, image/jpg, image/png, image/gif"
                            hidden
                            onChange={handleFileChange}
                        />
                        <Box
                            sx={{
                                backgroundColor: error
                                    ? theme.palette.error.lighter
                                    : theme.palette.mode === "dark"
                                        ? theme.palette.grey[800]
                                        : theme.palette.grey[100],

                                width: 110,
                                height: 110,
                                borderRadius: '50%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                '&:hover': {
                                    backgroundColor: error ? alpha(theme.palette.error.lighter, 0.6) : alpha(theme.palette.grey[300], 0.6),
                                    '& .MuiSvgIcon-root': {
                                        color: error ? alpha(theme.palette.error.main, 0.6) : alpha(theme.palette.grey[600], 0.6),
                                    },

                                    '& .MuiTypography-root': {
                                        color: error ? alpha(theme.palette.error.main, 0.6) : alpha(theme.palette.grey[600], 0.6),
                                        fontWeight: 500,
                                    },
                                }
                            }}
                        >
                            <Person3Icon fontSize="medium" sx={{ color: error ? theme.palette.error.main : theme.palette.common.white }} />
                            <Typography variant="caption" fontWeight={400} sx={{ mt: 1, color: error ? theme.palette.error.main : 'inherit' }}>
                                อัปโหลดรูป
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="caption"  align="center">
                        รองรับไฟล์ภาพ *.jpeg, *.jpg, *.png, *.gif <br />
                        ขนาดไฟล์ไม่เกิน 2 MB
                    </Typography>
                </Stack>
            ) : (
               <Box sx={{ mt: 1 }}>
            {isProcessing ? (
              <Typography variant="body1" sx={{ mt: 1, mb: 0.5 }}>
                กำลังประมวลผลไฟล์...
              </Typography>
            ) : profile && (profile instanceof File) && profile.type.startsWith('image/') && (
              <Fade in={true} timeout={2000}>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={previewUrl!}
                    alt={profile.name}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '240px',
                      maxHeight: '300px',
                      margin: 'auto',
                      imageRendering: 'auto',
                      my: 1,
                    }}
                  />
                  <IconButton
                    onClick={() => setProfile(null)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 20,
                      height: 20,
                      p: 0.5,
                      backgroundColor: 'rgba(56, 55, 55, 0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(36, 35, 35, 0.8)',
                      },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Fade>
            )}
            {typeof profile === 'string' && (
              <Fade in={true} timeout={2000}>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={`${BASE_URL_API}/${profile}`}
                    alt="Uploaded Preview"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '240px',
                      maxHeight: '300px',
                      margin: 'auto',
                      imageRendering: 'auto',
                      my: 1,
                    }}
                  />
                  <IconButton
                    onClick={() => setProfile(null)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 20,
                      height: 20,
                      p: 0.5,
                      backgroundColor: 'rgba(56, 55, 55, 0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(36, 35, 35, 0.8)',
                      },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Fade>
            )}

          </Box>
            )}
              <Notifications notify={notify} setNotify={setNotify} />
        </Box>
    )
}

export default BoxUploadProfile
