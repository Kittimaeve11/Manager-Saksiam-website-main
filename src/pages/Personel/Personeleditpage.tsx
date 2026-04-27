import React, { useEffect, useState } from 'react'
import { useAuth } from '../../Context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import type { Dayjs } from 'dayjs';
import type { FormEditUserData, FormUserData, FormUserDataErrors } from '../../utils/types';
import { validateEditUserForm, validateUserForm } from '../../utils/validation';
import { Box, Container, Grid, Paper, Typography, useTheme } from '@mui/material';
import { apiFetch } from '../../API/client';
import dayjs from 'dayjs';
import BoxUploadProfile from '../../components/Model/Upload/BoxUploadProfile';
import BasicTextField from '../../components/Model/TextField/BasicTextField';
import BasicDatePicker from '../../components/Model/TextField/BasicDatePicker';
import BasicDropDownselete from '../../components/Model/Dropdown/BasicDropDownselete';
import MenuAddressNumber from '../../components/Model/Dropdown/MenuAddressNumber';
import TextButton from '../../components/Model/Buttom/TextButton';
import ConfirmDialog from '../../components/Model/Pop_up/ConfirmDialog';
import Notifications from '../../components/Model/Pop_up/Notifications';

const Personeleditpage = () => {
    const { id } = useParams();
    const personelID = id ? Number(id) : undefined;
    const theme = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(true);

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

    const [originalData, setOriginalData] = useState({
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
        phone: '',
        phone6: '',
        selectedRole: 0,
        photo: null as string | File | null,
    })

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

    // ------------------------------------------------------------
    // Load all personal
    // ------------------------------------------------------------


    useEffect(() => {
        const fetchPersonelDetail = async () => {
            if (!personelID) return;

            setLoading(true);
            try {
                const response = await apiFetch(
                    `/api/auther/showUserAPI/${personelID}`
                );
                const data = await response.json();
                const user = data.data || {};
                setPname(user.personnel_pname || "");
                setFname(user.personnel_fname || "");
                setLname(user.personnel_lname || "");
                setNickname(user.nickname || "");
                setBirthday(user.birthday ? dayjs(user.birthday) : null);
                setIDCard(user.IDCard || "");
                setAddress(user.address || "");
                setDistrict(user.district || "");
                setAmphoe(user.amphoe || "");
                setProvince(user.province || "");
                setZipcode(user.zipcod || "");
                setPhone(user.phone || "");
                setPhone6(user.phone6 || "");
                setEmail(user.email || "");
                setSelectedRole(user.role_id || "");
                setPhoto(user.photo || null);
                setOriginalData({
                    pname: user.personnel_pname || "",
                    fname: user.personnel_fname || "",
                    lname: user.personnel_lname || "",
                    nickname: user.nickname || "",
                    birthday: user.birthday || "",
                    IDCard: user.IDCard || "",
                    address: user.address || "",
                    district: user.district || "",
                    amphoe: user.amphoe || "",
                    province: user.province || "",
                    zipcode: user.zipcod || "",
                    phone: user.phone || "",
                    phone6: user.phone6 || "",
                    email: user.email || "",
                    selectedRole: user.role_id || "",
                    photo: user.photo || null,
                })
            } catch (error) {
                console.error("Error loading personnel details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPersonelDetail();
    }, [personelID]);

    // ------------------------------------------------------------
    // Submit  personal
    // ------------------------------------------------------------

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const userformData: FormEditUserData = {
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
            phone,
            phone6,
            selectedRole,
            photo
        };

        const errors = validateEditUserForm(userformData);

        if (Object.values(errors).some((e) => e)) {
            setError(errors);
            return;
        }
        let hasChanges = false;
        const formData = new FormData();

        if (pname !== originalData.pname) {
            formData.append('pname', pname)
            hasChanges = true;
        }

        if (fname !== originalData.fname) {
            formData.append('fname', fname)
            hasChanges = true;
        }

        if (lname !== originalData.lname) {
            formData.append('lname', lname)
            hasChanges = true;
        }

        if (nickname !== originalData.nickname) {
            formData.append('nickname', nickname)
            hasChanges = true;
        }
        const birthdayValue = birthday
            ? birthday.format("YYYY-MM-DD")
            : "";
        if (birthdayValue !== originalData.birthday) {
            formData.append("birthday", birthdayValue);
            hasChanges = true;
        }

        if (IDCard !== originalData.IDCard) {
            formData.append('IDCard', IDCard)
            hasChanges = true;
        }

        if (address !== originalData.address) {
            formData.append('address', address)
            hasChanges = true;
        }

        if (district !== originalData.district) {
            formData.append('district', district)
            hasChanges = true;
        }

        if (amphoe !== originalData.amphoe) {
            formData.append('amphoe', amphoe)
            hasChanges = true;
        }
        if (province !== originalData.province) {
            formData.append('province', province)
            hasChanges = true;
        }

        if (zipcode !== originalData.zipcode) {
            formData.append('zipcode', zipcode)
            hasChanges = true;
        }

        if (email !== originalData.email) {
            formData.append('email', email)
            hasChanges = true;
        }
        if (phone !== originalData.phone) {
            formData.append('phone', phone)
            hasChanges = true;
        }
        if (phone6 !== originalData.phone6) {
            formData.append('phone6', phone6)
            hasChanges = true;
        }
        const selectedRoleValue =
            selectedRole !== null ? String(selectedRole) : "";

        if (selectedRole !== originalData.selectedRole) {
            formData.append("role", selectedRoleValue);
            hasChanges = true;
        }

        if (photo !== null && photo !== originalData.photo) {
            if (typeof photo !== 'string') {
                formData.append('photo', photo)
            }
            hasChanges = true;
        }
        if (!hasChanges) {
            setNotify({
                isOpen: true,
                message: 'ไม่มีการเปลี่ยนแปลงข้อมูล',
                type: 'info',
            });
            return;
        }

        formData.append('updatename', `${user?.fname} ${user?.lname}`);
        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: () => handleConfirmSubmit(formData)
        });
    }
    const handleConfirmSubmit = async (FormData: FormData) => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        try {
            const response = await apiFetch(`/api/auther/updateUserAPI/${personelID}`, {
                method: "POST",
                body: FormData,
            });
            if (response.ok) {
                setNotify({
                    isOpen: true,
                    message: 'บันทึกข้อมูลสำเร็จ!',
                    type: 'success',
                });
                const changes: string[] = [];

                if (originalData.pname !== pname) {
                    changes.push(`คำนำหน้าชื่อ"${originalData.pname}" เป็น "${pname}"`);
                }

                if (originalData.fname !== fname) {
                    changes.push(`ชื่อ"${originalData.fname}" เป็น "${fname}"`);
                }

                if (originalData.lname !== lname) {
                    changes.push(`นามสกุล"${originalData.lname}" เป็น "${lname}"`);
                }

                if (originalData.nickname !== nickname) {
                    changes.push(`ชื่อเล่น"${originalData.nickname}" เป็น "${nickname}"`);
                }

                const birthdayValue = birthday
                    ? birthday.format("YYYY-MM-DD")
                    : "";

                if (originalData.birthday !== birthdayValue) {
                    changes.push(
                        `วันเดือนปีเกิด "${originalData.birthday}" เป็น "${birthdayValue}"`
                    );
                }

                if (originalData.IDCard !== IDCard) {
                    changes.push(`เลขบัตรประชาชน"${originalData.IDCard}" เป็น "${IDCard}"`);
                }

                if (originalData.address !== address) {
                    changes.push(`ที่อยู่"${originalData.address}" เป็น "${address}"`);
                }

                if (originalData.district !== district) {
                    changes.push(`ตำบล"${originalData.district}" เป็น "${district}"`);
                }

                if (originalData.amphoe !== amphoe) {
                    changes.push(`อำเภอ"${originalData.amphoe}" เป็น "${amphoe}"`);
                }

                if (originalData.province !== province) {
                    changes.push(`จังหวัด"${originalData.province}" เป็น "${province}"`);
                }

                if (originalData.zipcode !== zipcode) {
                    changes.push(`รหัสไปรษณีย์"${originalData.zipcode}" เป็น "${zipcode}"`);
                }

                if (originalData.email !== email) {
                    changes.push(`อีเมล"${originalData.email}" เป็น "${email}"`);
                }

                if (originalData.phone !== phone) {
                    changes.push(`เบอร์โทร"${originalData.phone}" เป็น "${phone}"`);
                }

                if (originalData.phone6 !== phone6) {
                    changes.push(`เบอร์โทร 6 หลัก"${originalData.phone6}" เป็น "${phone6}"`);
                }

                if (originalData.selectedRole !== selectedRole) {
                    changes.push(`สิทธิ"${originalData.selectedRole}" เป็น "${selectedRole}"`);
                }

                if (originalData.photo !== photo) {
                    changes.push(`รูปโปรไฟล์`);
                }
                const actionDetail = `ฟอร์มแก้ไขข้อมูลผู้ใช้งาน ผู้ใช้งานID: ${personelID} ${changes.length > 0 ? changes.join(', ') : ''
                    }`;
                const payloadlog = {
                    actionType: 9,
                    actionDetail: actionDetail,
                    typeUser: user?.role_name,
                    datatype: 'ผู้ใช้งาน',
                    dataID: personelID,
                    dataname: `${pname} ${fname} ${lname}`,
                    IDPer: user?.id,
                    FullPer: `${user?.fname} ${user?.lname}`
                };

                await apiFetch(`/api/auther/log`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payloadlog),
                });
                navigate("/Personel", {
                    state: {
                        notify: {
                            message: "แก้ไขข้อมูลผู้ใช้งานำเร็จ",
                            type: "success",
                        },
                    },
                });
            }
        } catch (error) {
            console.error("Submission error:", error);
            setNotify({
                isOpen: true,
                message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
                type: 'error',
            });
        } finally {
            setConfirmDialog({
                isOpen: false,
                isLoading: false,
                onConfirm: () => { },
            });
        }
    }

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
                        ฟอร์มการแก้ไขข้อมูลผู้ใช้งาน
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
                                    loading={loading}
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
                                sx={{ backgroundColor: theme.palette.warning.main }}

                            >
                                แก้ไขข้อมูล
                            </TextButton>
                        </Box>
                    </Box>
                </Box>
            </Paper>
            <ConfirmDialog
                type='edit'
                confirmDialog={confirmDialog}
                setConfirmDialog={setConfirmDialog}
            />
            <Notifications notify={notify} setNotify={setNotify} />
        </Container>
    )
}

export default Personeleditpage
