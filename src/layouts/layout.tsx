
import { Avatar, Box, CssBaseline, IconButton, styled, Toolbar, Tooltip, Typography, useColorScheme, useMediaQuery, useTheme } from '@mui/material';
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import MenuIcon from '@mui/icons-material/Menu';
import SegmentIcon from '@mui/icons-material/Segment';
import { DarkMode, LightMode } from '@mui/icons-material';
import { PiBooksFill } from 'react-icons/pi';
import { Main } from './main';
import SideList from './SideList';

import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import avatar from '../assets/Image/avatar-2.png'
import SettingMenu from './SettingMenu';
import { usePageTitle } from '../Context/PageTitleContext';

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API_PHOTO;

const drawerWidth = 260;

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}


const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,

    // appbar fullscreen

    // width: `calc(100% - ${drawerWidth}px)`,
    // transition: theme.transitions.create(['width', 'margin'], {
    //   easing: theme.transitions.easing.sharp,
    //   duration: theme.transitions.duration.leavingScreen,
    // }),
    [theme.breakpoints.down('md')]: {
        width: 'calc(100%)',
    },
    backgroundColor: 'transparent',
    backdropFilter: 'blur(10px)',
    boxShadow: 'none',

    // appbar fullscreen

    // ...(open && {
    //     // marginLeft: drawerWidth,
    //     width: '100%',
    //     // width: `calc(100% - ${drawerWidth}px)`,
    //     transition: theme.transitions.create(['width', 'margin'], {
    //         easing: theme.transitions.easing.sharp,
    //         duration: theme.transitions.duration.enteringScreen,
    //     }),

    // }),

    // appbar = drawer

    ...(open
        ? {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        }
        : {
            // sm ลงมา: drawer hidden → AppBar เต็มจอ
            marginLeft: 0,
            width: '100%',
            // md ขึ้นไป: drawer แสดง icon only → เว้นที่ให้
            [theme.breakpoints.up('md')]: {
                marginLeft: `calc(${theme.spacing(10)} + 1px)`,
                width: `calc(100% - ${theme.spacing(10)} - 1px)`,
            },
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        }),
}));

export type DashboardLayoutProps = {
    children: React.ReactNode;
};


const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const theme = useTheme();
    const [open, setOpen] = useState(true);
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
const { title } = usePageTitle();
    useEffect(() => {
        setOpen(isDesktop);
    }, [isDesktop]);
    // const dispatch = useDispatch();
    const [anchorElManualmenu, setAnchorElManualmenu] = useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const handleDrawerOpen = () => {
        setOpen(prevOpen => !prevOpen);
    };
    const { user } = useAuth();
    const navigate = useNavigate();
    const handleOpenManualMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElManualmenu(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };
    const { mode, setMode } = useColorScheme();
    if (!mode) {
        return null;
    }
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" open={open}>
                <Toolbar sx={{ justifyContent: 'space-between', mt: 2 }}>
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', ml: open ? 0 : 1, color: theme.palette.common.white }}>

                        <IconButton
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            edge="start"
                            sx={{
                                marginRight: 1,

                                color: theme.palette.common.white
                            }}
                        >
                            {open ? <SegmentIcon /> : <MenuIcon />}
                        </IconButton>
                        หน้า / {title}

                    </Box>
                    <Box
                        sx={{
                            display: { xs: 'flex', md: 'none' },
                            alignItems: 'center'
                        }}
                    >
                        <Tooltip
                            title={theme.palette.mode === 'dark' ? 'โหมดกลางวัน' : 'โหมดกลางคืน'}
                            sx={{ marginRight: theme.spacing(2) }}
                        >
                            <IconButton
                                onClick={() =>
                                    setMode(mode === 'light' ? 'dark' : 'light')
                                }
                            >
                                <AnimatePresence initial={false} mode="wait">

                                    {theme.palette.mode === 'dark' ? (
                                        <motion.div
                                            key="dark"
                                            initial={{ y: -30, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 30, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ position: 'absolute' }}
                                        >
                                            <DarkMode sx={{ fontSize: '25px', color: theme.palette.primary.light }} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="light"
                                            initial={{ y: -30, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 30, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ position: 'absolute' }}
                                        >
                                            <LightMode sx={{ fontSize: '25px', color: theme.palette.primary.main }} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </IconButton>
                        </Tooltip>
                        <Box
                            onClick={handleOpenUserMenu}
                            sx={{
                                borderRadius: '50%',
                                backgroundColor:
                                    theme.palette.mode === 'dark'
                                        ? theme.palette.grey[700]
                                        : theme.palette.grey[300],
                                width: 48,
                                height: 48,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            <Avatar
                                alt="Default Avatar"
                                // src={avatar}
                                sx={{ width: 35, height: 35 }}
                            // onError={(e) => {
                            //     (e.target as HTMLImageElement).src = avatar;
                            // }}
                            />
                        </Box>
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>

                        <Tooltip
                            title={theme.palette.mode === 'dark' ? 'โหมดกลางวัน' : 'โหมดกลางคืน'}
                        >
                            <IconButton
                                onClick={() =>
                                    setMode(mode === 'light' ? 'dark' : 'light')
                                }
                                sx={{ mt: 1 }}
                            >
                                <AnimatePresence initial={false} mode="wait">

                                    {theme.palette.mode === 'dark' ? (
                                        <motion.div
                                            key="dark"
                                            initial={{ y: -30, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 30, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ position: 'absolute' }}
                                        >
                                            <DarkMode sx={{ fontSize: '25px', color: theme.palette.warning.lighter }} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="light"
                                            initial={{ y: -30, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 30, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ position: 'absolute' }}
                                        >
                                            <LightMode sx={{ fontSize: '25px', color: theme.palette.warning.dark }} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="คู่มือการใช้งานระบบ" sx={{ mx: theme.spacing(2) }}>
                            <IconButton onClick={handleOpenManualMenu} >
                                <PiBooksFill style={{ color: theme.palette.common.white, fontSize: '24px' }} />
                            </IconButton>
                        </Tooltip>
                      
                        <Box>
                            <Tooltip title="ตั้งค่า">
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    onClick={handleOpenUserMenu}
                                    sx={{
                                        borderRadius: 25,
                                        backgroundColor: theme.palette.common.white, height: '48px',
                                        maxWidth: 240,
                                        cursor: 'pointer',
                                        overflow: 'hidden'
                                    }}>
                                    <Typography variant="subtitle1" sx={{ marginLeft: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: theme.palette.grey[600], fontWeight: 600 }}>
                                        คุณ {user?.fname} {user?.lname}
                                    </Typography>
                                    <IconButton>
                                        <Avatar
                                            alt={'Default Avatar'}
                                        src={user?.picture ?
                                            `${BASE_URL_API}/${user.picture}` : avatar
                                        }
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = avatar;
                                        }}
                                        />
                                    </IconButton>
                                </Box>
                            </Tooltip>
                        </Box>
                    </Box>
                         <SettingMenu {...{ anchorElUser, setAnchorElUser }} />
                </Toolbar>
            </AppBar>
            <SideList {...{ open, setOpen }} />
            <Main>{children}</Main>
        </Box>
    )
}

export default DashboardLayout;

