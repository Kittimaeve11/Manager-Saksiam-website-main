import { Box, Checkbox, Container, FormControlLabel, Grid, Paper, Typography, useTheme } from '@mui/material'

import { useCallback, useEffect, useState } from 'react'
import BasicTextField from '../../components/Model/TextField/BasicTextField';
import type { FormRoleErrors } from '../../utils/types';
import { validataRoleForm } from '../../utils/validation';
import { apiFetch } from '../../API/client';
import TextButton from '../../components/Buttom/TextButton';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/Model/Pop_up/ConfirmDialog';
import Notifications from '../../components/Model/Pop_up/Notifications';
interface PermissionItem {
    permistion_id: number;
    permistion_name: string;
    permistion_slug: string;
    ermistion_groupby: string;
}

const Permistioncreatepage = () => {

    const theme = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const groupColors = theme.palette.mode === 'dark'
        ? [
            '#180203', // แดงเข้ม
            '#1a1500', // เทาเข้ม
            '#040b16', // ฟ้าเข้ม
            '#1a1000', // ส้มเข้ม
            '#081208', // เขียวเข้ม
            '#14001a', // ม่วงเข้ม
        ]
        : [
            '#fcf7f7', // แดงอ่อน
            '#F6F8FA', // เหลืองอ่อน
            '#eef6ff', // ฟ้าอ่อน (ปรับให้ชัดขึ้น)
            '#fcfaf7', // ส้มอ่อน
            '#F0FAF2', // เขียวอ่อน
            '#f8f3f9', // ม่วงอ่อน
        ];

    const [roleName, setRoleName] = useState("");
    const [permissionGroups, setPermissionGroups] = useState<
        Record<string, PermissionItem[]>
    >({});
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [error, setError] = useState<FormRoleErrors>({
        roleName: "",
        permission_ids: "",
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

    const handleFieldChange = (fieldName: keyof FormRoleErrors, value: unknown) => {
        const formData = {
            roleName,
            permission_ids: selectedIds,
            [fieldName]: value,
        };

        const errors = validataRoleForm(formData);

        setError((prev) => ({
            ...prev,
            [fieldName]: errors[fieldName],
        }));
    };

    // ------------------------------------------------------------
    // Load all permissions
    // ------------------------------------------------------------
    const fetchPermissions = useCallback(async () => {
        try {
            const res = await apiFetch(`/api/auther/showPermissionAPI`, {
                method: "GET",
            });
            const result = await res.json();

            const dataObj: Record<string, PermissionItem[]> = result.data;
            const grouped: Record<string, PermissionItem[]> = {};

            // ไม่รับ key → ไม่มี unused variable
            Object.values(dataObj).forEach((items) => {
                if (Array.isArray(items) && items.length > 0) {
                    const groupName = items[0].permistion_name;
                    grouped[groupName] = items;
                }
            });

            setPermissionGroups(grouped);
        } catch (err) {
            console.error("Error loading permissions:", err);
        }
    }, []);


    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const hasPermissionError = Boolean(error.permission_ids);
    // ------------------------------------------------------------
    // Toggle each permission
    // ------------------------------------------------------------
    const togglePermission = (id: number) => {
        setSelectedIds((prev) => {
            const next =
                prev.includes(id)
                    ? prev.filter((x) => x !== id)
                    : [...prev, id];

            // ✅ เคลียร์ error เมื่อมีการเลือกอย่างน้อย 1 สิทธิ
            if (next.length > 0) {
                setError((e) => ({ ...e, permission_ids: "" }));
            }

            return next;
        });
    };

    // ------------------------------------------------------------
    // Submit new Role
    // ------------------------------------------------------------
    const handleSubmit = () => {
        const formData = {
            roleName,
            permission_ids: selectedIds,
        };

        const errors = validataRoleForm(formData);
        if (Object.values(errors).some((e) => e)) {
            setError(errors);
            return;
        }
      
        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: () => handleConfirmSubmit(),
        });
    }

    const handleConfirmSubmit = async () => {
        setConfirmDialog((p) => ({ ...p, isLoading: true }));

        try {
            // 1) ➤ Create Role
            const response = await apiFetch(`/api/auther/createRolePermissionAPI`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: roleName,
                    created_by: `${user?.fname} ${user?.lname}`, // ผู้สร้างบทบาท
                    permission_ids: selectedIds,
                }),
            });

            const result = await response.json();

            if (result.status !== 201) {
                throw new Error(result.message);
            }
            const roleID = result.id;

            const payloadlog = {
                actionType: 8,
                actionDetail: `สร้างบทบาทใหม่: ${roleName} (Role ID: ${roleID})`,
                typeUser: user?.role_name,
                datatype: "Role Management",
                dataID: roleID,
                dataname: roleName,
                IDPer: user?.id,
                FullPer: `${user?.fname} ${user?.lname}`,
            };

            await apiFetch(`/api/auther/log`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloadlog),
            });

            // 3) ➤ Success Notify
            navigate("/RolePermission", {
                state: {
                    notify: {
                        message: "สร้างบทบาทสำเร็จ",
                        type: "success",
                    },
                },
            });

        } catch (err) {
            console.error(err);
            setNotify({
                isOpen: true,
                message: "ไม่สามารถสร้างสิทธิได้",
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
                        ฟอร์มการบันทึกข้อมูลสิทธิ
                    </Typography>
                    <Box width='100%' sx={{ px: { xs: 2, sm: 5 } }}>
                        <BasicTextField
                            name="ชื่อบทบาท"
                            titlename="กรอกชื่อบทบาท"
                            subject={roleName}
                            setsubject={setRoleName}
                            handleFieldChange={handleFieldChange}
                            error={error.roleName}
                            topon={2}
                            fieldKey="modelname"
                            specify={true}
                        />
                        <Typography variant="body1" component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, mt: 4, mb: 2 }}>
                            เลือกรูปแบบการเข้าถึง
                        </Typography>
                        {error.permission_ids && (
                            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                                {error.permission_ids}
                            </Typography>
                        )}

                        {Object.entries(permissionGroups).map(([groupName, items], index) => {
                            const bgColor = groupColors[index % groupColors.length];

                            return (
                                <Grid
                                    container
                                    spacing={2}
                                    key={groupName}
                                    sx={{
                                        backgroundColor: bgColor,
                                        borderRadius: 2,
                                        p: 2,
                                        mb: 2,
                                    }}
                                >
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        {groupName}
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <Grid container spacing={1}>
                                            {items.map((p) => {
                                                const checked = selectedIds.includes(
                                                    p.permistion_id
                                                );
                                                return (

                                                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={p.permistion_id}>
                                                        <FormControlLabel
                                                            sx={{
                                                                color: hasPermissionError
                                                                    ? "error.main"
                                                                    : "text.primary",
                                                            }}
                                                            control={
                                                                <Checkbox
                                                                    checked={checked}
                                                                    onChange={() =>
                                                                        togglePermission(p.permistion_id)
                                                                    }
                                                                    sx={{
                                                                        color: hasPermissionError
                                                                            ? "error.main"
                                                                            : "default",
                                                                        "&.Mui-checked": {
                                                                            color: hasPermissionError
                                                                                ? "error.main"
                                                                                : "primary.main",
                                                                        },
                                                                    }}
                                                                />
                                                            }
                                                            label={p.permistion_name}
                                                        />
                                                    </Grid>
                                                )
                                            })}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            );
                        })}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
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

export default Permistioncreatepage
