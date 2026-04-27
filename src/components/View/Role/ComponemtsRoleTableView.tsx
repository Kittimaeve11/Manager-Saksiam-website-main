import React from 'react'
import type { Column, RolePermisionData } from '../../../utils/types'
import { Box, TableCell, TablePagination, TableRow, Typography, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ComponentTableModel from '../../Model/Table/ComponentTableModel'
import NoImage from '../../../assets/Image/dastano.png'
import Loading from '../../../assets/Image/Loading.gif'
import StyledTableCell from '../../Model/Table/StyledTableCell'
import ComponentsDateTable from '../../Model/Table/ComponentsDateTable'
import { HiPencil } from 'react-icons/hi'
import AppIconButton from '../../Model/Buttom/IconButton'

interface ComponemtsRoleTableViewProps {
    roleData: RolePermisionData
    loading: boolean
    page: number
    rowsPerPage: number
    setPage: React.Dispatch<React.SetStateAction<number>>
    setRowsPerPage: React.Dispatch<React.SetStateAction<number>>
    can: (slug: string) => boolean;
}

const ComponemtsRoleTableView: React.FC<ComponemtsRoleTableViewProps> = ({
    roleData,
    loading,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    can
}) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const columns: Column[] = [
        { id: 1, label: 'ลำดับ', width: '10%', align: 'center' },
        { id: 2, label: 'สิทธิ', width: '40%', align: 'left' },
        { id: 3, label: 'ชื่อ/วันที่อัปโหลดข้อมูล', width: '35%', align: 'center' },
        { id: 4, label: 'จัดการข้อมูล', width: '20%', align: 'center' }
    ];

    const columnsToShow = can("Edit Role")
        ? columns
        : columns.filter(col => col.id !== 4); // ซ่อนคอลัมน์จัดการข้อมูล

    const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    const handleEditItemClick = (role_id: number) => {
        navigate(`/RolePermission/edit/${role_id}`);
    };

    return (
        <Box>
            <ComponentTableModel columns={columnsToShow} largest='xl'>
                {loading ? (
                    <TableRow>
                        <StyledTableCell colSpan={6} align="center" sx={{ py: 3 }}>
                            <img src={Loading} alt="No photos" style={{ width: '4%', marginBottom: '20px' }} />
                        </StyledTableCell>
                    </TableRow>
                ) : roleData.roles.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                            <img src={NoImage} alt="No photos" style={{ width: '20%', marginBottom: '20px' }} />
                        </TableCell>
                    </TableRow>
                ) : (
                    roleData.roles.map((item, index) => (
                        <TableRow
                            key={item.role_id}
                            sx={{
                                '&:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                    cursor: 'pointer',
                                    boxShadow: '0px rgba(0, 0, 0, 0.1)',
                                },

                                borderBottom:
                                    index === roleData.roles.length - 1
                                        ? 'none' // ✅ ไม่แสดงเส้น
                                        : theme.palette.mode === 'dark'
                                            ? `1px dashed ${theme.palette.grey[700]}`
                                            : '1px dashed #cee0f2',

                                backgroundColor: 'transparent',
                                transition: 'background-color 1s ease-in-out'
                            }}
                        >
                            <StyledTableCell align="center">
                                <Typography fontWeight={400} variant="body2">
                                    {page * rowsPerPage + index + 1}
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
                            {can("Edit Role") && (
                                <StyledTableCell
                                    align="center"
                                    component="th"
                                    scope="row"
                                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}

                                >
                                    <AppIconButton
                                        title="แก้ไขข้อมูลสิทธิ"
                                        variant="filled"
                                        customColor="#FFAA37"
                                        onClick={() => handleEditItemClick(item.role_id)}
                                    >
                                        <HiPencil
                                            style={{
                                                fontSize: theme.typography.h6.fontSize,
                                                color: "#fff",
                                            }}
                                        />
                                    </AppIconButton>
                                </StyledTableCell>
                            )}
                        </TableRow>
                    ))
                )}
            </ComponentTableModel>
            <TablePagination
                component="div"
                count={roleData.counts}
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
        </Box>
    )
}

export default ComponemtsRoleTableView
