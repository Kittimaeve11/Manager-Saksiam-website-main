import { Box, Container, Typography, useTheme } from '@mui/material'
import { Link } from 'react-router-dom'
import { CONFIG } from '../config-global';

export const Footer = () => {
  const theme = useTheme();
  return (
    <Box component="footer" py={4}>
      <Container maxWidth="xl">
        <Box display="flex" flexWrap="wrap" justifyContent={{ xs: 'center', md: 'space-between' }} alignItems="center">
          <Box width={{ xs: '100%', md: 'auto' }} textAlign='left'>
            <Typography variant="h6" color={theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey['700']} fontWeight="regular" py={1}>
              Copyright © 2025 &nbsp;
              <Link to="/" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                {CONFIG.appName}. All Rights Reserved.&nbsp;
              </Link>
              (version {CONFIG.appVersion})
            </Typography>
          </Box>
          <Box width={{ xs: '100%', md: 'auto' }} textAlign={{ xs: 'left', md: 'right' }} pr={{ xs: 0, md: 2 }}>
            <Typography variant="h6" color={theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey['700']} fontWeight="regular" py={1}>
              พัฒนาระบบโดย : ฝ่ายพัฒนาระบบส่งเสริมปฏิบัติการ
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box >
  )
}