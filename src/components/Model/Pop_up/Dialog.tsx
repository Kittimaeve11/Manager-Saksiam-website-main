import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, styled, Typography, useMediaQuery, useTheme, Slide, type SlideProps } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/system';
interface DialogProps {
    title: string;
    children: React.ReactNode;
    openPopup: boolean;
    setOpenPopup: (open: boolean) => void;
    wide: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
    top: number
}

const DialogWrapper = styled(Dialog)(({ theme }) => ({
    padding: theme.spacing(2),
}));

const DialogTitleContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '8px', // Space between icon and text
});

// Create a transition component for the slide effect
const Transition = React.forwardRef(function Transition(
    props: SlideProps,
    ref: React.Ref<unknown>,
) {
    return <Slide direction="down" ref={ref} {...props} />;
});

const Dialogs: React.FC<DialogProps> = ({ title, children, openPopup, setOpenPopup, wide, top }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const handleClose = () => {
        setOpenPopup(false);
        document.getElementById('triggerButton')?.focus(); // Return focus to trigger element
    };

    return (
        <DialogWrapper
            open={openPopup}
            fullScreen={fullScreen}
            fullWidth
            maxWidth={wide}
            TransitionComponent={Transition}
            PaperProps={{
                sx: {
                    top: { top },                   // Set top position
                    marginTop: theme.spacing(2), // Optional margin from the top
                    position: 'absolute', // Keep it fixed to the top
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.darker : theme.palette.common.white,
                    color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0px 4px 20px rgba(0, 0, 0, 0.9)'
                        : '0px 4px 20px rgba(0, 0, 0, 0.1)',
                }
            }}
            aria-hidden={!openPopup}
        >
            <DialogTitle>
                <DialogTitleContainer >
                    <Box
                        display="flex"
                        alignItems="center"
                        sx={{
                            backgroundColor: theme.palette.mode === 'dark' ? '#28323D' : '#00284B',
                            padding: '10px',
                            px: '20px',
                            borderRadius: '10px',
                            marginRight: '10px',
                            color: theme.palette.mode === 'dark' ? '#89ABCF' : '#e5ebf1'
                        }}
                    >
                        <Typography variant="h6" component="div"> {title} </Typography>
                    </Box>
                </DialogTitleContainer>
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[700],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent dividers>
                <div>{children}</div>
            </DialogContent>
        </DialogWrapper>
    );
};

export default Dialogs;