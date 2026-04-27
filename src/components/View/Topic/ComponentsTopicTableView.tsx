import React, { useState } from 'react'
import type { Column, TopicsData } from '../../../utils/types'
import { Box, TableCell, TablePagination, TableRow, Typography, useTheme } from '@mui/material'
import ComponentTableModel from '../../Model/Table/ComponentTableModel'
import StyledTableCell from '../../Model/Table/StyledTableCell'
import NoImage from '../../../assets/Image/dastano.png'
import Loading from '../../../assets/Image/Loading.gif'
import ComponentsDateTable from '../../Model/Table/ComponentsDateTable'
import SwitchButton from '../../Model/Buttom/SwitchButton'
import AppIconButton from '../../Model/Buttom/IconButton'
import { HiPencil } from 'react-icons/hi'
import { AiFillDelete } from 'react-icons/ai'

export interface ComponentsTopicTableViewProps {
    topicsData: TopicsData
    loading: boolean
    page: number
    rowsPerPage: number
    setPage: React.Dispatch<React.SetStateAction<number>>
    setRowsPerPage: React.Dispatch<React.SetStateAction<number>>
    handleResetPasswordItemClick: (id: number) => Promise<void>
    handleStatusChange: (TopicID: number, newChecked: boolean) => Promise<void>
    fetchshowTopics: () => Promise<void>
    can: (slug: string) => boolean
    handleEditItemClick: (topicId: number) => void
}

const ComponentsTopicTableView: React.FC<ComponentsTopicTableViewProps> = ({
    topicsData,
    loading,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    handleResetPasswordItemClick,
    handleStatusChange,
    can,
    handleEditItemClick
}) => {
    const theme = useTheme();
    const columns: Column[] = [
        { id: 1, label: 'ลำดับ', width: '5%', align: 'center' },
        { id: 2, label: 'หัวข้อแบบสอบถามภาษาไทย', width: '25%', align: 'left' },
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

    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [fadeOut, setFadeOut] = useState(false);

    const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };


    const handleRowClick = (topicId: number) => {
        setSelectedRow(topicId);
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
                ) : topicsData.topics.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                            <img src={NoImage} alt="No photos" style={{ width: '20%', marginBottom: '20px' }} />
                        </TableCell>
                    </TableRow>
                ) : (
                    topicsData.topics.map((item, index) => (
                        <TableRow
                            key={item.topic_id}
                            onClick={() => handleRowClick(item.topic_id)}
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
                                    selectedRow === item.topic_id
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
                                <Typography fontWeight={400} variant="body2">
                                    {item.nameTH}
                                </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                                <Typography fontWeight={400} variant="body2">
                                    {item.nameEN}
                                </Typography>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                                <ComponentsDateTable
                                    fullname={item.savename}
                                    startdate={item.createAt}
                                    updatedate={item.updateAt}
                                />
                            </StyledTableCell>
                            {can("Status Question") && (
                                <StyledTableCell align="center" >
                                    <SwitchButton
                                        checked={item.active !== "0"}
                                        handleChange={(event) => handleStatusChange(item.topic_id, event.target.checked)}
                                    />
                                </StyledTableCell>
                            )}
                            {(can("Edit User") || can("Reset Password")) && (
                                <StyledTableCell
                                    align="center"
                                    component="th"
                                    scope="row"
                                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                >
                                    {item.active === '0' ? (
                                        <>
                                            {can("Edit Question") && (
                                                <AppIconButton
                                                    title="แก้ไขหัวข้อแบบสอบถาม"
                                                    variant="filled"
                                                    customColor="#FFAA37"
                                                    onClick={(e) => {
                                                        e.stopPropagation();   // 👈 กันไม่ให้ row click ทำงาน
                                                        handleEditItemClick(item.topic_id);
                                                    }}
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
                                            )}
                                            {can("Delete Question") && (
                                                <AppIconButton
                                                    title="ลบหัวข้อแบบสอบถาม"
                                                    variant="filled"
                                                    customColor={theme.palette.error.dark}
                                                    onClick={(e) => {
                                                        e.stopPropagation();   // 👈 กันไม่ให้ row click ทำงาน
                                                        handleResetPasswordItemClick(item.topic_id);
                                                    }}
                                                    sx={{
                                                        opacity: 1,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <AiFillDelete
                                                        style={{
                                                            fontSize: theme.typography.h6.fontSize,
                                                            color: "#fff",
                                                        }}
                                                    />
                                                </AppIconButton>
                                            )}
                                        </>
                                    ) : (
                                        <Typography fontWeight={400}>-</Typography>
                                    )}
                                </StyledTableCell>
                            )}
                        </TableRow>
                    ))
                )

                }
            </ComponentTableModel>
            <TablePagination
                component="div"
                count={topicsData.counts}
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

export default ComponentsTopicTableView
