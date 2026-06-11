import React, { useState } from 'react'
import type { BannerData, Column } from '../../../utils/types'
import { Box, TableCell, TablePagination, TableRow, Typography, useTheme } from '@mui/material'
import ComponentTableModel from '../../Model/Table/ComponentTableModel'
import StyledTableCell from '../../Model/Table/StyledTableCell'
import NoImage from '../../../assets/Image/dastano.png'
import Loading from '../../../assets/Image/Loading.gif'
import ComponentsDateTable from '../../Model/Table/ComponentsDateTable'
import SwitchButton from '../../Buttom/SwitchButton'
import AppIconButton from '../../Buttom/IconButton'
import { HiPencil } from 'react-icons/hi'
import { AiFillDelete } from 'react-icons/ai'
import { useNavigate } from 'react-router-dom'

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API_PHOTO;

export interface ComponentsBannerTableViewProps {
    brandData: BannerData
    loading: boolean
    page: number
    rowsPerPage: number
    setPage: React.Dispatch<React.SetStateAction<number>>
    setRowsPerPage: React.Dispatch<React.SetStateAction<number>>
    handleDeleteChange: (id: number) => Promise<void>
    handleStatusChange: (TopicID: number, newChecked: boolean) => Promise<void>
    can: (slug: string) => boolean
}

const ComponentsBannerTableView: React.FC<ComponentsBannerTableViewProps> = ({
    brandData,
    loading,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    handleDeleteChange,
    handleStatusChange,
    can
}) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const columns: Column[] = [
        { id: 1, label: 'ลำดับ', width: '5%', align: 'center' },
        { id: 2, label: 'ชื่อเรื่องแบนเนอร์', width: '30%', align: 'left' },
        { id: 3, label: 'ชื่อ/วันที่อัปโหลดข้อมูล', width: '25%', align: 'center' },
        { id: 4, label: 'สถานะ', width: '20%', align: 'center' },
        { id: 5, label: 'จัดการข้อมูล', width: '20%', align: 'center' },
    ];

    const columnsToShow = columns.filter((col) => {
        if (col.id === 4 && !can("Staut Brander")) return false;
        if (col.id === 5 && (!can("Edit Brander") || !can("DropDown Brander"))) return false;
        return true;
    });

    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [fadeOut, setFadeOut] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null)

    const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };
    const handleEditItemClick = (personelID: number) => {
        navigate(`/Banner/edit/${personelID}`);
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
                        <StyledTableCell colSpan={5} align="center" sx={{ py: 3 }}>
                            <img src={Loading} alt="No photos" style={{ width: '4%', marginBottom: '20px' }} />
                        </StyledTableCell>
                    </TableRow>
                ) : brandData.bannder.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                            <img src={NoImage} alt="No photos" style={{ width: '20%', marginBottom: '20px' }} />
                        </TableCell>
                    </TableRow>
                ) : (
                    brandData.bannder.map((item, index) => (
                        <TableRow
                            key={item.id}
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
                            <StyledTableCell
                                component="th"
                                scope="row"
                                sx={{ display: 'flex', alignItems: 'flex-start' }}
                            >
                                <Box
                                    component="a"
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        width: '100%'
                                    }}
                                >
                                    <Box
                                        component="img"
                                        loading="lazy"
                                        alt={item.name}
                                        src={`${BASE_URL_API}/${item.picturePC}`}
                                        sx={{
                                            marginRight: 2,
                                            filter: item.active === "0" ? 'grayscale(100%) brightness(70%) opacity(0.5)' : 'none',
                                            maxWidth: 30,
                                            maxHeight: 60
                                        }}
                                    />

                                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 0.5 }}>
                                        <Typography variant='body2'
                                            sx={{
                                                color: item.active === "0" ? 'rgba(0, 0, 0, 0.5)' : 'text.primary',
                                                fontWeight: 400
                                            }}
                                        >   {item.name} </Typography>
                                    </Box>
                                </Box>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                                <ComponentsDateTable
                                    fullname={item.savename}
                                    startdate={item.createAt}
                                    updatedate={item.updateAt}
                                />
                            </StyledTableCell>
                            {can("Staut Brander") && (
                                <StyledTableCell align="center">
                                    <SwitchButton
                                        disabled={item.type !== 'หน้าหลัก'} // 🔥 บล็อกถ้าไม่ใช่หน้าหลัก
                                        checked={item.active !== "0"}
                                        handleChange={(event) =>
                                            handleStatusChange(item.id, event.target.checked)
                                        }
                                    />
                                </StyledTableCell>
                            )}
                            {(can("Edit Brander") || can("DropDown Brander")) && (
                                <StyledTableCell
                                    align="center"
                                    component="th"
                                    scope="row"
                                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                >
                                    {item.active === '0' ? (
                                        <>
                                            {can("Edit Brander") && (
                                                <AppIconButton
                                                    title="แก้ไขแบนเนอร์"
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
                                            )}
                                            {can("Delete Brander") && (
                                                <AppIconButton
                                                    title="ลบแบนเนอร์"
                                                    variant="filled"
                                                    customColor={theme.palette.error.dark}
                                                    onClick={() => handleDeleteChange(item.id)}
                                                    disabled={item.type !== 'หน้าหลัก'} // 🔥 บล็อกถ้าไม่ใช่หน้าหลัก
                                                    sx={{
                                                        opacity: item.type !== 'หน้าหลัก' ? 0.4 : 1,
                                                        cursor: item.type !== 'หน้าหลัก' ? 'not-allowed' : 'pointer',
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
                                        item.type === 'หน้าหลัก' ? (
                                            <Typography sx={{ fontWeight: 400 }}>-</Typography>
                                        ) : (
                                            can("Edit Brander") && (
                                                <AppIconButton
                                                    title="แก้ไขแบนเนอร์"
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
                                            )
                                        )
                                    )}

                                </StyledTableCell>
                            )}
                        </TableRow>
                    ))
                )}
            </ComponentTableModel>
            <TablePagination
                component="div"
                count={brandData.bannerscount}
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

export default ComponentsBannerTableView
