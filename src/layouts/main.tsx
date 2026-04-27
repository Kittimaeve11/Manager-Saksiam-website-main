import { Toolbar, useTheme } from '@mui/material';
import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import { Footer } from './Footer.tsx';

export function Main({ children }: BoxProps) {
      const theme = useTheme();
    return (
        <Box
            component="main"
            sx={{
                flexGrow: 1,
                width: "100%",
                minHeight: "100vh",
                backgroundColor:theme.palette.primary.lighter,
                position: "relative"
            }}
        >
            {/* background ด้านบน */}
            {/* <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "33vh",   // 1/3 ของหน้าจอ
                    backgroundImage: `
                        // linear-gradient(135deg,#4e6fa8 0%, #2f4c78 100%),
                        url(${bgImage})
                    `,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    zIndex: 0
                }}
            /> */}
         <Box
    sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "33vh",
        background: "linear-gradient(180deg, #0f1a2e 0%, #1a2a4a 50%, #243865 100%)",
        zIndex: 0
    }}
/>

            {/* content */}
            <Box
                sx={{
                    position: "relative",
                    zIndex: 1,
                    p: { sm: 2, md: 3 }
                }}
            >
                <Toolbar />
                {children}
                <Footer />
            </Box>

        </Box>
    )
}