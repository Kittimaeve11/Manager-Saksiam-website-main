import { Box, Container, Fade, Grid, Paper, TableRow, Typography, useTheme } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../Context/AuthContext';
import { apiFetch } from '../../API/client';
import { SortableContext, arrayMove, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import type { Column } from '../../utils/types';
import ComponentTableModel from '../../components/Model/Table/ComponentTableModel';
import StyledTableCell from '../../components/Model/Table/StyledTableCell';
import { FaExpandArrowsAlt } from 'react-icons/fa';
import TextButton from '../../components/Model/Buttom/TextButton';
import ConfirmDialog from '../../components/Model/Pop_up/ConfirmDialog';
import Notifications from '../../components/Model/Pop_up/Notifications';

interface DataTopicsProps {
    topic_ID: number
    nameTH: string
    nameEN: string
}

const SettingQuestionRankpage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();


    const [loading, setLoading] = useState(true);
    const [topics, setTopics] = useState<DataTopicsProps[]>([])
    const [originalTopicsData, setOriginalTopicsData] = useState<DataTopicsProps[]>([])
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
                const response = await apiFetch(`/api/auther/showLageMoveTopicAPI`);


                if (!response.ok) {
                    throw new Error('Error fetching data');
                }
                const dataTopics = await response.json();
                setTopics(dataTopics?.result || []);
                setOriginalTopicsData(dataTopics?.result || []);

            } catch (error) {
                console.error('Error fetching Topics data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchInitialData()
    }, [])

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = topics.findIndex((item) => item.topic_ID === active.id);
        const newIndex = topics.findIndex((item) => item.topic_ID === over.id);
        setTopics(arrayMove(topics, oldIndex, newIndex));
    };

    const hasChanges = () => {
        return JSON.stringify(topics) !== JSON.stringify(originalTopicsData);
    }
    const getOrderChanges = () => {
        const changes = topics
            .map((item, index) => {
                const oldIndex = originalTopicsData.findIndex((orig) => orig.topic_ID === item.topic_ID);
                if (oldIndex !== index) {
                    return `ID: ${item.topic_ID} (${oldIndex + 1} → ${index + 1})`;
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
                message: 'ไม่มีการเปลี่ยนแปลงข้อมูล',
                type: 'info',
            });
            return;
        }
        const orderData = {
            newOrder: topics.map((item, index) => ({
                int_saksolar_topic_id: item.topic_ID,
                int_saksolar_topic_order: index + 1
            }))
        }
        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: async () => {
                setConfirmDialog((prev) => ({ ...prev, isLoading: true }))
                try {
                    const response = await apiFetch(`/api/auther/updateLageMoveTopicAPI`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(orderData),
                    });

                    if (!response.ok) {
                        throw new Error(
                            `Error: ${response.status} ${response.statusText}`
                        );
                    }
                    const actionDetail = `ฟอร์มการจัดลำดับหัวข้อแบบสอบถาม ${getOrderChanges()}`;
                    const payloadlog = {
                        actionType: 12,
                        actionDetail: actionDetail,
                        typeUser: user?.role_name,
                        datatype: 'หัวข้อแบบสอบถาม',
                        IDPer: user?.id,
                        FullPer: `${user?.fname} ${user?.lname}`,
                    };
                    await apiFetch(`/api/auther/log`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payloadlog),
                    });


                    navigate("/Settings_Question", {
                        state: {
                            notify: {
                                message: "เพิ่มข้อมูลแบนเนอร์สำเร็จ",
                                type: "success",
                            },
                        },
                    });
                } catch (error) {
                    console.error('Error Drag And Drop:', error);
                    setNotify({
                        isOpen: true,
                        message: 'เกิดข้อผิดพลาดในการเรียงลำดับข้อมูล กรุณาลองใหม่อีกครั้ง',
                        type: 'error',
                    });
                } finally {
                    setConfirmDialog({ isOpen: false, isLoading: false, onConfirm: () => { } });

                }
            }
        })
    }

    const columns: Column[] = [
        { id: 1, label: 'ลำดับ', width: '10%', align: 'center' },
        { id: 2, label: 'หัวข้อแบบสอบถามภาษาไทย', width: '20%', align: 'left' },
        { id: 3, label: 'หัวข้อแบบสอบถามภาษาอังกฤษ', width: '20%', align: 'left' },
        { id: 4, label: '', width: '5%', align: 'center' },
    ]
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
                    <Typography variant="h6" component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600,mb:2 }}>
                        เรียงลำดับหัวข้อแบบสอบถาม
                    </Typography>
                    <Box width='100%' sx={{ px: { xs: 2, sm: 5 } }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 12 }} >
                                <Box sx={{ width: '100%' }}>
                                    {loading ? (
                                        <Box display="flex" justifyContent="center" alignItems="center">
                                            <Typography variant="body1" color={theme.palette.grey[300]} fontWeight={300}>
                                                ... กำลังโหลด ...
                                            </Typography>
                                        </Box>
                                    ) : topics.length > 0 ? (
                                        <Box sx={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: 500, position: 'relative' }}>
                                            <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                                                <ComponentTableModel columns={columns} largest='md'>
                                                    <SortableContext items={topics.map((item) => item.topic_ID)} strategy={rectSortingStrategy}>
                                                        {topics.map((product, index) => (
                                                            <SortVediotableRow key={product.topic_ID} product={product} index={index} />
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

export default SettingQuestionRankpage


const SortVediotableRow: React.FC<{ product: DataTopicsProps; index: number }> = ({ product, index }) => {
    const { attributes, listeners, setNodeRef, transform } = useSortable({ id: product.topic_ID });
    const theme = useTheme();
    return (
        <Fade in timeout={1000}>
            <TableRow
                key={product.topic_ID}
                ref={setNodeRef}
                {...attributes}
                {...listeners}
                sx={{
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                        cursor: 'pointer',
                        boxShadow: '0px rgba(0, 0, 0, 0.1)',
                    },
                    borderBottom: '1px solid #F2F3F5',
                    backgroundColor: product.topic_ID ? 'rgba(238, 244, 252, 0)' : 'inherit',
                    transition: 'background-color 1s ease-in-out',
                    cursor: 'grab',
                    transform: CSS.Transform.toString(transform) || undefined,
                    touchAction: 'none',
                }}
            >
                <StyledTableCell align="center">
                    {index + 1}
                </StyledTableCell>
                <StyledTableCell>
                    <Typography fontWeight={400} variant="body2">
                        {product.nameTH}
                    </Typography>
                </StyledTableCell>
                <StyledTableCell>
                    <Typography fontWeight={400} variant="body2">
                        {product.nameEN}
                    </Typography>
                </StyledTableCell>
                <StyledTableCell align="left" >
                    <FaExpandArrowsAlt style={{ fontSize: theme.typography.h4.fontSize, color: theme.palette.grey[600] }} />
                </StyledTableCell>
            </TableRow>
        </Fade>
    )
}