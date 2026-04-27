import React, { useEffect, useState } from 'react'
import type { ComponentRoletypeSeleteProps, Roletypeseleteitem } from '../../../utils/types'
import { Box, MenuItem, TextField, Typography, useTheme } from '@mui/material';
import { apiFetch } from '../../../API/client';

const ComponentRoletypeSelete: React.FC<ComponentRoletypeSeleteProps> = ({
    selectedRoleType,
    setSelectedRoleType
}) => {
    const theme = useTheme();
    const [roleTypeData, setRoleTypeData] = useState<Roletypeseleteitem[]>([]);
    useEffect(() => {
        const fetchProductTypeData = async () => {
            try {
                const response = await apiFetch(`/api/auther/showRolelistAPI?`, {
                    method: "GET",
                });
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                setRoleTypeData(data?.result || []);
            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };

        fetchProductTypeData();
    }, [selectedRoleType, setSelectedRoleType])

    const handleProductTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const value = event.target.value;
        setSelectedRoleType(value === "" ? null : (value as number));
    };
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                alignItems: 'left', mb: { xs: 0.5, md: 0, xl: 0 },
                mr: { xs: 0, md: 2, xl: 2 },
                width: '100%'
            }}
        >
            <Typography variant="body1" component="span" sx={{ mr: 1, mb: { xs: 0.5, md: 0, xl: 0 } }}>
                สิทธิ
            </Typography>
            <TextField
                select
                size="small"
                value={selectedRoleType ?? "0"}
                onChange={handleProductTypeChange}
                sx={{
                    borderRadius: '8px',
                    width: '100%',
                    minWidth: '200px'
                    // width: { xs: '100%', sm: '100%', md: '250px', lg: '200px' }
                }
                }
                SelectProps={{
                    MenuProps: {
                        PaperProps: {
                            sx: {
                                maxHeight: 300,
                                overflowY: 'auto',
                            }
                        }
                    }
                }}
            >
                <MenuItem value="0">
                    <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[400] }}>
                        เลือกสิทธิ
                    </Box>
                </MenuItem>
                {roleTypeData.map((product) => (
                    <MenuItem
                        key={product.id}
                        value={product.id}
                    >
                        <Typography
                            sx={{
                                color: 'inherit',
                            }}
                        >
                            {product.name}
                        </Typography>
                    </MenuItem>
                ))}
            </TextField>
        </Box>
    )
}

export default ComponentRoletypeSelete
