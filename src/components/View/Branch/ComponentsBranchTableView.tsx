import React, { useState } from 'react'
import type { BranchData, Column } from '../../../utils/types'
import { Box, TableCell, TableRow, useTheme } from '@mui/material'
import ComponentTableModel from '../../Model/Table/ComponentTableModel'
import StyledTableCell from '../../Model/Table/StyledTableCell'
import NoImage from '../../../assets/Image/dastano.png'
import Loading from '../../../assets/Image/Loading.gif'
interface ComponentsBranchTableViewProps {
    branchData: BranchData
    loading: boolean
    page: number
    rowsPerPage: number
    setPage: React.Dispatch<React.SetStateAction<number>>
    setRowsPerPage: React.Dispatch<React.SetStateAction<number>>
    //   handleStatusChange: (TopicID: number, newChecked: boolean) => Promise<void>
    fetchshowBranch: () => Promise<void>
    can: (slug: string) => boolean
}
const ComponentsBranchTableView: React.FC<ComponentsBranchTableViewProps> = ({
    branchData,
    loading,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    fetchshowBranch,
    can
}) => {
    const theme = useTheme();
    const columns: Column[] = [
        { id: 1, label: 'ลำดับ', width: '5%', align: 'center' },
        { id: 2, label: 'สาขา/หน่วย', width: '25%', align: 'left' },
        { id: 3, label: 'หัวข้อแบบสอบถามภาษาอังกฤษ', width: '25%', align: 'left' },
        { id: 4, label: 'ชื่อ/วันที่อัปโหลดข้อมูล', width: '15%', align: 'center' },
        { id: 5, label: 'สถานะ', width: '15%', align: 'center' },
        { id: 6, label: 'จัดการข้อมูล', width: '15%', align: 'center' }
    ];

    const columnsToShow = columns.filter((col) => {
        if (col.id === 5 && !can("Status Question")) return false; // ไม่มีสิทธิดูสถานะ → ซ่อน id 4
        if (col.id === 6 && (!can("Edit Question") || !can("Delete Question"))) return false;  // ไม่มีสิทธิ์จัดการข้อมูล → ซ่อน id 5
        return true;
    });

    const [selectedRow, setSelectedRow] = useState('');
    const [fadeOut, setFadeOut] = useState(false);

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
                        <StyledTableCell colSpan={9} align="center" sx={{ py: 3 }}>
                            <img src={Loading} alt="No photos" style={{ width: '4%', marginBottom: '20px' }} />
                        </StyledTableCell>
                    </TableRow>
                ) : branchData.data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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
                        </TableRow>
                    ))
                )}
            </ComponentTableModel>

        </Box>
    )
}

export default ComponentsBranchTableView
