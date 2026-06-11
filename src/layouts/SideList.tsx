
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
import ApprovalNotifyBadge from '../components/Approval/ApprovalNotifyBadge';

// icon
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import WidthFullIcon from '@mui/icons-material/WidthFull';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import HelpIcon from '@mui/icons-material/Help';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PolicyIcon from '@mui/icons-material/Policy';
import GroupsIcon from '@mui/icons-material/Groups';

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
        minHeight: '100vh',
        '& .MuiDrawer-paper': {
            position: 'relative',
            minHeight: '100vh',
            width: drawerWidth,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible',
            boxShadow: "none",     // เอา shadow ออก
            borderRight: "none",
            border: "none",
        },

        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': {
                ...openedMixin(theme),
                position: 'relative',
                minHeight: '100vh',
                overflow: 'visible',
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
                position: 'relative',
                minHeight: '100vh',
                overflow: 'visible',
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
    const [openAbout, setOpenAbout] = useState(true);
    const [openFaq, setOpenFaq] = useState(true);
    const [openNews, setOpenNews] = useState(true);
    const [selectedLink, setSelectedLink] = useState(location.pathname);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [openClick] = useState(true);
    const isAboutSelected = location.pathname.startsWith('/About');
    const isFaqSelected = location.pathname.startsWith('/Faq_');
    const isNewsSelected = location.pathname.startsWith('/News_');
    const isSettingsSelected = location.pathname.startsWith('/Settings');

    const menuSettings = [
        { label: 'ธีมเว็บไซต์', path: '/Settings_Theme', show: can("SettingsTheme") },
        { label: 'หัวข้อแบบสอบถาม', path: '/Settings_Question', show: can("Question") },
        { label: 'ข้อมูลการติดต่อ', path: '/Settings_Contact', show: can("Contact") },
    ]

    const menuAbout = [
        { label: 'พันธกิจ', path: '/About/Mission', show: true },
        { label: 'คณะกรรมการ', path: '/About/Company_Director', show: true },
    ];

    const menuVideo = [
        {
            label: 'วิดีโอ',
            path: '/Vedio',
            badge: <ApprovalNotifyBadge module="vedio" />,
            showBadge: true,
            show: can("Vedio"),
        },
    ];

    const menuFaq = [
        {
            label: 'ประเภทคำถามที่พบบ่อย',
            path: '/Faq_Type',
            show: can("FAQ") || can("FaqType"),
        },
        {
            label: 'คำถามที่พบบ่อย',
            path: '/Faq_Question',
            show: can("FAQ") || can("FaqQuestion"),
        },
    ];

    const menuNews = [
        {
            label: 'ประเภทข่าวและกิจกรรม',
            path: '/News_Type',
            show: can("News") || can("New") || can("NewsType"),
        },
        {
            label: 'ข่าวและกิจกรรม',
            path: '/News_Activity',
            badge: <ApprovalNotifyBadge module="news" />,
            showBadge: true,
            show: can("News") || can("New"),
        },
    ];

    const menuPolicy = [
        {
            label: 'นโยบาย',
            path: '/Policy',
            badge: <ApprovalNotifyBadge module="policy" />,
            showBadge: true,
            show: can("Policy") || can("Policies"),
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
                    position: "fixed",
                    top: theme.spacing(3),
                    zIndex: theme.zIndex.drawer + 1,
                    left: theme.spacing(2),
                    width: open
                        ? `calc(${drawerWidth}px - ${theme.spacing(4)})`
                        : `calc(${theme.spacing(10)} + 1px - ${theme.spacing(2)})`,
                    maxHeight: `calc(100vh - ${theme.spacing(6)})`,
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
                        maxHeight: "calc(100vh - 200px)",
                        pr: 0.5,
                        scrollbarWidth: "thin",
                        scrollbarColor: "transparent transparent",
                        overscrollBehavior: "contain",
                        "&:hover": {
                            scrollbarColor: "rgba(96, 96, 96, 0.75) transparent",
                        },
                        "&::-webkit-scrollbar": {
                            width: 8,
                        },
                        "&::-webkit-scrollbar-track": {
                            backgroundColor: "transparent",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "transparent",
                            borderRadius: 999,
                            border: "2px solid transparent",
                            backgroundClip: "padding-box",
                        },
                        "&:hover::-webkit-scrollbar-thumb": {
                            backgroundColor: "rgba(96, 96, 96, 0.55)",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                            backgroundColor: "rgba(96, 96, 96, 0.8)",
                        },
                        "&::-webkit-scrollbar-button": {
                            display: "none",
                            width: 0,
                            height: 0,
                        },
                        "&::-webkit-scrollbar-corner": {
                            backgroundColor: "transparent",
                        },
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
                        {menuVideo.some((item) => item.show) &&
                            <ButtonMenu
                                open={open}
                                setOpen={setOpen}
                                selectedLink={selectedLink}
                                setSelectedLink={setSelectedLink}
                                isMobile={isMobile}
                                selectedsetLink={menuVideo[0].path}
                                iconmain={<AudioFileIcon />}
                                namemain={menuVideo[0].label}
                                badge={menuVideo[0].badge}
                                showBadge={menuVideo[0].showBadge}
                            />
                        }
                        {menuAbout.some((item) => item.show) && (
                            <ListButtonMenu
                                open={open}
                                setOpen={setOpen}
                                openMenu={openAbout}
                                setOpenMenu={setOpenAbout}
                                selectedLink={selectedLink}
                                setSelectedLink={setSelectedLink}
                                isMobile={isMobile}
                                isSelected={isAboutSelected}
                                openClick={openClick}
                                iconmain={<GroupsIcon />}
                                namemain='เกี่ยวกับเรา'
                                submenu={menuAbout}
                            />
                        )}

                        {menuFaq.some((item) => item.show) && (
                            <ListButtonMenu
                                open={open}
                                setOpen={setOpen}
                                openMenu={openFaq}
                                setOpenMenu={setOpenFaq}
                                selectedLink={selectedLink}
                                setSelectedLink={setSelectedLink}
                                isMobile={isMobile}
                                isSelected={isFaqSelected}
                                openClick={openClick}
                                iconmain={<HelpIcon />}
                                namemain='คำถามที่พบบ่อย'
                                submenu={menuFaq}
                            />
                        )}

                        {menuNews.some((item) => item.show) && (
                            <ListButtonMenu
                                open={open}
                                setOpen={setOpen}
                                openMenu={openNews}
                                setOpenMenu={setOpenNews}
                                selectedLink={selectedLink}
                                setSelectedLink={setSelectedLink}
                                isMobile={isMobile}
                                isSelected={isNewsSelected}
                                openClick={openClick}
                                iconmain={<NewspaperIcon />}
                                namemain='ข่าวและกิจกรรม'
                                submenu={menuNews}
                            />
                        )}

                        {menuPolicy.some((item) => item.show) && (
                            <ButtonMenu
                                open={open}
                                setOpen={setOpen}
                                selectedLink={selectedLink}
                                selectedsetLink={menuPolicy[0].path}
                                setSelectedLink={setSelectedLink}
                                isMobile={isMobile}
                                iconmain={<PolicyIcon />}
                                namemain={menuPolicy[0].label}
                                badge={menuPolicy[0].badge}
                                showBadge={menuPolicy[0].showBadge}
                            />
                        )}

                        {menuSettings.some((item) => item.show) &&
                            <ListButtonMenu
                                open={open}
                                setOpen={setOpen}
                                openMenu={openSettings}
                                setOpenMenu={setOpenSettings}
                                selectedLink={selectedLink}
                                setSelectedLink={setSelectedLink}
                                isMobile={isMobile}
                                isSelected={isSettingsSelected}
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
