import React, { useState } from 'react'
import type { AutherData, AutherDataProps, Column, } from '../../../utils/types'
import { Box, TableCell, TablePagination, TableRow, Typography, useTheme } from '@mui/material';
import { apiFetch } from '../../../API/client';
import ComponentTableModel from '../../Model/Table/ComponentTableModel';
import NoImage from '../../../assets/Image/dastano.png'
import Loading from '../../../assets/Image/Loading.gif'
import StyledTableCell from '../../Model/Table/StyledTableCell';
import ComponentsDateTable from '../../Model/Table/ComponentsDateTable';
import ChipButton from '../../Buttom/ChipButton';
import AppIconButton from '../../Buttom/IconButton';
import { HiPencil } from 'react-icons/hi';
import { GrPowerReset } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';
import Dialogs from '../../Model/Pop_up/Dialog';
import ComponentUserShowForm from './ComponentUserShowForm';
export interface ComponemtsUserTableViewProps {
    usersData: AutherData
    loading: boolean
    page: number
    rowsPerPage: number
    setPage: React.Dispatch<React.SetStateAction<number>>
    setRowsPerPage: React.Dispatch<React.SetStateAction<number>>
    handleResetPasswordItemClick: (personnelID: number) => Promise<void>
    fetchUsers: () => Promise<void>
    setNotify: React.Dispatch<React.SetStateAction<{
        isOpen: boolean;
        message: string;
        type: "success" | "error" | "warning" | "info";
    }>>;
    currentUserId: number
    fullnamePer: string
    IDPer: string
    typeUser: string
    can: (slug: string) => boolean
}
const ComponentsUserTableView: React.FC<ComponemtsUserTableViewProps> = ({
    usersData,
    loading,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    setNotify,
    handleResetPasswordItemClick,
    fetchUsers,
    currentUserId,
    fullnamePer,
    typeUser,
    IDPer,
    can
}) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const columns: Column[] = [
        { id: 1, label: 'ลำดับ', width: '5%', align: 'center' },
        { id: 2, label: 'ชื่อ - นามสกุล', width: '20%', align: 'left' },
        { id: 3, label: 'ชื่อเล่น', width: '8%', align: 'left' },
        { id: 4, label: 'อีเมล์', width: '15%', align: 'center' },
        { id: 5, label: 'หมายเลข 6 หลัก', width: '7%', align: 'center' },
        { id: 6, label: 'สิทธิ', width: '15%', align: 'center' },
        { id: 7, label: 'ชื่อ/วันที่อัปโหลดข้อมูล', width: '15%', align: 'center' },
        { id: 8, label: 'สถานะ', width: '8%', align: 'center' },
        { id: 9, label: 'จัดการข้อมูล', width: '7%', align: 'center' }
    ];

    const columnsToShow = (can("Edit User") || can("Reset Password"))
        ? columns
        : columns.filter(col => col.id !== 9);

    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [fadeOut, setFadeOut] = useState(false);
    const [selectedPersonalId, setSelectedPersonalId] = useState<number | null>(null)
    const [openShowItemPopup, setOpenShowItemPopup] = useState(false);

    const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    const handleEditItemClick = (personelID: number) => {
        navigate(`/Personel/edit/${personelID}`);
    };

    const handleshowItemClick = async (item: AutherDataProps) => {
        try {
            const payload = {
                actionType: 14,
                actionDetail: `ดูรายละเอียดผู้ใช้งาน รหัสผู้ใช้งาน:${item.user_id} ชื่อผู้ใช้งาน: ${item.pname}  ${item.fname}  ${item.lname} `,
                typeUser,
                datatype: 'ผู้ใช้งาน',
                dataID: item.user_id,
                dataname: fullnamePer,
                datatypeID: item.user_id,
                IDPer,
                FullPer: fullnamePer
            };

            // ยิง log
            await apiFetch(`/api/auther/log`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
        } catch (error) {
            console.error('Error logging product view:', error);
        } finally {
            setSelectedPersonalId(item.user_id)
            setOpenShowItemPopup(true);
        }
    };

    const handleRowClick = (personelID: number) => {
        setSelectedRow(personelID);
        setFadeOut(false);
        setTimeout(() => {
            setFadeOut(true);
        }, 5000);
        setTimeout(() => {
            setSelectedRow(null);
            setFadeOut(false);
        }, 5000);
    };

    return (
        <Box>
            <ComponentTableModel columns={columnsToShow} largest='xl'>
                {loading ? (
                    <TableRow>
                        <StyledTableCell colSpan={9} align="center" sx={{ py: 3 }}>
                            <img src={Loading} alt="No photos" style={{ width: '4%', marginBottom: '20px' }} />
                        </StyledTableCell>
                    </TableRow>
                ) : usersData.users.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                            <img src={NoImage} alt="No photos" style={{ width: '20%', marginBottom: '20px' }} />
                        </TableCell>
                    </TableRow>
                ) : (
                    usersData.users.map((item, index) => (
                        <TableRow
                            key={item.user_id}
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
                                backgroundColor:
                                    selectedRow === item.user_id
                                        ? fadeOut
                                            ? 'rgba(238, 244, 252, 0)'
                                            : theme.palette.mode === 'dark'
                                                ? theme.palette.grey[700]
                                                : '#F0F2F4'
                                        : 'inherit',
                                // backgroundColor: 'transparent',
                                transition: 'background-color 1s ease-in-out'
                            }}
                        >
                            <StyledTableCell align="center">
                                {page * rowsPerPage + index + 1}
                            </StyledTableCell>
                            <StyledTableCell>
                                <Typography fontWeight={400} variant="body2" sx={{ lineHeight: 1.3 }}>
                                    {item.usernum}

                                    <br />

                                    {item.pname !== "-"
                                        ? `${item.pname} ${item.fname} ${item.lname}`
                                        : `${item.fname} ${item.lname}`
                                    }
                                </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                                <Typography fontWeight={400} variant="body2">
                                    {item.nickname}
                                </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                                <Typography fontWeight={400} variant="body2">
                                    {item.email}
                                </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                                <Typography fontWeight={400} variant="body2">
                                    {item.phone6}
                                </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                                <Typography fontWeight={400} variant="body2">
                                    {item.role_name}
                                </Typography>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                                <ComponentsDateTable
                                    fullname={item.savename}
                                    startdate={item.createAt}
                                    updatedate={item.updateAt}
                                />
                            </StyledTableCell>
                            <StyledTableCell align="center" >
                                {item.status === '1' ? (
                                    <ChipButton status="active" onClick={() => handleshowItemClick(item)} />
                                ) : (
                                    <ChipButton status="inactive" onClick={() => handleshowItemClick(item)} />
                                )}
                            </StyledTableCell>
                            {(can("Edit User") || can("Reset Password")) && (
                                <StyledTableCell
                                    align="center"
                                    component="th"
                                    scope="row"
                                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                >
                                    {can("Edit User") && (
                                        <AppIconButton
                                            title={item.user_id === currentUserId ? "ไม่สามารถแก้ไขข้อมูลของตัวเองได้" : "แก้ไขข้อมูลผู้ใช้งาน"}
                                            variant="filled"
                                            customColor={item.user_id === currentUserId ? theme.palette.grey[500] : "#FFAA37"}
                                            onClick={!(item.user_id === currentUserId) ? () => handleEditItemClick(item.user_id) : undefined}
                                            sx={{
                                                opacity: item.user_id === currentUserId ? 0.4 : 1,
                                                cursor: item.user_id === currentUserId ? 'not-allowed' : 'pointer',
                                                mr: 1
                                            }}
                                        >
                                            <HiPencil
                                                style={{
                                                    fontSize: theme.typography.h6.fontSize,
                                                    color: "#fff",
                                                }}
                                            />
                                        </AppIconButton>
                                    )}
                                    {can("Reset Password") && (
                                        <AppIconButton
                                            title={item.user_id === currentUserId ? "ไม่สามารถรีเซ็ตรหัสผ่านของตัวเองได้" : "รีเซ็ตรหัสผ่านผู้ใช้งาน"}
                                            variant="filled"
                                            customColor={item.user_id === currentUserId ? theme.palette.grey[500] : "#313131"}
                                            onClick={!(item.user_id === currentUserId) ? () => handleResetPasswordItemClick(item.user_id) : undefined}
                                            sx={{
                                                opacity: item.user_id === currentUserId ? 0.4 : 1,
                                                cursor: item.user_id === currentUserId ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            <GrPowerReset
                                                style={{
                                                    fontSize: theme.typography.h6.fontSize,
                                                    color: "#fff",
                                                }}
                                            />
                                        </AppIconButton>
                                    )}
                                </StyledTableCell>
                            )}
                        </TableRow>
                    ))
                )}
            </ComponentTableModel>
            <TablePagination
                component="div"
                count={usersData.counts}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[15, 25]}
                labelRowsPerPage="จำนวนแสดงข้อมูลต่อหน้า"
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}–${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
                }
            />
            <Dialogs title='บันทึกข้อมูลผู้ใช้งาน'
                openPopup={openShowItemPopup}
                setOpenPopup={(isOpen) => {
                    setOpenShowItemPopup(isOpen);
                    if (!isOpen && selectedRow !== null) {
                        handleRowClick(selectedRow);
                    }
                }}
                wide='md'
                top={30}>
                <ComponentUserShowForm
                    personelID={selectedPersonalId}
                    onClose={() => setOpenShowItemPopup(false)}
                    handleRowClick={handleRowClick}
                    setNotify={setNotify}
                    fetchUsers={fetchUsers}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    fullnamePer={fullnamePer}
                    IDPer={IDPer}
                    typeUser={typeUser}
                />
            </Dialogs>
        </Box>
    )
}

export default ComponentsUserTableView
