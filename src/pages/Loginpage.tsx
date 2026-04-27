import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
    useTheme
} from "@mui/material";

import { IoIosLock } from "react-icons/io";
import { BiSolidUser } from "react-icons/bi";
import { RiEyeCloseLine } from "react-icons/ri";
import { RiEyeFill } from "react-icons/ri";

import logo from "../assets/Image/logo_sak-03.png";
import hero from "../assets/Image/bglogin.png";
import bgmoblieHead from "../assets/Image/porpbg2.png";
import bgmoblieBebow from "../assets/Image/bgmoblie.png";

import { CONFIG } from '../config-global';

import { useAuth } from "../Context/AuthContext";
import LoadingOverlay from "./LoadingOverlay";

const LoginPage: React.FC = () => {
    const theme = useTheme();
    const { login } = useAuth();

    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [isRedirectLoading, setIsRedirectLoading] = useState(false);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const perms = await login(email, password);

            // เปิด overlay
            setIsRedirectLoading(true);
            setTimeout(() => {
                let target = "/Personel";
                if (perms.includes("Brander")) target = "/Banner";
                navigate(target);
            }, 4000); //

        } catch {
            setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
            setIsRedirectLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: "100vh",
            background: "#f3f5f9",
            display: "flex",
            flexDirection: "column",
        }}>
            {/* <-- nav --> */}
            <Box
                sx={{
                    px: 6,
                    py: 2,
                    display: { xs: 'none', md: 'flex' },
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 10,
                }}

            >

                <img src={logo} width={250} />

                <Box sx={{ display: "flex", gap: 4 }}>
                    <Typography
                        component={Link}
                        to="https://saksiam.com/home"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            cursor: "pointer", textDecoration: "none", fontWeight: 600, color: theme.palette.grey[800], "&:hover": {
                                color: theme.palette.primary.light
                            },

                        }}
                    >
                        กลับสู่เว็บไซต์หลัก
                    </Typography>

                    <Typography
                        component={Link}
                        to="https://saksiam.com/branchlocations"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            cursor: "pointer", textDecoration: "none", fontWeight: 600, color: theme.palette.grey[800], "&:hover": {
                                color: theme.palette.primary.light
                            }
                        }}
                    >
                        ค้นหาสาขา
                    </Typography>

                    <Typography
                        component={Link}
                        to="https://saksiam.com/about"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            cursor: "pointer", textDecoration: "none", fontWeight: 600, color: theme.palette.grey[800], "&:hover": {
                                color: theme.palette.primary.light
                            }
                        }}
                    >
                        เกี่ยวกับเรา
                    </Typography>

                    <Typography
                        component={Link}
                        to="https://saksiam.com/contact"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            cursor: "pointer", textDecoration: "none", fontWeight: 600, color: theme.palette.grey[800], "&:hover": {
                                color: theme.palette.primary.light
                            }
                        }}
                    >
                        ติดต่อเรา
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ position: 'relative', width: '100%', display: { xs: 'flex', md: 'none' } }}>
                {/* background */}
                <img src={bgmoblieHead} width="100%" style={{ maxHeight: '350px' }} />

                {/* logo */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '40%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <img src={logo} width={300} />
                </Box>
            </Box>

            <Grid container>
                {/* LEFT IMAGE */}
                <Grid
                    size={{ xs: 12, md: 8 }}

                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",

                    }}

                    order={{ xs: 2, md: 1 }}
                >
                    <Box
                        component="img"
                        draggable={false}
                        src={hero}
                        sx={{
                            width: "104%",

                            minHeight: '80vh',
                            objectFit: "cover",
                            display: { xs: 'none', md: 'flex' }
                        }}
                    />
                    <Box
                        component="img"
                        draggable={false}
                        src={bgmoblieBebow}
                        sx={{
                            mt: -4,
                            width: "100%",

                            objectFit: "cover",
                            display: { xs: 'flex', md: 'none' }
                        }}
                    />
                </Grid>
                {/* <-- form login --> */}
                <Grid size={{ xs: 12, md: 4 }}
                    order={{ xs: 1, md: 2 }}
                    sx={{
                        display: "flex",
                        mt: { xs: -12, md: -16 },
                        alignItems: "center",
                        justifyContent: { xs: 'center', md: "left" },
                        ml: { xs: 0, md: -16 }
                    }}
                >
                    <Card
                        sx={{
                            width: 420,
                            borderRadius: { xs: 0, md: 4 },
                            boxShadow: { xs: 'none', md: "0 20px 16px rgba(0, 0, 0, 0.07)" },
                            backgroundColor: { xs: 'transparent', md: theme.palette.common.white }
                        }}
                    >
                        <CardContent sx={{ p: 5 }}>
                            <form onSubmit={handleLogin}>

                                <Typography textAlign="center" fontWeight="bold" sx={{ fontSize: { xs: theme.typography.h3.fontSize, lg: theme.typography.h4.fontSize }, color: theme.palette.grey[800] }} >
                                    เข้าสู่ระบบ
                                </Typography>

                                <Typography sx={{ mt: 1, mb: 3, color: theme.palette.grey[800] }}>
                                    ยินดีต้อนรับเข้าสู่{" "}
                                    <span style={{ color: theme.palette.secondary.dark, fontWeight: 600 }}>
                                        บริษัท ศักดิ์สยามลิสซิ่ง จำกัด
                                    </span>
                                </Typography>

                                <TextField
                                    fullWidth
                                    placeholder="อีเมลผู้ใช้งานระบบ"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    sx={{
                                        '& .MuiInputLabel-root': {
                                            color: theme.palette.primary.main,

                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: theme.palette.primary.main
                                        },
                                        '& .MuiInputBase-input': {
                                            fontWeight: 400,
                                            color: error ? theme.palette.error.main : theme.palette.grey[800]
                                        },
                                        '& .MuiInputBase-input::placeholder': {
                                            color: error ? theme.palette.error.main : theme.palette.grey[500],
                                            opacity: 1
                                        },
                                        mb: 2,
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <BiSolidUser style={{ fontSize: theme.typography.h3.fontSize }} />
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            fontSize: theme.typography.body1,
                                            fontWeight: 600
                                        },
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="รหัสผ่าน"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    sx={{
                                        mb: 1,
                                        fontSize: theme.typography.body1,
                                        '& .MuiInputLabel-root': {
                                            color: theme.palette.primary.main,

                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: theme.palette.primary.main
                                        },
                                        '& .MuiInputBase-input': {
                                            fontWeight: 400,
                                            color: error ? theme.palette.error.main : theme.palette.grey[800]
                                        },
                                        '& .MuiInputBase-input::placeholder': {
                                            color: error ? theme.palette.error.main : theme.palette.grey[500],
                                            opacity: 1
                                        },
                                    }}

                                    slotProps={{
                                        inputLabel: { shrink: true },
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IoIosLock style={{ fontSize: theme.typography.h3.fontSize }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                        {showPassword ? <RiEyeFill /> : <RiEyeCloseLine />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                                {error && (
                                    <Typography mt={1} color={theme.palette.error.main} fontSize={14}>
                                        {error}
                                    </Typography>
                                )}
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        py: 1.6,
                                        mt: 3,
                                        fontSize: theme.typography.body1,
                                        borderRadius: 3,
                                        background: theme.palette.primary.main,
                                        fontWeight: 600,
                                        "&:hover": {
                                            background: theme.palette.secondary.dark,
                                        },
                                        color: theme.palette.common.white
                                    }}
                                >
                                    {isRedirectLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                                </Button>
                            </form>

                            <Typography
                                sx={{
                                    textAlign: "center",
                                    mt: 3,
                                    fontSize: theme.typography.caption,
                                    color: theme.palette.grey[600],
                                }}
                            >
                                พัฒนาโดย : ฝ่ายพัฒนาระบบส่งเสริมปฏิบัติการ <br />  สอบถามข้อมูลเพิ่มเติมโทร. 098-282-0224 หรือ 061-265-0632 <br />   Copyright © 2025 {CONFIG.appName} <br />  All Rights Reserved. (version {CONFIG.appVersion})
                            </Typography>

                        </CardContent>
                    </Card>

                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            width: 260,
                            height: 100,
                            background: "#FFC107",
                            borderTopLeftRadius: "160px",
                            zIndex: 0,
                            display: { xs: 'none', xl: 'flex' }
                        }}
                    />
                </Grid>
            </Grid>
            {isRedirectLoading && <LoadingOverlay />}
        </Box>
    );
};

export default LoginPage;