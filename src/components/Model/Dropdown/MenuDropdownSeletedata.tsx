import { Box, MenuItem, TextField, Typography} from '@mui/material';
import React, { useEffect, useState } from 'react'
import type { BasicDropDownSeleteProps } from '../../../utils/types';
import { apiFetch } from '../../../API/client';

interface MenuDropdownSeletedataItem {
    selecte: number | null;
    setSelected: React.Dispatch<React.SetStateAction<number | null>>
    nameroutes: string
    titlename: string;
}

const MenuDropdownSeletedata: React.FC<MenuDropdownSeletedataItem> = ({
    selecte,
    setSelected,
    nameroutes,
    titlename
}) => {
    const [data, setData] = useState<BasicDropDownSeleteProps[]>([]);

    useEffect(() => {
        const fetchProductTypeData = async () => {
            try {
                const response = await apiFetch(`/api/auther/${nameroutes}`, {
                    method: "GET",
                });
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                setData(data?.result || []);
            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };

        fetchProductTypeData();
    }, [selecte, setSelected])

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const value = event.target.value;
        setSelected(value === "" ? null : (value as number));
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                alignItems: 'flex-start',
                mr: { xs: 0, md: 2, xl: 2 },
                mb: { xs: 0.5, md: 0, xl: 0 },
                width: '100%',
                minWidth: '150px'
            }}
        >
            <Typography variant="body1" sx={{ mb: 0.5 }}>
                {titlename}
            </Typography>

            <TextField
                select
                size="small"
                value={selecte === null ? "0" : String(selecte)}
                onChange={handleChange}
                slotProps={{
                    select: {
                        MenuProps: {
                            slotProps: {
                                paper: {
                                    sx: {
                                        maxHeight: 300,
                                        overflowY: 'auto',
                                    },
                                },
                            },
                        },
                    },
                }}
            >
                <MenuItem value={0}>แสดงทั้งหมด</MenuItem>

                {data.map((item) => (
                    <MenuItem key={item.id} value={String(item.id)}
                        sx={{
                            opacity: item.active === '0' ? 0.5 : 1,
                        }}
                    >
                        <Typography
                            sx={{
                                color: item.active === '0' ? 'gray' : 'inherit',
                            }}
                        >
                            {item.name}
                        </Typography>

                    </MenuItem>
                ))}
            </TextField>
        </Box>
    )
}

export default MenuDropdownSeletedata
