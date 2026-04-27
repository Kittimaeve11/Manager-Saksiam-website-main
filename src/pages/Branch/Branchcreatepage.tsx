import { Box, Container, Paper, Tab, Tabs, Typography, useTheme } from '@mui/material'
import React, { useState } from 'react'
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Branchcreatepage = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    return (
        <Container maxWidth='xl'>
            <Paper
                elevation={0}
                sx={{
                    mt: 5,
                    py: 5,
                    borderRadius: 3,
                    width: '100%',
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.darker : "white"
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        width: '100%',
                        flexWrap: 'nowrap',
                        gap: 2,
                        px: 3,
                        pb: 4
                    }}
                >
                    <Typography variant="h6" component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                        ฟอร์มการบันทึกข้อมูลสาขา
                    </Typography>
                    <Box width='100%' sx={{ px: { xs: 2, sm: 5 } }}>
                      
                    </Box>
                </Box>
            </Paper>
        </Container>
    )
}

export default Branchcreatepage
