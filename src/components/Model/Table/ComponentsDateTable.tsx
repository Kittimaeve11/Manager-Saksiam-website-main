import React from 'react'
import { Typography, useTheme, Box} from '@mui/material'
import formatDate, { formatThaiDate } from '../../../utils/Format/format-date'


interface ComponentsDateTableProp {
  fullname: string
  startdate: string
  updatedate: string | null
}


const ComponentsDateTable: React.FC<ComponentsDateTableProp>  = ({
      fullname,
  startdate,
  updatedate
}) => {
     const theme = useTheme();
  return (
  <Box>
      <Typography fontWeight={400} variant="body2">คุณ {fullname}</Typography>
      <Typography variant='caption' fontWeight={300}>วันที่ {formatThaiDate(startdate)} น.</Typography>
      {updatedate && (
        <Typography fontWeight={300} sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.error.main, fontSize: 10 }}>( แก้ไขข้อมูลล่าสุด {formatDate(updatedate)} )</Typography>
      )}
    </Box>
  )
}

export default ComponentsDateTable
