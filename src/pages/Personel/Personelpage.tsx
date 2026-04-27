import { Box, Container, Paper, useMediaQuery, useTheme } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import { usePageTitle } from '../../Context/PageTitleContext';
import { usePermission } from '../../hooks/usePermission';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AutherData } from '../../utils/types';
import { apiFetch } from '../../API/client';
import { useAuth } from '../../Context/AuthContext';
import ComponentRoletypeSelete from '../../components/View/Role/ComponentRoletypeSelete';
import { datastatus } from '../../API/StausData';
import AppIconButton from '../../components/Model/Buttom/IconButton';
import { FiRefreshCw } from 'react-icons/fi';
import TextButton from '../../components/Model/Buttom/TextButton';
import ComponentsUserTableView from '../../components/View/Users/ComponentsUserTableView';
import MenuDropdownstatus from '../../components/Model/Dropdown/MenuDropdownstatus';
import Notifications from '../../components/Model/Pop_up/Notifications';
import ConfirmDialog from '../../components/Model/Pop_up/ConfirmDialog';

type FileType = 'all' | 'active' | 'inactive'

const Personelpage = () => {
  const { setTitle } = usePageTitle();

  const theme = useTheme();
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
  const [selectedRoleType, setSelectedRoleType] = useState<number | null>(0);
  const [usersData, setUsersData] = useState<AutherData>({ counts: 0, users: [] })

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
    setSelectedRoleType(0);
  }

  const handleAddItemClick = () => {
    navigate('/Personel/create');
  };

  const handleResetPasswordItemClick = async (personnelID: number) => {
    const payload = new FormData();
    payload.append('user_id', String(personnelID));
    payload.append('updatename', `${user?.fname ?? ""} ${user?.lname ?? ""}`);
    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        setLoading(true);

        try {
          const response = await apiFetch(`/api/auther/resetPasswordapi`, {
            method: "POST",
            body: payload,   // ส่ง FormData
            // ห้ามตั้ง Content-Type เองเมื่อใช้ FormData
          });

          const data = await response.json();

          if (!response.ok || !data.status) {
            setNotify({
              isOpen: true,
              message: `Error: ${data.message || 'รีเซ็ตพาสเวิร์ดล้มเหลว'}`,
              type: 'error',
            });
            return;
          }
          const logPayload = {
            actionType: 20,
            actionDetail: `รีเซ็ตรหัสผ่านให้ User ID: ${personnelID}`,
            datatype: 'personnel',
            dataID: personnelID,
            typeUser: user?.role_name,
            IDPer: user?.id,
            FullPer: `${user?.fname} ${user?.lname}`,
          };

          await apiFetch(`/api/auther/log`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(logPayload),
          });

          setNotify({
            isOpen: true,
            message: 'รีเซ็ตรหัสผ่านสำเร็จ',
            type: 'success',
          });

        } catch (error) {
          console.error("Error reset password:", error);
          setNotify({
            isOpen: true,
            message: 'เกิดข้อผิดพลาดในการรีเซ็ตพาสเวิร์ด',
            type: 'error',
          });
        } finally {
          setConfirmDialog({
            isOpen: false,
            isLoading: false,
            onConfirm: () => { },
          });
          setLoading(false);
        }
      }
    });
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let activeFilter = '';
      if (fetchFileType === 'active') {
        activeFilter = '1';
      } else if (fetchFileType === 'inactive') {
        activeFilter = '0';
      }
      const offset = page * rowsPerPage;
      const query = new URLSearchParams({
        roleID: selectedRoleType !== null ? String(selectedRoleType) : "",
        active: activeFilter,
        offset: String(offset),
        limit: String(rowsPerPage),
      }).toString();

      // ---- Call API ----
      const response = await apiFetch(`/api/auther/showUserAPI?${query}`, {
        method: "GET",
      });

      const result = await response.json();
      setUsersData(result.data || { counts: 0, users: [] })

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchFileType, page, rowsPerPage, selectedRoleType])

  useEffect(() => {
    fetchUsers()
    setTitle("การจัดการข้อมูลผู้ใช้งาน");
    if (location.state?.notify) {
      setNotify({
        isOpen: true,
        message: location.state.notify.message,
        type: location.state.notify.type,
      });
  }
    }, [fetchUsers,location.state])

  return (
    <Container maxWidth='xl'>
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
            <ComponentRoletypeSelete
              selectedRoleType={selectedRoleType}
              setSelectedRoleType={setSelectedRoleType}
            />
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
            {can("Add User") && (
              <TextButton onClick={handleAddItemClick} >
                เพิ่มข้อมูลผู้ใช้งาน
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
          <ComponentsUserTableView
            usersData={usersData}
            loading={loading}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            handleResetPasswordItemClick={handleResetPasswordItemClick}
            fetchUsers={fetchUsers}
            setNotify={setNotify}
            currentUserId={user?.id ?? 0}
            can={can}
            fullnamePer={`${user?.fname ?? ""} ${user?.lname ?? ""}`}
            typeUser={`${user?.role_name ?? ""}`}
            IDPer={`${user?.id ?? ""}`}
          />
        </Box>
      </Paper>
              <ConfirmDialog
                type='reset'
                confirmDialog={confirmDialog}
                setConfirmDialog={setConfirmDialog}
            />
            <Notifications notify={notify} setNotify={setNotify} />
    </Container>
  )
}

export default Personelpage
