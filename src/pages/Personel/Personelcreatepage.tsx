import { Box, Container, Grid, Paper, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react'
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Dayjs } from 'dayjs';
import type { FormUserData, FormUserDataErrors } from '../../utils/types';
import BoxUploadProfile from '../../components/Model/Upload/BoxUploadProfile';
import { validateUserForm } from '../../utils/validation';
import BasicTextField from '../../components/Model/TextField/BasicTextField';
import BasicDatePicker from '../../components/Model/TextField/BasicDatePicker';
import BasicDropDownselete from '../../components/Model/Dropdown/BasicDropDownselete';
import TextButton from '../../components/Buttom/TextButton';
import ConfirmDialog from '../../components/Model/Pop_up/ConfirmDialog';
import Notifications from '../../components/Model/Pop_up/Notifications';
import MenuAddressNumber from '../../components/Model/Dropdown/MenuAddressNumber';
import { apiFetch } from '../../API/client';


const Personelcreatepage = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [pname, setPname] = useState("")
    const [fname, setFname] = useState("")
    const [lname, setLname] = useState("")
    const [nickname, setNickname] = useState("")
    const [birthday, setBirthday] = useState<Dayjs | null>(null);
    const [IDCard, setIDCard] = useState("")
    const [address, setAddress] = useState("")
    const [district, setDistrict] = useState("")
    const [amphoe, setAmphoe] = useState("")
    const [province, setProvince] = useState("")
    const [zipcode, setZipcode] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [phone, setPhone] = useState("")
    const [phone6, setPhone6] = useState("")
    const [selectedRole, setSelectedRole] = useState<number | null>(0);

    const [photo, setPhoto] = useState<File | null>(null);
    const [error, setError] = useState<FormUserDataErrors>({
        pname: '',
        fname: '',
        lname: '',
        nickname: '',
        birthday: '',
        IDCard: '',
        address: '',
        district: '',
        amphoe: '',
        province: '',
        zipcode: '',
        email: '',
        password: '',
        phone: '',
        phone6: '',
        selectedRole: '',
        photo: '',
    });

    const [notify, setNotify] = useState({
        isOpen: false,
        message: "",
        type: "success" as "success" | "error" | "warning" | "info",
    });

    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        isLoading: false,
        onConfirm: () => { }
    });

    const handleFieldChange = (fieldName: string, value: unknown) => {
        const formData: FormUserData = {
            pname,
            fname,
            lname,
            nickname,
            birthday: birthday ? birthday.format("YYYY-MM-DD") : "",
            IDCard,
            address,
            district,
            amphoe,
            province,
            zipcode,
            email,
            password,
            phone,
            phone6,
            selectedRole,
            photo
        }
        const updateFormData = {
            ...formData,
            [fieldName]: value
        }

        const errors = validateUserForm(updateFormData)
        setError(prevErrors => ({
            ...prevErrors,
            [fieldName]: errors[fieldName]
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData: FormUserData = {
            pname,
            fname,
            lname,
            nickname,
            birthday: birthday ? birthday.format("YYYY-MM-DD") : "",
            IDCard,
            address,
            district,
            amphoe,
            province,
            zipcode,
            email,
            password,
            phone,
            phone6,
            selectedRole,
            photo
        };
        const errors = validateUserForm(formData);

        if (Object.values(errors).some((e) => e)) {
            setError(errors);
            return;
        }

        const fd = new FormData();
        fd.append('pname', pname);
        fd.append('fname', fname);
        fd.append('lname', lname);
        fd.append('nickname', nickname);
        fd.append('birthday', birthday ? birthday.format("YYYY-MM-DD") : "");
        fd.append('IDCard', IDCard);
        fd.append('address', address);
        fd.append('district', district);
        fd.append('amphoe', amphoe);
        fd.append('province', province);
        fd.append('zipcode', zipcode);
        fd.append('email', email);
        fd.append('password', password);
        fd.append('phone', phone);
        fd.append('phone6', phone6);

        // ❗ FIX 1: role_id → role
        fd.append('role', String(selectedRole));

        // ❗ FIX 2: ต้องส่ง status
        fd.append('status', '1'); // or whatever default

        // ❗ FIX 3: userPicture → photo
        if (photo) fd.append("photo", photo);

        // optional
        fd.append('createby', `${user?.fname} ${user?.lname}`);

        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: () => handleConfirmSubmit(fd)
        });
    }
    // ------------------ Confirm Submit ------------------
    const handleConfirmSubmit = async (formData: FormData) => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

        try {
            const response = await apiFetch(`/api/auther/registerapi`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                const userID = data.data?.user_id;

                // ---------- save Log ----------
                await apiFetch(`/api/auther/log`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        actionType: 1,
                        actionDetail: `เพิ่มผู้ใช้งานใหม่ รหัสผู้ใช้: ${userID} ชื่อ: ${fname} ${lname}`,
                        typeUser: user?.role_name,
                        datatype: 'ผู้ใช้งาน',
                        dataID: userID,
                        dataname: fname,
                        IDPer: user?.id,
                        FullPer: `${user?.fname} ${user?.lname}`,
                    })
                });
                // 3) ➤ Success Notify
                navigate("/Personel", {
                    state: {
                        notify: {
                            message: "เพิ่มข้อมูลผู้ใช้งานสำเร็จ",
                            type: "success",
                        },
                    },
                });
            }
        } catch (err) {
            let errorMessage = "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            setNotify({
                isOpen: true,
                message: errorMessage,
                type: "error",
            });
        } finally {
            setConfirmDialog({ isOpen: false, isLoading: false, onConfirm: () => { } });

        }
    };

    return (
        <Container maxWidth='xl'>
            <Paper
                elevation={0}
                sx={{
                    mt: 5,
                    py: 5,
                    borderRadius: 3,
                    width: '100%',
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.darker : "white"
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        width: '100%',
                        flexWrap: 'nowrap',
                        gap: 2,
                        px: 3,
                        pb: 4
                    }}
                >
                    <Typography variant="h6" component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                        ฟอร์มการบันทึกข้อมูลผู้ใช้งาน
                    </Typography>
                    <Box width='100%' sx={{ px: { xs: 2, sm: 5 } }}>
                        <Grid container spacing={5}>
                            <Grid size={{ xs: 12, xl: 3 }} order={{ xs: 2, xl: 1 }}>
                                <BoxUploadProfile
                                    profile={photo}
                                    setProfile={setPhoto}
                                    handleFieldChange={handleFieldChange}
                                    error={error.photo}
                                    fieldKey='photo'
                                    loading={null}
                                    topon={3}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, xl: 9 }} order={{ xs: 1, xl: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                        <BasicTextField
                                            name="คำนำหน้าชื่อ"
                                            titlename="กรุณากรอกคำนำหน้าชื่อ"
                                            subject={pname}
                                            setsubject={setPname}
                                            handleFieldChange={handleFieldChange}
                                            error={error.pname}
                                            topon={0}
                                            fieldKey="pname"
                                            specify={true}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                        <BasicTextField
                                            name="ชื่อ"
                                            titlename="กรุณากรอกชื่อ"
                                            subject={fname}
                                            setsubject={setFname}
                                            handleFieldChange={handleFieldChange}
                                            error={error.fname}
                                            topon={0}
                                            fieldKey="fname"
                                            specify={true}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                        <BasicTextField
                                            name="นามสกุล"
                                            titlename="กรุณากรอกนามสกุล"
                                            subject={lname}
                                            setsubject={setLname}
                                            handleFieldChange={handleFieldChange}
                                            error={error.lname}
                                            topon={0}
                                            fieldKey="lname"
                                            specify={true}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                        <BasicTextField
                                            name="ชื่อเล่น"
                                            titlename="กรุณากรอกชื่อเล่น"
                                            subject={nickname}
                                            setsubject={setNickname}
                                            handleFieldChange={handleFieldChange}
                                            error={error.nickname}
                                            topon={0}
                                            fieldKey="nickname"
                                            specify={true}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                        <BasicTextField
                                            name="เลขบัตรประชาชน"
                                            titlename="กรุณากรอกเลขบัตรประชาชน"
                                            subject={IDCard}
                                            setsubject={setIDCard}
                                            handleFieldChange={handleFieldChange}
                                            error={error.IDCard}
                                            topon={0}
                                            fieldKey="IDCard"
                                            specify={true}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                        <BasicTextField
                                            name="เบอร์โทร 6 หลัก"
                                            titlename="กรุณากรอกเบอร์โทร 6หลัก"
                                            subject={phone6}
                                            setsubject={setPhone6}
                                            handleFieldChange={handleFieldChange}
                                            error={error.phone6}
                                            topon={0}
                                            fieldKey="phone6"
                                            specify={true}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                        <BasicTextField
                                            name="เบอร์โทร"
                                            titlename="กรุณากรอกเบอร์โทร"
                                            subject={phone}
                                            setsubject={setPhone}
                                            handleFieldChange={handleFieldChange}
                                            error={error.phone}
                                            topon={0}
                                            fieldKey="phone"
                                            specify={true}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                        <BasicTextField
                                            name="อีเมล"
                                            titlename="กรุณากรออีเมล"
                                            subject={email}
                                            setsubject={setEmail}
                                            handleFieldChange={handleFieldChange}
                                            error={error.email}
                                            topon={0}
                                            fieldKey="email"
                                            specify={true}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>

                                        <BasicTextField
                                            name="รหัสผ่าน"
                                            titlename="กรุณากรอกรหัสผ่าน"
                                            subject={password}
                                            setsubject={setPassword}
                                            handleFieldChange={handleFieldChange}
                                            error={error.password}
                                            topon={0}
                                            fieldKey="password"
                                            specify={true}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                        <BasicDatePicker
                                            name="วันเดือนปีเกิด"
                                            subject={birthday}
                                            setsubject={setBirthday}
                                            handleFieldChange={handleFieldChange}
                                            error={error.birthday}
                                            fieldKey="birthday"
                                            topon={0}
                                            specify={true}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                                        <BasicDropDownselete
                                            selecte={selectedRole}
                                            setSelected={setSelectedRole}
                                            nameroutes="showRolelistAPI"
                                            handleFieldChange={handleFieldChange}
                                            error={error.selectedRole}
                                            topon={0}
                                            fieldKey="selectedRole"
                                            specify={true}
                                            titlename="สิทธิ"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 12 }}>
                                        <MenuAddressNumber
                                            address={address}
                                            setAddress={setAddress}

                                            district={district}
                                            setDistrict={setDistrict}

                                            amphoe={amphoe}
                                            setAmphoe={setAmphoe}

                                            province={province}
                                            setProvince={setProvince}

                                            zipcode={zipcode}
                                            setZipcode={setZipcode}

                                            handleFieldChange={handleFieldChange}
                                            fieldKeyPrefix="userAddress"
                                            error={error.address}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                mt: 7
                            }}
                        >

                            <TextButton
                                onClick={handleSubmit}
                            >
                                บันทึกข้อมูล
                            </TextButton>
                        </Box>
                    </Box>
                </Box>
            </Paper>
            <ConfirmDialog
                type='add'
                confirmDialog={confirmDialog}
                setConfirmDialog={setConfirmDialog}
            />
            <Notifications notify={notify} setNotify={setNotify} />
        </Container>
    )
}

export default Personelcreatepage
