import React, { useState } from 'react'
import type { BranchData, Column } from '../../../utils/types'
import { Box, TableCell, TablePagination, TableRow, Typography, useTheme } from '@mui/material'
import ComponentTableModel from '../../Model/Table/ComponentTableModel'
import StyledTableCell from '../../Model/Table/StyledTableCell'
import NoImage from '../../../assets/Image/dastano.png'
import Loading from '../../../assets/Image/Loading.gif'
import { dataBranchType, dataBusinessSector } from '../../../API/StausData'
import { useArea } from '../../../hooks/useArea'
import { apiFetch } from '../../../API/client'
import ComponentsDateTable from '../../Model/Table/ComponentsDateTable'
import SwitchButton from '../../Buttom/SwitchButton'
import AppIconButton from '../../Buttom/IconButton'
import { HiPencil } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
interface ComponentsBranchTableViewProps {
    branchData: BranchData
    loading: boolean
    page: number
    rowsPerPage: number
    setPage: React.Dispatch<React.SetStateAction<number>>
    setRowsPerPage: React.Dispatch<React.SetStateAction<number>>
    handleStatusChange: (branchID: string, newChecked: boolean) => Promise<void>
    can: (slug: string) => boolean
}
const ComponentsBranchTableView: React.FC<ComponentsBranchTableViewProps> = ({
    branchData,
    loading,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    handleStatusChange,
    can
}) => {
    const theme = useTheme();
    const { areaMap } = useArea(apiFetch);
      const navigate = useNavigate();
    const columns: Column[] = [
        { id: 1, label: 'ลำดับ', width: '5%', align: 'center' },
        { id: 2, label: 'สาขา/หน่วย', width: '15%', align: 'left' },
        { id: 3, label: 'จุดให้บริการ', width: '20%', align: 'left' },
        { id: 4, label: 'ที่อยู่', width: '22%', align: 'left' },
        { id: 5, label: 'เบอร์โทร', width: '12%', align: 'left' },
        { id: 6, label: 'อัปโหลดโดย/วันที่', width: '16%', align: 'center' },
        { id: 7, label: 'สถานะ', width: '5%', align: 'center' },
        { id: 8, label: 'จัดการ', width: '5%', align: 'center' },
    ];

    const columnsToShow = columns.filter((col) => {
        if (col.id === 7 && !can("Status Branch")) return false; // ไม่มีสิทธิดูสถานะ → ซ่อน id 4
        if (col.id === 8 && (!can("Edit Branch"))) return false;  // ไม่มีสิทธิ์จัดการข้อมูล → ซ่อน id 5
        return true;
    });

    const [selectedRow, setSelectedRow] = useState('');
    const [fadeOut, setFadeOut] = useState(false);

    const getSector = (id: number) =>
        dataBusinessSector.find(x => x.id == id)?.labelname || "-";

    const getBranchType = (id: number) =>
        dataBranchType.find(x => x.id == id)?.labelname || "-";

  const handleEditItemClick = (branchID: string) => {
        navigate(`/Branch/edit/${branchID}`);
    };
    const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    const handleRowClick = (branch: string) => {
        setSelectedRow(branch);
        setFadeOut(false);
        setTimeout(() => {
            setFadeOut(true);
        }, 5000);
        setTimeout(() => {
            setSelectedRow('');
            setFadeOut(false);
        }, 5000);
    };

    return (
        <Box>
            <ComponentTableModel columns={columnsToShow} largest='xl'>
                {loading ? (
                    <TableRow>
                        <StyledTableCell colSpan={8} align="center" sx={{ py: 3 }}>
                            <img src={Loading} alt="No photos" style={{ width: '4%', marginBottom: '20px' }} />
                        </StyledTableCell>
                    </TableRow>
                ) : branchData.data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                            <img src={NoImage} alt="No photos" style={{ width: '20%', marginBottom: '20px' }} />
                        </TableCell>
                    </TableRow>
                ) : (
                    branchData.data.map((item, index) => (
                        <TableRow
                            key={item.id}
                            onClick={() => handleRowClick(item.id)}
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
                                    selectedRow === item.id
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
                                <Typography variant="body2" sx={{
                                    lineHeight: 1.3,
                                    fontWeight: 400
                                }}>
                                    {Number(item.type) === 3
                                        ? item.name
                                        : `${getBranchType(Number(item.type))}${item.name}`
                                    }


                                </Typography>
                                <Typography variant='caption' sx={{
                                    lineHeight: 1.3,
                                    fontWeight: 400
                                }}>

                                    {(Number(item.area) === 18 && Number(item.region) === 6)
                                        ? getSector(Number(item.area))
                                        : `เขต${areaMap[Number(item.area)] || "-"} ${getSector(Number(item.region))}`
                                    }
                                    {/* {item.pname !== "-"
                                        ? `${item.pname} ${item.fname} ${item.lname}`
                                        : `${item.fname} ${item.lname}`
                                    } */}
                                </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                                <Typography variant="body2"
                                    sx={{
                                        fontWeight: 400
                                    }}
                                >
                                    {item.detail}
                                </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                                <Typography variant="body2"
                                    sx={{
                                        fontWeight: 400
                                    }}
                                >
                                    {item.address} ตำบล{item.districtname} อำเภอ{item.amphurname} {item.provincename} {item.zipcode}
                                </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                                <Typography variant="body2"
                                    sx={{
                                        fontWeight: 400
                                    }}
                                >
                                    {item.tel}
                                </Typography>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                                <ComponentsDateTable
                                    fullname={item.savename}
                                    startdate={item.createAt}
                                    updatedate={item.updateAt}
                                />
                            </StyledTableCell>
                            {can("Status Branch") && (
                                <StyledTableCell align="center" >
                                    <SwitchButton
                                        checked={item.status !== "0"}
                                    handleChange={(event) => handleStatusChange(item.id, event.target.checked)}
                                    />
                                </StyledTableCell>
                            )}
                            {can("Edit Branch") && (
                                <StyledTableCell
                                    align="center"
                                    component="th"
                                    scope="row"
                                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                >
                                    <AppIconButton
                                        title="แก้ไขข้อมูลสาขา"
                                        variant="filled"
                                        customColor="#FFAA37"
                                        onClick={() => handleEditItemClick(item.id)}
                                        sx={{
                                            opacity: 1,
                                            cursor: 'pointer',
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
                                </StyledTableCell>
                            )}
                        </TableRow>
                    ))
                )}
            </ComponentTableModel>
            <TablePagination
                component="div"
                count={branchData.counts}
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

export default ComponentsBranchTableView
