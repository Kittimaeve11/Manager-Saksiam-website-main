import { Box, Container, Fade, Grid, Paper, TableRow, Typography, useTheme } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import ConfirmDialog from '../../components/Model/Pop_up/ConfirmDialog';
import Notifications from '../../components/Model/Pop_up/Notifications';
import { apiFetch } from '../../API/client';
import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core';
import { CSS } from "@dnd-kit/utilities";
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import StyledTableCell from '../../components/Model/Table/StyledTableCell';
import { FaExpandArrowsAlt } from 'react-icons/fa';
import type { Column } from '../../utils/types';
import ComponentTableModel from '../../components/Model/Table/ComponentTableModel';
import TextButton from '../../components/Buttom/TextButton';


const BASE_URL_API = import.meta.env.VITE_BASE_URL_API_PHOTO;

interface DataBrandProps {
    id: number
    name: string
    picturePC: string
    pictureMoblie: string
    order: string
    active: string
}


const Homesrankpage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [brandData, setBrandData] = useState<DataBrandProps[]>([]);
    const [originalBrandData, setOriginalBrandData] = useState<DataBrandProps[]>([]);
    const [notify, setNotify] = useState({
        isOpen: false,
        message: '',
        type: 'success' as 'success' | 'error' | 'warning' | 'info'
    });
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        isLoading: false,
        onConfirm: () => { }
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await apiFetch(`/api/auther/showLageMovebannerAPI`);

                const dataBrander = await response.json();

                setBrandData(dataBrander?.result || []);
                setOriginalBrandData(dataBrander?.result || []);

            } catch (error) {
                console.error("Error fetching Brander data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);
    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = brandData.findIndex((item) => item.id === active.id)
        const newIndex = brandData.findIndex((item) => item.id === over.id)
        setBrandData(arrayMove(brandData, oldIndex, newIndex));
    }


    const hasChanges = () => {
        return JSON.stringify(brandData) !== JSON.stringify(originalBrandData)
    }

    const getOrderChanges = () => {
        const changes = brandData
            .map((item, index) => {
                const oldIndex = originalBrandData.findIndex((orig) => orig.id === item.id);
                if (oldIndex !== index) {
                    return `ID: ${item.id} (${oldIndex + 1} → ${index + 1})`;
                }
                return null;
            })
            .filter(Boolean);

        return changes.length > 0 ? changes.join(', ') : 'ไม่มีการเปลี่ยนแปลง';
    };

    const handleSaveOrder = async () => {
        if (!hasChanges()) {
            setNotify({
                isOpen: true,
                message: "ไม่มีการเปลี่ยนแปลงข้อมูล",
                type: "info",
            });
            return;
        }

        const orderData = {
            newOrder: brandData.map((item, index) => ({
                int_saksolar_brander_ID: item.id,
                int_saksolar_brander_order: index + 1,
            })),
        };

        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: async () => {
                setConfirmDialog((prev) => ({ ...prev, isLoading: true }));

                try {
                    // -------- UPDATE ORDER API ----------
                    const response = await apiFetch(`/api/auther/updateLageMoveTopicAPI`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(orderData),
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result?.message || "อัปเดตลำดับไม่สำเร็จ");
                    }

                    // -------- CREATE LOG ----------
                    const actionDetail = `จัดลำดับข้อมูลหน้าแบนเนอร์หน้าหลัก ${getOrderChanges()}`;

                    const payloadlog = {
                        actionType: 13,
                        actionDetail,
                        typeUser: user?.role_name,
                        datatype: "หน้าหลัก",
                        IDPer: user?.id,
                        FullPer: `${user?.fname} ${user?.lname}`,
                    };

                    await apiFetch(`/api/auther/log`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payloadlog),
                    });

                    // -------- NOTIFY SUCCESS ----------
                    navigate("/Banner", {
                        state: {
                            notify: {
                                message: "จัดลำดับข้อมูลหน้าแบนเนอร์หน้าหลักสำเร็จ",
                                type: "success",
                            },
                        },
                    });

                } catch (error) {
                    console.error("Error Drag And Drop:", error);

                    setNotify({
                        isOpen: true,
                        message: "เกิดข้อผิดพลาดในการเรียงลำดับข้อมูล กรุณาลองใหม่อีกครั้ง",
                        type: "error",
                    });

                } finally {
                    setConfirmDialog({ isOpen: false, isLoading: false, onConfirm: () => { } });

                }
            },
        });
    };

    const columns: Column[] = [
        { id: 1, label: 'ลำดับ', width: '10%', align: 'center' },
        { id: 2, label: 'รูปแบนเนอร์', width: '30%', align: 'left' },
        { id: 3, label: 'ชื่อเรื่องแบนเนอร์', width: '40%', align: 'left' },
        { id: 4, label: '', width: '20%', align: 'center' },
    ];

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
                        pb: 2
                    }}
                >
                    <Typography variant="h6" component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, mb: 2 }}>
                        เรียงลำดับแบนเนอร์หน้าหลัก
                    </Typography>
                    <Box sx={{ px: { xs: 2, sm: 5 }, width: '100%' }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 12 }} >
                                <Box sx={{ width: '100%' }}>
                                    {loading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <Typography variant="body1" sx={{ color: theme.palette.grey[300], fontWeight: 300 }}>
                                                ... กำลังโหลด ...
                                            </Typography>
                                        </Box>
                                    ) : brandData.length > 0 ? (
                                        <Box sx={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: 500, position: 'relative' }}>
                                            <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                                                <ComponentTableModel columns={columns} largest='sm'>
                                                    <SortableContext items={brandData.map((item) => item.id)} strategy={rectSortingStrategy}>
                                                        {brandData.map((product, index) => (
                                                            <SortVediotableRow key={product.id} product={product} index={index} />
                                                        ))}
                                                    </SortableContext>
                                                </ComponentTableModel>
                                            </DndContext>
                                        </Box>
                                    ) : (
                                        <Typography variant="h6" color="textSecondary" align="center" sx={{ mt: 4 }}>
                                            ไม่พบข้อมูล
                                        </Typography>
                                    )}


                                </Box>

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

                                onClick={handleSaveOrder}
                                sx={{ backgroundColor: theme.palette.secondary.main }}

                            >
                                บันทึกการจัดลำดับ
                            </TextButton>
                        </Box>
                    </Box>
                </Box>

            </Paper>
            <ConfirmDialog
                type='alternate'
                confirmDialog={confirmDialog}
                setConfirmDialog={setConfirmDialog}
            />
            <Notifications notify={notify} setNotify={setNotify} />
        </Container>
    )
}

export default Homesrankpage
const SortVediotableRow: React.FC<{ product: DataBrandProps; index: number }> = ({ product, index }) => {
    const { attributes, listeners, setNodeRef, transform } = useSortable({ id: product.id });
    const theme = useTheme();
    return (
        <Fade in timeout={1000}>
            <TableRow
                key={product.id}
                ref={setNodeRef}
                {...attributes}
                {...listeners}
                sx={{
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                        cursor: 'pointer',
                        boxShadow: '0px rgba(0, 0, 0, 0.1)',
                    },
                    borderBottom:
                        theme.palette.mode === 'dark'
                            ? `1px solid ${theme.palette.grey[700]}`
                            : '1px solid #F0F2F4',
                    backgroundColor: product.id ? 'rgba(238, 244, 252, 0)' : 'inherit',
                    transition: 'background-color 1s ease-in-out',
                    cursor: 'grab',
                    transform: CSS.Transform.toString(transform) || undefined,
                    touchAction: 'none',
                }}
            >
                <StyledTableCell align="center">
                    {index + 1}
                </StyledTableCell>
                <StyledTableCell
                    component="th"
                    scope="row"
                    sx={{ display: 'flex', alignItems: 'flex-start' }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                            color: 'inherit',
                            width: '100%'
                        }}
                    >
                        <Box
                            component="img"
                            loading="lazy"
                            alt={product.name}
                            src={`${BASE_URL_API}/${product.picturePC}`}
                            sx={{
                                marginRight: 2,
                                filter: product.active === "0" ? 'grayscale(100%) brightness(70%) opacity(0.5)' : 'none',
                                maxWidth: 30,
                                maxHeight: 60
                            }}
                        />
                    </Box>
                </StyledTableCell>
                <StyledTableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 0.5 }}>
                        <Typography variant='body2'
                            sx={{
                                color: product.active === "0" ? 'rgba(0, 0, 0, 0.5)' : 'text.primary', fontWidth: 400
                            }}
                        >   {product.name} </Typography>
                    </Box>
                </StyledTableCell>
                <StyledTableCell align="left" >
                    <FaExpandArrowsAlt style={{ fontSize: theme.typography.h4.fontSize, color: theme.palette.grey[600] }} />
                </StyledTableCell>
            </TableRow>
        </Fade>
    )
}