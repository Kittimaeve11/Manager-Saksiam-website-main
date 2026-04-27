import { Box, Container, Paper, useMediaQuery, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react'
import { usePageTitle } from '../../Context/PageTitleContext';
import { usePermission } from '../../hooks/usePermission';
import { useAuth } from '../../Context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import type { BranchData } from '../../utils/types';
import { apiFetch } from '../../API/client';
import MenuDropdownstatus from '../../components/Model/Dropdown/MenuDropdownstatus';
import { datastatus } from '../../API/StausData';
import TextButton from '../../components/Model/Buttom/TextButton';
import AppIconButton from '../../components/Model/Buttom/IconButton';
import { FiRefreshCw } from 'react-icons/fi';
import Notifications from '../../components/Model/Pop_up/Notifications';
import ComponentsBranchTableView from '../../components/View/Branch/ComponentsBranchTableView';

type FileType = 'all' | 'active' | 'inactive'

const Branchpage = () => {
    const theme = useTheme();
    const { setTitle } = usePageTitle();

    const isMediumScreen = useMediaQuery(theme.breakpoints.between('xl', 1800));
    const { can } = usePermission();
    const { user } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [fileType, setFileType] = useState<FileType>('all');
    const [fetchFileType, setFetchFileType] = useState<FileType>('all');
    const [selectedType, setSelectedType] = useState('all');
    const [branchData, setBranchData] = useState<BranchData>({ counts: 0, data: [] })

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

    const handleAddItemClick = () => {
        navigate('/Branch/create');
    };


    const fetchshowBranch = useCallback(async () => {
        setLoading(true);

        try {

            const activeFilter =
                fetchFileType === "active" ? "1" :
                    fetchFileType === "inactive" ? "0" : "";

            const offset = page * rowsPerPage;

            const query = new URLSearchParams({
                active: activeFilter,
                offset: String(offset),
                limit: String(rowsPerPage),
            }).toString();

            const response = await apiFetch(`/api/auther/showBranchAPI?${query}`, {
                method: "GET",
            });

            const result = await response.json();
            setBranchData(result.data || { counts: 0, data: [] });

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [
        fetchFileType,
        page,
        rowsPerPage,
    ]);

    useEffect(() => {
        fetchshowBranch()
        setTitle("การจัดการข้อมูลสาขา");
    }, [fetchshowBranch])

    const handleRefresh = () => {
        setFileType('all');
        setFetchFileType('all');
        setPage(0);
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
                            justifyContent: { xs: 'space-between', md: 'flex-start' },
                            width: { xs: '100%', md: 'auto' },
                        }}
                    >
                        <MenuDropdownstatus
                            titlename='สถานะ'
                            handleFileTypeChange={handleFileTypeChange}
                            fileType={fileType}
                            statusOptions={datastatus}
                        />
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: { xs: 'flex-start', md: 'flex-end' },

                            mt: { xs: 1, md: 3 },
                            width: '100%'
                        }}
                    >
                        {can("Add Branch") && (
                            <TextButton
                                sx={{ width: { xs: '100%', md: 'auto' } }}
                                onClick={handleAddItemClick}
                            >
                                เพิ่มสาขา
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
                    <ComponentsBranchTableView
                        branchData={branchData}
                        loading={loading}
                        page={page}
                        setPage={setPage}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        fetchshowBranch={fetchshowBranch}
                        can={can}
                    />
                </Box>
                <Notifications notify={notify} setNotify={setNotify} />
            </Paper>
        </Container>
    )
}

export default Branchpage
