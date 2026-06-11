import { Box, Container, Paper, useTheme } from '@mui/material'
import { useLocation } from "react-router-dom";
import Notifications from "../../components/Model/Pop_up/Notifications";
import { useCallback, useEffect, useState } from 'react'
import { usePermission } from '../../hooks/usePermission';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw } from 'react-icons/fi';
import ComponemtsRoleTableView from '../../components/View/Role/ComponemtsRoleTableView';
import { apiFetch } from '../../API/client';
import TextButton from '../../components/Buttom/TextButton';
import AppIconButton from '../../components/Buttom/IconButton';
import { usePageTitle } from '../../Context/PageTitleContext';

interface RolePermisionData {
  counts: number;
  roles: any[];
}

const Permistionpage = () => {
  const { setTitle } = usePageTitle();

  const theme = useTheme();
  const { can } = usePermission();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [roleData, setRoleData] = useState<RolePermisionData>({ counts: 0, roles: [] })

  const location = useLocation();

const [notify, setNotify] = useState({
  isOpen: false,
  message: "",
  type: "success" as "success" | "error" | "warning" | "info",
});

  const handleAddItemClick = () => {
    navigate('/RolePermission/create');
  };

  const handleRefresh = () => {
    setPage(0);
  }

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const offset = page * rowsPerPage;
      const query = new URLSearchParams({
        offset: String(offset),
        limit: String(rowsPerPage),
      }).toString();

      // ---- Call API ----
      const response = await apiFetch(`/api/auther/showRolePermissionAPI?${query}`, {
        method: "GET",
      });

      const result = await response.json();
      setRoleData(result.data || { counts: 0, roles: [] })

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage])

  useEffect(() => {
    fetchRoles()
    setTitle("การจัดการสิทธิ");
     if (location.state?.notify) {
    setNotify({
      isOpen: true,
      message: location.state.notify.message,
      type: location.state.notify.type,
    });
  }
  }, [fetchRoles,location.state])
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
            // flexDirection: isMediumScreen ? 'row' : { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            // alignItems: isMediumScreen ? 'center' : { xs: 'flex-start', lg: 'center' },
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
              // alignItems: 'center',
              // flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'flex-start',
              width: { xs: '100%', md: 'auto' },
              mx: { xs: 1, md: 0, xl: 0 }
            }}
          >
            {can("Add Role") && (
              <TextButton onClick={handleAddItemClick} >
                เพิ่มข้อมูลสิทธิ
              </TextButton>

            )}

          </Box>
          <Box
            sx={{
              display: 'flex',
              // alignItems: 'center',
              // flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'flex-end',
              mx: { xs: 1, md: 0, xl: 0 },
              width: '100%'
            }}
          >
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
          <ComponemtsRoleTableView
            roleData={roleData}
            loading={loading}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            can={can}
          />
        </Box>
      </Paper>
      <Notifications notify={notify} setNotify={setNotify} />
    </Container>
  )
}

export default Permistionpage
