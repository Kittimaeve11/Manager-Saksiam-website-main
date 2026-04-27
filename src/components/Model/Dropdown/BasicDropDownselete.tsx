import { Box, MenuItem, TextField, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react'
import type { BasicDropDownSeleteProps } from '../../../utils/types';
import { apiFetch } from '../../../API/client';

interface BasicDropDownseleteitem {
    selecte: number | null;
    setSelected: React.Dispatch<React.SetStateAction<number | null>>;
    topon: number
    handleFieldChange: (fieldName: string, value: unknown) => void
    error: string | undefined
    fieldKey: string
    nameroutes: string
    specify: boolean
    titlename: string;
}

const BasicDropDownselete: React.FC<BasicDropDownseleteitem> = ({
    selecte,
    setSelected,
    topon,
    nameroutes,
    handleFieldChange,
    error,
    fieldKey,
    specify,
    titlename
}) => {
    const theme = useTheme();
    const [data, setData] = useState<BasicDropDownSeleteProps[]>([]);
    useEffect(() => {
        const fetchProductTypeData = async () => {
            try {
                const response = await apiFetch(`/api/auther/${nameroutes}?`, {
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
        handleFieldChange(fieldKey, value);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                alignItems: 'left', mb: { xs: 0.5, md: 0, xl: 0 },
                mr: { xs: 0, md: 2, xl: 2 },
                width: '100%',
                mt: topon
            }}
        >
            <Typography variant="body1" component="span" sx={{ mr: 1, mb: { xs: 0.5, md: 0, xl: 0 } }}>
                {titlename} {specify && <span style={{ color: theme.palette.error.main }}>*</span>}
            </Typography>
            <TextField
        select
        size="small"
        value={selecte ?? "0"}
        onChange={handleChange}
        sx={{ borderRadius: '8px', width: '100%' }}
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
        error={Boolean(error)}
        helperText={error}
        FormHelperTextProps={{
          sx: {
            fontSize: theme.typography.caption.fontSize,
            fontWeight: 400
          }
        }}
      >
        <MenuItem value="0">
          <Box sx={{ display: 'flex', alignItems: 'center', color:error ? theme.palette.error.main :  theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[400] }}>
            เลือก{titlename}
          </Box>
        </MenuItem>
        {data.map((product) => (
          <MenuItem
            key={product.id}
            value={product.id}
              sx={{
              opacity: product.active === '0' ? 0.5 : 1,
            }}
          >
            <Typography
              sx={{
             color: product.active === '0' ? 'gray' : 'inherit',
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

export default BasicDropDownselete
