import { Box, MenuItem, TextField, Typography } from '@mui/material';
import React from 'react'

type FileType = 'all' | 'active' | 'inactive' | 'wait' | 'inapprived' | 'editfix' | 'pinin';

interface MenuDropdownItemProps {
  titlename: string;
  handleFileTypeChange: (event: React.ChangeEvent<{
    value: unknown;
  }>) => void
  fileType: FileType
  statusOptions: {
    valuename: string;
    labelname: string;
  }[]
}
const MenuDropdownstatus: React.FC<MenuDropdownItemProps> = ({
     titlename,
  handleFileTypeChange,
  fileType,
  statusOptions 
}) => {
  return (
   <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: { xs: 'flex-start', md: 'flex-end' },
        alignItems: 'left',
        mr: { xs: 0, md: 2, xl: 2 },
        mb: { xs: 0.5, md: 0, xl: 0 },
        width: '100%'
      }}
    >
      <Typography variant="body1" component="span" sx={{ mr: 1, mb: { xs: 0.5, md: 0, xl: 0 } }}>
        {titlename}
      </Typography>
      <TextField
        select
        size="small"
        value={fileType}
        onChange={handleFileTypeChange}
      >
        {statusOptions.map((item) => (
          <MenuItem key={item.valuename} value={item.valuename}>{item.labelname}</MenuItem>
        ))}
      </TextField>
    </Box>
  )
}

export default MenuDropdownstatus
