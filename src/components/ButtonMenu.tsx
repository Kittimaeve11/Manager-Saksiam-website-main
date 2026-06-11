import { Badge, Box, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
interface ButtonMenuProps {
    open: boolean
    selectedLink: string
    selectedsetLink: string
    setSelectedLink: (value: React.SetStateAction<string>) => void
    isMobile: boolean
    setOpen: (open: boolean) => void
    iconmain: React.ReactNode;
    namemain: string
    badge?: React.ReactNode;
    showBadge?: boolean;
}

const ButtonMenu: React.FC<ButtonMenuProps> = ({
    open,
    selectedLink,
    selectedsetLink,
    setSelectedLink,
    isMobile,
    setOpen,
    iconmain,
    namemain,
    badge,
    showBadge
}) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const selectedPath = selectedsetLink.trim();
    const isSelected = selectedLink === selectedPath || selectedLink.startsWith(`${selectedPath}/`);

    return (
        <Box>
            <ListItemButton
                alignItems="center"
                sx={{
                    mt: 0.5,
                    flexDirection: open ? 'row' : 'column',
                    minHeight: 50,
                    borderRadius: '12px',
                    mx: 0.5,
                    
                    '&:hover, &:focus': {
                        '& svg': { opacity: 1 },
                        backgroundColor: theme.palette.action.hover,
                    },
                    '&.Mui-selected': {
                        backgroundColor: theme.palette.mode === 'dark' ? (isSelected ? '#1c2439' : '')
                            : (isSelected ? theme.palette.primary.lighter : ''),
                        ':hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? '#192a55' : '#c1c6d9',

                        }
                    },
                }}
                onClick={() => {
                    setSelectedLink(selectedPath);
                    navigate(selectedPath);
                    if (isMobile) setOpen(false);
                }}
                selected={isSelected}
            >
                <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: open ? 2 : 0,
                        justifyContent: 'center',
                        fontSize: theme.typography.h4.fontSize,
                
                        color: theme.palette.mode === 'dark' ? theme.palette.common.white : (isSelected ? theme.palette.primary.dark : '')
                    }}
                >
                    {showBadge && badge ? (
                        !open ? (
                            // 🟢 Sidebar ปิด → Badge ครอบ Icon
                            <Badge badgeContent={badge} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                                {iconmain}
                            </Badge>
                        ) : (
                            iconmain
                        )
                    ) : (
                        iconmain
                    )}
                </ListItemIcon>
                <ListItemText
                    primary={
                        <Typography
                            sx={{
                                fontSize: open ? theme.typography.body2.fontSize : 8,
                                color: theme.palette.mode === 'dark' ? theme.palette.common.white : (isSelected ? theme.palette.primary.dark : ''),
                                        fontWeight: 600,

                            }}
                        >
                            {namemain}
                        </Typography>
                    }
                    sx={{
                        opacity: 1,
                        color: isSelected ? theme.palette.primary.dark : ""
                    }}
                />
                {open && showBadge && badge}
            </ListItemButton>
        </Box>
    )
}

export default ButtonMenu
