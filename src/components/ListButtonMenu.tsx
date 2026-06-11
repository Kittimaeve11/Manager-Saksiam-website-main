import { KeyboardArrowDown } from '@mui/icons-material'
import { Box, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

interface ListButtonMenuProps {
    open: boolean
    setOpen: (open: boolean) => void
    openMenu: boolean
    setOpenMenu: (open: boolean) => void
    selectedLink: string
    setSelectedLink: (value: React.SetStateAction<string>) => void
    isMobile: boolean
    isSelected: boolean
    openClick: boolean
    iconmain: React.ReactNode;
    namemain: string
    mainPath?: string;
    submenu: {
        label: string;
        path: string;
        badge?: React.ReactNode;
        showBadge?: boolean;
        show?: boolean;
    }[]
}

const ListButtonMenu: React.FC<ListButtonMenuProps> = ({
    open,
    setOpen,
    openMenu,
    setOpenMenu,
    selectedLink,
    setSelectedLink,
    isMobile,
    isSelected,
    openClick,
    iconmain,
    namemain,
    mainPath,
    submenu
}) => {
    const theme = useTheme();
    const navigate = useNavigate();
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
                    if (mainPath) {
                        setSelectedLink(mainPath);
                        navigate(mainPath);
                        if (isMobile) setOpen(false);
                    }
                    setOpenMenu(!openMenu)
                }}
                selected={openClick && isSelected}
            >
                <ListItemIcon sx={{
                    minWidth: 0,
                    mr: open ? 2 : 0,
                    justifyContent: 'center',
                    fontSize: theme.typography.h4.fontSize,
                    color: theme.palette.mode === 'dark' ? theme.palette.common.white : (isSelected ? theme.palette.primary.dark : '')
                }}>

                    {iconmain}
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
                        color: isSelected ? theme.palette.primary.dark : ''
                    }}
                />
                {open && (
                    <KeyboardArrowDown
                        sx={[
                            {
                                mr: -1,
                                color: theme.palette.mode === 'dark'
                                    ? theme.palette.common.white
                                    : isSelected ? theme.palette.primary.dark : '',
                                transition: '0.2s',
                            },
                            openMenu
                                ? { transform: 'rotate(-180deg)' }
                                : { transform: 'rotate(0)' },
                        ]}
                    />
                )}
            </ListItemButton>
            {open && openMenu &&
                submenu
                    .filter(item => item.show)
                    .map((item, index, arr) => {
                        const isLast = index === arr.length - 1;
                        const isSubmenuSelected =
                            selectedLink === item.path || selectedLink.startsWith(`${item.path}/`);

                        return (
                            <ListItemButton
                                key={item.label}
                                alignItems="center"
                                sx={{
                                    flexDirection: open ? 'row' : 'column',
                                    minHeight: 50,
                                    borderRadius: '12px',
                                    mx: 0.5,
                                    pl: 7,
                                    position: 'relative',
                                    overflow: 'hidden',

                                    // เส้นแนวตั้ง
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: 28,
                                        top: 0,
                                        width: '2px',
                                        backgroundColor: '#b9cff1',
                                        height: isLast ? '30%' : '100%',
                                        zIndex: 2,
                                    },

                                    // เส้นโค้ง
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        left: 28,
                                        top: '30%',
                                        width: '16px',
                                        height: '12px',
                                        borderLeft: '2px solid #b9cff1',
                                        borderBottom: '2px solid #b9cff1',
                                        borderBottomLeftRadius: '12px',
                                        zIndex: 2,
                                    },

                                    // hover เฉพาะพื้นหลังด้านใน
                                    '&:hover .submenu-selected-bg': {
                                        backgroundColor: theme.palette.action.hover,
                                    },
                                    '&.Mui-selected': {
                                        backgroundColor: 'transparent', // 🔥 ปิดพื้นหลังหลักทิ้ง
                                    },
                                }}
                                onClick={() => {
                                    setSelectedLink(item.path);
                                    navigate(item.path);
                                    if (isMobile) setOpen(false);
                                }}
                                selected={isSubmenuSelected}
                            >
                                <Box
                                    className="submenu-selected-bg"
                                    sx={{
                                        position: 'absolute',
                                        top: 6,
                                        bottom: 6,
                                        left: 48,   // เว้นพื้นที่ before / after ไว้
                                        right: 8,
                                        borderRadius: '10px',
                                        backgroundColor: isSubmenuSelected
                                            ? theme.palette.action.hover
                                            : 'transparent',
                                        transition: 'all 0.2s ease',
                                        zIndex: 0,
                                    }}
                                />

                                <Box
                                    sx={{
                                        position: 'relative',
                                        zIndex: 3,
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography
                                                sx={{
                                                    fontSize: open ? theme.typography.body2.fontSize : 8,
                                                    fontWeight: isSubmenuSelected ? 600 : 400,
                                                    color:
                                                        isSubmenuSelected
                                                            ? theme.palette.mode === "dark"
                                                                ? theme.palette.secondary.main
                                                                : theme.palette.primary.main
                                                            : theme.palette.mode === "dark"
                                                                ? theme.palette.common.white
                                                                : theme.palette.text.primary,
                                                }}
                                            >
                                                {item.label}
                                            </Typography>
                                        }
                                    />
                                    {open && item.showBadge && item.badge}
                                </Box>
                            </ListItemButton>
                        );
                    })
            }
        </Box>
    )
}

export default ListButtonMenu
