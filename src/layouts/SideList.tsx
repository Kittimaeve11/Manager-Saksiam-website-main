
import { styled, useTheme } from '@mui/material/styles';
import type { Theme, CSSObject } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import { Box, Divider, List, useMediaQuery } from '@mui/material';

// logo
import logo from '../assets/Image/logo_sak-03.png';
import logodark from '../assets/Image/logo_SAK_225.png';
import logomoblie from '../assets/Image//logo_sak-02.png';
import logodarkmoblie from '../assets/Image/logo_sak-01.png';
import ButtonMenu from '../components/ButtonMenu';

// icon
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import WidthFullIcon from '@mui/icons-material/WidthFull';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import HelpIcon from '@mui/icons-material/Help';

import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { usePermission } from '../hooks/usePermission';
import ListButtonMenu from '../components/ListButtonMenu';

interface SideListProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const drawerWidth = 260;
const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    zIndex: theme.zIndex.drawer, // Ensure drawer is on top when open
    [theme.breakpoints.down('md')]: {
        position: 'fixed',
        zIndex: theme.zIndex.modal + 1, // Ensure drawer is topmost on small screens
    },
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    display: 'none',
    [theme.breakpoints.up('sm')]: {
        display: 'none',
    },
    [theme.breakpoints.up('md')]: {
        display: 'block',
        width: `calc(${theme.spacing(10)} + 1px)`,
    },
});


const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1),

    ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        // height: '100vh',
        backdropFilter: 'blur(10px)',
        '& .MuiDrawer-paper': {
            // height: '100vh',
            width: drawerWidth,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: "none",     // เอา shadow ออก
            borderRight: "none",
            border: "none",
        },

        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': {
                ...openedMixin(theme),
                backgroundSize: 'cover',
                backgroundColor: theme.palette.primary.lighter,
                backgroundRepeat: 'no-repeat',
                border: "none",




            },
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': {
                ...closedMixin(theme),
                backgroundColor: theme.palette.primary.lighter,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                border: "none",
                // borderRight: 0,

                // borderBottomRightRadius: '10px',
                [theme.breakpoints.down('sm')]: {
                    display: 'none',
                },
            },
        }),
    }),
);

function SideList({ open, setOpen }: SideListProps) {
    const theme = useTheme();
    const location = useLocation();
    const { can } = usePermission();

    const [openSettings, setOpenSettings] = useState(true);
    const [openFaq, setOpenFaq] = useState(false);
    const [selectedLink, setSelectedLink] = useState(location.pathname);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [openClick] = useState(true);
    const isSelected = location.pathname.startsWith('/Settings');

    const menuSettings = [
        { label: 'ธีมเว็บไซต์', path: '/Settings_Theme', show: can("SettingsTheme") },
        { label: 'หัวข้อแบบสอบถาม', path: '/Settings_Question', show: can("Question") },
        { label: 'ข้อมูลการติดต่อ', path: '/Settings_Contact', show: can("Contact") },
    ]

    const menuFaq = [
        {
            label: 'ประเภทคำถามที่พบบ่อย',
            path: '/faq/type',
            show: true,
        },
        {
            label: 'คำถามที่พบบ่อย',
            path: '/faq/question',
            show: true,
        },
    ];

    return (
        <Drawer variant="permanent" open={open} >
            {/* พื้นหลัง gradient */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "33vh",
                    background: "linear-gradient(180deg, #0f1a2e 0%, #1a2a4a 50%, #243865 100%)",
                    zIndex: 0
                }}
            />

            {/* กล่องสีขาว */}
            <Box
                sx={{
                    position: "relative",
                    zIndex: 1,
                    mt: 3,
                    ml: 2,
                    borderRadius: 2,
                    backgroundColor:
                        theme.palette.mode === "dark"
                            ? theme.palette.primary.darker
                            : "white",
                    overflow: "hidden"
                }}
            >
                {/* LOGO */}
                <DrawerHeader

                >
                    {open ? (
                        <img
                            src={theme.palette.mode === "dark" ? logodark : logo}
                            alt="logo"
                            className="App-logo"
                        />
                    ) : (
                        <img
                            src={theme.palette.mode === "dark" ? logodarkmoblie : logomoblie}
                            alt="logo"
                            className="App-logo"
                        />
                    )}
                </DrawerHeader>

                {/* เส้นคั่น */}
                <Divider />


                <Box
                    sx={{
                        overflowY: "auto",
                        maxHeight: "calc(100vh - 200px)"
                    }}
                >
                    <List>
                        {(can("User")) &&
                            <ButtonMenu
                                open={open}
                                setOpen={setOpen}
                                selectedLink={selectedLink}
                                setSelectedLink={setSelectedLink}
                                isMobile={isMobile}
                                selectedsetLink='/Personel'
                                iconmain={<FolderSharedIcon />}
                                namemain='ผู้ใช้งาน'
                            />
                        }
                        {(can("Role")) &&
                            <ButtonMenu
                                open={open}
                                setOpen={setOpen}
                                selectedLink={selectedLink}
                                setSelectedLink={setSelectedLink}
                                isMobile={isMobile}
                                selectedsetLink='/RolePermission'
                                iconmain={<ManageAccountsIcon />}
                                namemain='จัดการสิทธิ'
                            />
                        }
                        {(can("Brander")) &&
                            <ButtonMenu
                                open={open}
                                setOpen={setOpen}
                                selectedLink={selectedLink}
                                setSelectedLink={setSelectedLink}
                                isMobile={isMobile}
                                selectedsetLink='/Banner'
                                iconmain={<WidthFullIcon />}
                                namemain='ป้ายแบนเนอร์'
                            />
                        }
                        {(can("Branch")) &&
                            <ButtonMenu
                                open={open}
                                setOpen={setOpen}
                                selectedLink={selectedLink}
                                setSelectedLink={setSelectedLink}
                                isMobile={isMobile}
                                selectedsetLink='/Branch '
                                iconmain={<HomeWorkIcon />}
                                namemain='สาขา'
                            />
                        }
                        {(can("Vedio")) &&
                            <ButtonMenu
                                open={open}
                                setOpen={setOpen}
                                selectedLink={selectedLink}
                                setSelectedLink={setSelectedLink}
                                isMobile={isMobile}
                                selectedsetLink='/Vedio'
                                iconmain={<AudioFileIcon />}
                                namemain='วิดีโอ'
                            />
                        }
                        {can("FAQ") && (
                            <ListButtonMenu
                                open={open}
                                setOpen={setOpen}
                                openMenu={openFaq}
                                setOpenMenu={setOpenFaq}
                                selectedLink={selectedLink}
                                setSelectedLink={setSelectedLink}
                                isMobile={isMobile}
                                isSelected={location.pathname.startsWith('/faq')}
                                openClick={openClick}
                                iconmain={<HelpIcon />}
                                namemain='คำถามที่พบบ่อย'
                                submenu={menuFaq}
                            />
                        )}
                        {(can("Contact") || can("Question") || can("Contact")) &&
                            <ListButtonMenu
                                open={open}
                                setOpen={setOpen}
                                openMenu={openSettings}
                                setOpenMenu={setOpenSettings}
                                selectedLink={selectedLink}
                                setSelectedLink={setSelectedLink}
                                isMobile={isMobile}
                                isSelected={isSelected}
                                openClick={openClick}
                                iconmain={<BuildCircleIcon />}
                                namemain='ตั้งค่า'
                                submenu={menuSettings}

                            />
                        }
                    </List>
                </Box>
            </Box>
        </Drawer>
    )
}

export default SideList
