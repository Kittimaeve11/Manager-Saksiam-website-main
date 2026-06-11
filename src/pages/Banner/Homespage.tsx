import { Box, Container, Paper, useMediaQuery, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react'
import { usePageTitle } from '../../Context/PageTitleContext';
import { usePermission } from '../../hooks/usePermission';
import { useAuth } from '../../Context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import MenuDropdownstatus from '../../components/Model/Dropdown/MenuDropdownstatus';
import { datastatus, datastatusBaner } from '../../API/StausData';
import type { BannerData } from '../../utils/types';
import TextButton from '../../components/Buttom/TextButton';
import AppIconButton from '../../components/Buttom/IconButton';
import { FiRefreshCw } from 'react-icons/fi';
import { apiFetch } from '../../API/client';
import ConfirmDialog from '../../components/Model/Pop_up/ConfirmDialog';
import Notifications from '../../components/Model/Pop_up/Notifications';
import ComponentsBannerTableView from '../../components/View/Banner/ComponentsBannerTableView';
import MenuDropdownSeletetext from '../../components/Model/Dropdown/MenuDropdownSeletetext';


type FileType = 'all' | 'active' | 'inactive'

const Homespage = () => {

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
  const [selectedType, setSelectedType] = useState<string | null>('all');
  const [brandData, setBrandData] = useState<BannerData>({ bannerscount: 0, bannder: [] })

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
    navigate('/Banner/create');
  };

  const handleMoveItemClick = () => {
    navigate(`/Banner/rank`);
  };

  const fetchshowBrander = useCallback(async () => {
    setLoading(true);

    try {

      const activeFilter =
        fetchFileType === "active" ? "1" :
          fetchFileType === "inactive" ? "0" : "";

      const offset = page * rowsPerPage;

      const query = new URLSearchParams({
        active: activeFilter,
        type: selectedType === 'all' ? '' : String(selectedType),
        offset: String(offset),
        limit: String(rowsPerPage),
      }).toString();

      const response = await apiFetch(`/api/auther/showbannerAPI?${query}`, {
        method: "GET",
      });

      const result = await response.json();
      setBrandData(result.data || { bannerscount: 0, bannder: [] });

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [
    fetchFileType,
    selectedType,
    page,
    rowsPerPage,
  ]);

  useEffect(() => {
    fetchshowBrander()
  }, [fetchshowBrander])

  const handleRefresh = () => {
    setFileType('all');
    setFetchFileType('all');
    setSelectedType('all');
    setPage(0);
  }

  const handleStatusChange = async (BannerID: number, newChecked: boolean) => {
    const active = newChecked ? "1" : "0";

    const payload = new FormData();
    payload.append("active", active);
    payload.append("changename", `${user?.fname} ${user?.lname}`);

    try {
      // -------- UPDATE API ----------
      const response = await apiFetch(`/api/auther/updatebannerAPI/${BannerID}`, {
        method: "POST",
        body: payload,
      });

      const result = await response.json();

      if (!response.ok) {
        setNotify({
          isOpen: true,
          message: `Error: ${result.message || "การเปลี่ยนสถานะล้มเหลว."}`,
          type: "error",
        });
        return;
      }

      // -------- LOG API ----------
      const brandName =
        brandData?.bannder?.find((b) => b.id === BannerID)
          ?.name || "Unknown";

      const payloadlog = {
        actionType: 12,
        actionDetail: `เปลี่ยนสถานะข้อมูลแบนเนอร์หน้าหลัก รหัสแบนเนอร์: ${BannerID} ${name} เป็น ${active === "1" ? "เปิดใช้งาน" : "ปิดใช้งาน"
          }`,
        datatype: "หน้าหลัก",
        dataID: BannerID,
        dataname: brandName,
        IDPer: user?.id,
        typeUser: user?.role_name,
        FullPer: `${user?.fname} ${user?.lname}`,
      };

      await apiFetch(`/api/auther/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadlog),
      });

      // -------- UPDATE UI ----------
      if (fetchFileType === "all") {
        setBrandData((prev) => ({
          ...prev,
          bannder: prev.bannder.map((item) =>
            item.id === BannerID
              ? { ...item, active: active }
              : item
          ),
        }));
      } else {
        fetchshowBrander();
      }

      setNotify({
        isOpen: true,
        message: "สถานะได้รับการอัปเดตสำเร็จ!",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      setNotify({
        isOpen: true,
        message: "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ",
        type: "error",
      });
    }
  };

  const handleDeleteChange = async (BannerID: number) => {
    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        setLoading(true);

        try {
          // -------- DELETE API ----------
          const response = await apiFetch(
            `/api/auther/deletebannerAPI/${BannerID}`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
            }
          );

          const result = await response.json();

          if (!response.ok) {
            setNotify({
              isOpen: true,
              message: `Error: ${result.message || "การลบข้อมูลล้มเหลว."}`,
              type: "error",
            });
            return;
          }

          // -------- LOG API ----------
          const brandName =
            brandData?.bannder?.find((b) => b.id === BannerID)
              ?.name || "Unknown";

          const payloadlog = {
            actionType: 11,
            actionDetail: `ลบข้อมูลแบนเนอร์หน้าหลัก รหัสแบนเนอร์: ${BannerID}  ${name}`,
            IDPer: user?.id,
            typeUser: user?.role_name,
            datatype: "หน้าหลัก",
            dataID: BannerID,
            dataname: brandName,
            FullPer: `${user?.fname} ${user?.lname}`,
          };

          await apiFetch(`/api/author/log`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadlog),
          });

          // -------- UPDATE UI ----------
          if (fetchFileType === "all") {
            setBrandData((prev) => ({
              ...prev,
              branderscounts: prev.bannder.filter(
                (item) => item.id !== BannerID
              ),
            }));
          } else {
            fetchshowBrander();
          }

          setNotify({
            isOpen: true,
            message: "ข้อมูลถูกลบสำเร็จ!",
            type: "success",
          });
        } catch (error) {
          console.error("Error deleting photo:", error);
          setNotify({
            isOpen: true,
            message: "เกิดข้อผิดพลาดในการลบข้อมูล",
            type: "error",
          });
        } finally {
          setConfirmDialog({
            isOpen: false,
            isLoading: false,
            onConfirm: () => { },
          });
          setLoading(false);
        }
      },
    });
  };
  useEffect(() => {
    // fetchUsers()
    setTitle("การจัดการข้อมูลแบนเนอร์");
    if (location.state?.notify) {
      setNotify({
        isOpen: true,
        message: location.state.notify.message,
        type: location.state.notify.type,
      });
    }
  }, [location.state])


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
            <MenuDropdownSeletetext
              titlename='หมวดหมู่หน้า'
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              statusOptions={datastatusBaner}
            />
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
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              mx: { xs: 1, md: 0, xl: 0 },
              mt: { xs: 1, md: 3 },
              width: '100%'
            }}
          >
            {can("Add Brander") && (
              <TextButton
                onClick={handleAddItemClick}
              >
                เพิ่มแบนเนอร์
              </TextButton>

            )}
            {can("DropDown Brander") && (
              <TextButton
                variant="outlined"
                sx={{
                  color: 'black',
                  borderColor: theme.palette.grey[900],
                  backgroundColor: 'white'
                }}
                onClick={handleMoveItemClick}
              >
                เรียงลำดับแบนเนอร์หน้าหลัก
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
          <ComponentsBannerTableView
            brandData={brandData}
            loading={loading}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            handleDeleteChange={handleDeleteChange}
            handleStatusChange={handleStatusChange}
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

export default Homespage
