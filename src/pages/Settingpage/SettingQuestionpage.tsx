import { Box, Container, Fade, Paper, useMediaQuery, useTheme } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import { usePageTitle } from '../../Context/PageTitleContext';
import { usePermission } from '../../hooks/usePermission';
import { useAuth } from '../../Context/AuthContext';
import MenuDropdownstatus from '../../components/Model/Dropdown/MenuDropdownstatus';
import { datastatusType } from '../../API/StausData';
import TextButton from '../../components/Buttom/TextButton';
import AppIconButton from '../../components/Buttom/IconButton';
import { FiRefreshCw } from 'react-icons/fi';
import type { TopicsData } from '../../utils/types';
import { apiFetch } from '../../API/client';
import ComponentsTopicTableView from '../../components/View/Topic/ComponentsTopicTableView';
import ComponentTopicsAddForm from '../../components/View/Topic/ComponentTopicsAddForm';
import Notifications from '../../components/Model/Pop_up/Notifications';
import ConfirmDialog from '../../components/Model/Pop_up/ConfirmDialog';
import ComponentTopicEditForm from '../../components/View/Topic/ComponentTopicEditForm';
import { useNavigate } from 'react-router-dom';

type FileType = 'all' | 'active' | 'inactive'

const SettingQuestionpage = () => {
    const { setTitle } = usePageTitle();
const navigate = useNavigate();
    const theme = useTheme();
    const isMediumScreen = useMediaQuery(theme.breakpoints.between('xl', 1800));
    const { can } = usePermission();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showEditForm, setEditForm] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [editTopicId, setEditTopicId] = useState<number | null>(null);
    const [fileType, setFileType] = useState<FileType>('all');
    const [fetchFileType, setFetchFileType] = useState<FileType>('all');
    const [topicsData, setTopicsData] = useState<TopicsData>({ counts: 0, topics: [] })

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


    const handleFileTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const newFileType = event.target.value as FileType;
        setFileType(newFileType);
        setFetchFileType(newFileType);
    };

    const handleRefresh = () => {
        setFileType('all');
        setFetchFileType('all');
        setPage(0);
    }

    const handleAddItemClick = () => {
        setEditForm(false);
        setShowForm(true);
    };
    const handleEditItemClick = (topicId: number) => {
        setEditTopicId(topicId)   // 👈 สำคัญ
        setEditForm(true)
           setShowForm(false);
    };
      const handleMoveItemClick = () => {
    navigate('/Settings_Question/rank');
  };

    const fetchshowTopics = useCallback(async () => {
        try {
            let activeFilter = '';
            if (fetchFileType === 'active') {
                activeFilter = '1';
            } else if (fetchFileType === 'inactive') {
                activeFilter = '0';
            }
            const offset = page * rowsPerPage;
            const query = new URLSearchParams({
                active: activeFilter,
                offset: String(offset),
                limit: String(rowsPerPage),
            }).toString();
            const response = await apiFetch(`/api/auther/showTopicAPI?${query}`, {
                method: "GET",
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            const result = await response.json();
            setTopicsData(result.data || { counts: 0, topics: [] })
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [fetchFileType, page, rowsPerPage])


    const handleStatusChange = async (TopicID: number, newChecked: boolean) => {
        const active = newChecked ? "1" : "0";
        const topicData = topicsData.topics.find(item => item.topic_id === TopicID);
        const topicname = topicData ? topicData?.nameTH : "Unknown";
        const payload = {
            active,
            changename: `${user?.fname} ${user?.lname}`,
        }

        try {
            const response = await apiFetch(`/api/auther/updateTopicAPI/${TopicID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setNotify({
                    isOpen: true,
                    message: `Error: ${errorData.message || 'การเปลี่ยนสถานะล้มเหลว.'}`,
                    type: 'error',
                });
                return;
            }
            const payloadlog = {
                actionType: 11,
                actionDetail: `เปลี่ยนสถานะข้อมูลหัวข้อแบบสอบถาม ID:${TopicID} หัวข้อแบบสอบถามภาษาไทย:${topicname} เป็น ${active === "1" ? "เปิดใช้งาน" : "ปิดใช้งาน"}`,
                typeUser: user?.role_name,
                datatype: 'หัวข้อแบบสอบถาม',
                dataID: TopicID,
                dataname: topicname,
                IDPer: user?.id,
                FullPer: `${user?.fname} ${user?.lname}`,
            };
            await apiFetch(`/api/auther/log`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloadlog),
            });
            if (fetchFileType === 'all') {
                setTopicsData((prevState) => {
                    const updatedTopic = prevState.topics.map((item) =>
                        item.topic_id === TopicID ? { ...item, active } : item
                    );
                    return { ...prevState, topics: updatedTopic };
                });
            } else {
                fetchshowTopics();
            }
            setNotify({
                isOpen: true,
                message: 'สถานะได้รับการอัปเดตสำเร็จ!',
                type: 'success',
            });
        } catch (error) {
            console.error("Error updating status:", error);
            setNotify({
                isOpen: true,
                message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ',
                type: 'error',
            });
        }
    }

    const handleDeleteChange = async (TopicID: number) => {
        setConfirmDialog({
            isOpen: true,
            isLoading: false,
            onConfirm: async () => {
                setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
                setLoading(true);
                try {
                    const response = await apiFetch(
                        `/api/auther/deleteTopicAPI/${TopicID}`,
                        {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                        }
                    );
                    if (!response.ok) {
                        const errorData = await response.json();
                        setNotify({
                            isOpen: true,
                            message: `Error: ${errorData.message || 'การลบข้อมูลล้มเหลว.'}`,
                            type: 'error',
                        });
                        return;
                    }
                    const payloadlog = {
                        actionType: 10,
                        actionDetail: `ลบข้อมูลหัวข้อแบบสอบถาม รหัสหัวข้อแบบสอบถาม: ${TopicID}  ${topicsData?.topics?.find(item => item.topic_id === TopicID)?.nameTH || 'Unknown'}`,
                        typeUser: user?.role_name,
                        datatype: 'หัวข้อแบบสอบถาม',
                        dataID: TopicID,
                        dataname: topicsData?.topics?.find(item => item.topic_id === TopicID)?.nameTH,
                        IDPer: user?.id,
                        FullPer: `${user?.fname} ${user?.lname}`,
                    };
                    await apiFetch(`/api/auther/log`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payloadlog),
                    });

                    setNotify({
                        isOpen: true,
                        message: 'ข้อมูลถูกลบสำเร็จ!',
                        type: 'success',
                    });

                    if (fetchFileType === 'all') {
                        setTopicsData((prevState) => {
                            const filtered = prevState.topics.filter(
                                (item) => item.topic_id !== TopicID
                            );
                            return {
                                ...prevState,
                                topics: filtered,
                            };
                        });
                    } else {
                        fetchshowTopics();
                    }
                } catch (error) {
                    console.error("Error deleting photo:", error);
                    setNotify({
                        isOpen: true,
                        message: 'เกิดข้อผิดพลาดในการลบข้อมูล',
                        type: 'error',
                    });
                } finally {
                    setConfirmDialog({
                        isOpen: false,
                        isLoading: false,
                        onConfirm: () => { }, // Reset the confirm dialog
                    });
                    setLoading(false); // Ensure the loading spinner stops
                }
            }
        })
    }

    useEffect(() => {
        fetchshowTopics()
        setTitle("การจัดการข้อมูลหัวข้อแบบสอบถาม");
    }, [fetchshowTopics])

    return (
        <Container maxWidth='xl'>

            {showForm && (
                <Fade in={showForm} timeout={400} >
                    <Box sx={{
                        pt: 5,

                    }}>
                        <Paper >

                            {/* 👉 ใส่ form ของคุณตรงนี้ */}
                            <ComponentTopicsAddForm
                                setOpenPopup={setShowForm}
                                fetchshowTopics={fetchshowTopics}
                                setNotify={setNotify}
                                page={page}
                                rowsPerPage={rowsPerPage}
                                fullnamePer={`${user?.fname ?? ""} ${user?.lname ?? ""}`}
                                typeUser={`${user?.role_name ?? ""}`}
                                IDPer={`${user?.id ?? ""}`}
                            />
                        </Paper>
                    </Box>
                </Fade>
            )}
            {showEditForm && (
                <Fade in={showEditForm} timeout={400}>
                    <Box sx={{ pt: 5 }}>
                        <Paper>
                            <ComponentTopicEditForm
                             topicId={editTopicId} 
                                setOpenPopup={setEditForm}
                                fetchshowTopics={fetchshowTopics}
                                setNotify={setNotify}
                                page={page}
                                rowsPerPage={rowsPerPage}
                                fullnamePer={`${user?.fname ?? ""} ${user?.lname ?? ""}`}
                                typeUser={`${user?.role_name ?? ""}`}
                                IDPer={`${user?.id ?? ""}`}
                            />
                        </Paper>
                    </Box>
                </Fade>
            )}
            <Paper
                elevation={0} sx={{
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
                        flexDirection: isMediumScreen ? 'row' : { xs: 'column', md: 'row' },
                        justifyContent: { xs: 'flex-start', lg: 'space-between' },
                        alignItems: isMediumScreen ? 'center' : { xs: 'flex-start', lg: 'center' },
                        width: '100%',
                        flexWrap: 'nowrap',
                        gap: 2,
                        px: 3,
                        pb: 4
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: { xs: 'column', md: 'row' },
                            // justifyContent: { xs: 'space-between', md: 'flex-start' },
                            width: { xs: '100%', md: 'auto' },
                            mx: { xs: 1, md: 0, xl: 0 }
                        }}
                    >

                        <MenuDropdownstatus
                            titlename='สถานะ'
                            handleFileTypeChange={handleFileTypeChange}
                            fileType={fileType}
                            statusOptions={datastatusType}
                        />
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: { xs: 'column', md: 'row' },
                            justifyContent: { xs: 'flex-start', md: 'flex-end' },
                            mx: { xs: 1, md: 0, xl: 0 },
                            mt: { xs: 1, md: 3 },
                            width: '100%'
                        }}
                    >
                        {can("Add Question") && (
                            <TextButton onClick={handleAddItemClick} >
                                เพิ่มหัวข้อแบบสอบถาม
                            </TextButton>

                        )}
                        {can("DropDown Question") && (
                            <TextButton
                                variant="outlined"
                                sx={{
                                    color: 'black',
                                    borderColor: theme.palette.grey[900],
                                    backgroundColor: 'white'
                                }}
                            onClick={handleMoveItemClick} 
                            >
                                เรียงลำดับหัวข้อแบบสอบถาม
                            </TextButton>

                        )}

                        <AppIconButton
                            title="รีเฟรชข้อมูล"
                            onClick={handleRefresh}


                        >
                            <FiRefreshCw
                                style={{
                                    fontSize: theme.typography.h6.fontSize,
                                    strokeWidth: 2.5,
                                }}
                            />
                        </AppIconButton>
                    </Box>
                </Box>
                <Box sx={{ px: 3 }}>
                    <ComponentsTopicTableView
                        topicsData={topicsData}
                        loading={loading}
                        page={page}
                        setPage={setPage}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        handleResetPasswordItemClick={handleDeleteChange}
                        handleStatusChange={handleStatusChange}
                        fetchshowTopics={fetchshowTopics}
                       handleEditItemClick={handleEditItemClick}
                        can={can}
                    />
                </Box>
            </Paper>
            <ConfirmDialog
                type='delete'
                confirmDialog={confirmDialog}
                setConfirmDialog={setConfirmDialog}
            />
            <Notifications notify={notify} setNotify={setNotify} />
        </Container>
    )
}

export default SettingQuestionpage
