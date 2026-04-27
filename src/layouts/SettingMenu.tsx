import React, { useState } from 'react'
import {
    ListItemIcon,
    Menu,
    MenuItem,
    Typography,
    useTheme
} from "@mui/material";

import { useAuth } from '../Context/AuthContext';

import SettingsIcon from '@mui/icons-material/Settings';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import Dialogs from '../components/Model/Pop_up/Dialog';
import ComponentChangepasswordForm from '../components/View/Users/ComponentChangepasswordForm';
import ComponentProfileForm from '../components/View/Users/ComponentProfileForm';



interface SettingMenuProps {
    anchorElUser: HTMLElement | null;
    setAnchorElUser: (open: HTMLElement | null) => void;
}

const SettingMenu: React.FC<SettingMenuProps> = ({
    anchorElUser,
    setAnchorElUser
}) => {
    const { logout, user } = useAuth();
    const theme = useTheme();

    const [openProfile, setOpenProfile] = useState(false);
    const [openChangePassword, setOpenChangePassword] = useState(false);

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleOpenProfile = () => {
        handleCloseUserMenu();
        setOpenProfile(true);
    };

    const handleOpenChangePassword = () => {
        handleCloseUserMenu();
        setOpenChangePassword(true);
    };

    const handleLogout = () => {
        handleCloseUserMenu();
        logout();
    };

    return (
        <>
            {/* ===== USER MENU ===== */}
            <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                keepMounted
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    },
                }}
            >
                {/* ตั้งค่าโปรไฟล์ */}
                <MenuItem onClick={handleOpenProfile}>
                    <ListItemIcon>
                        <SettingsIcon sx={{ fontSize: theme.typography.body1.fontSize }} />
                    </ListItemIcon>
                    <Typography variant="body2">ตั้งค่าโปรไฟล์</Typography>
                </MenuItem>

                {/* เปลี่ยนรหัสผ่าน */}
                <MenuItem onClick={handleOpenChangePassword}>
                    <ListItemIcon>
                        <LockIcon sx={{ fontSize: theme.typography.body1.fontSize }} />
                    </ListItemIcon>
                    <Typography variant="body2">เปลี่ยนรหัสผ่าน</Typography>
                </MenuItem>

                {/* ออกจากระบบ */}
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon
                            color="error"
                            sx={{ fontSize: theme.typography.body1.fontSize }}
                        />
                    </ListItemIcon>
                    <Typography variant="body2" color="error">
                        ออกจากระบบ
                    </Typography>
                </MenuItem>
            </Menu>

            {/* ===== PROFILE DIALOG ===== */}
            <Dialogs
                title="ตั้งค่าโปรไฟล์"
                openPopup={openProfile}
                setOpenPopup={(open) => {
                    setOpenProfile(open);

                }}
                wide="md"
                top={30}
            >
                <ComponentProfileForm
                    onClose={() => setOpenProfile(false)}
                    fullnamePer={`${user?.fname ?? ""} ${user?.lname ?? ""}`}
                    typeUser={`${user?.role_name ?? ""}`}
                    IDPer={`${user?.id ?? ""}`}
                />
            </Dialogs>

            {/* ===== CHANGE PASSWORD DIALOG ===== */}
            <Dialogs
                title="เปลี่ยนรหัสผ่าน"
                openPopup={openChangePassword}
                setOpenPopup={(open) => {
                    setOpenChangePassword(open);
                }}
                wide="sm"
                top={30}
            >
                <ComponentChangepasswordForm
                    onClose={() => setOpenChangePassword(false)}
                    fullnamePer={`${user?.fname ?? ""} ${user?.lname ?? ""}`}
                    typeUser={`${user?.role_name ?? ""}`}
                    IDPer={`${user?.id ?? ""}`}
                />
            </Dialogs>
        </>
    )
}

export default SettingMenu
