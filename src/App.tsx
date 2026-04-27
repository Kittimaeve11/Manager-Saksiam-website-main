import { Suspense } from 'react'
import { ThemeProvider } from './theme/theme-provider';
import { varAlpha } from './theme/styles';
import { HelmetProvider } from 'react-helmet-async';
import './App.css'
import { Box, LinearProgress, linearProgressClasses } from '@mui/material';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import DashboardLayout from './layouts/layout';
import Personelpage from './pages/Personel/Personelpage';
import Permistionpage from './pages/Permistion/Permistionpage';
import Loginpage from './pages/Loginpage';
import Homespage from './pages/Brander/Homespage';
import Permistioncreatepage from './pages/Permistion/Permistioncreatepage';
import Permistioneditpage from './pages/Permistion/Permistioneditpage';
import ProtectedRoute from './hooks/ProtectedRoute';
import Personelcreatepage from './pages/Personel/Personelcreatepage';
import Personeleditpage from './pages/Personel/Personeleditpage';
import SettingQuestionpage from './pages/Settingpage/SettingQuestionpage';
import SettingContactpage from './pages/Settingpage/SettingContactpage';
import Homescreatepage from './pages/Brander/Homescreatepage';
import SettingQuestionRankpage from './pages/Settingpage/SettingQuestionRankpage';
import Homeseditpage from './pages/Brander/Homeseditpage';
import Homesrankpage from './pages/Brander/Homesrankpage';
import Branchpage from './pages/Branch/Branchpage';
import Vediopage from './pages/Vedio/Vediopage';
import Branchcreatepage from './pages/Branch/Branchcreatepage';
import FaqTypepage from './pages/Faq/FaqTypepage';
import FaqTypeRankpage from './pages/Faq/FaqTypeRankpage';

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

function App() {

  return (
    <BrowserRouter basename={"/"}>
      <ThemeProvider>
        <HelmetProvider>
          <Routes>
            <Route
              element={
                <DashboardLayout>
                  <Suspense fallback={renderFallback}>
                    <Outlet />
                  </Suspense>
                </DashboardLayout>
              }
            >
              <Route path="/Personel" element={
                <ProtectedRoute permission="User">
                  <Personelpage />
                </ProtectedRoute>
              } />
              <Route path="/Personel/create" element={
                <ProtectedRoute permission="Add User">
                  <Personelcreatepage />
                </ProtectedRoute>
              } />
              <Route path="/Personel/edit/:id" element={
                <ProtectedRoute permission="Edit User">
                  <Personeleditpage />
                </ProtectedRoute>
              } />

              <Route path="/RolePermission" element={
                <ProtectedRoute permission="Role">
                  <Permistionpage />
                </ProtectedRoute>
              } />
              <Route path="/RolePermission/create" element={
                <ProtectedRoute permission="Add Role">
                  <Permistioncreatepage />
                </ProtectedRoute>
              } />
              <Route path="/RolePermission/edit/:id" element={
                <ProtectedRoute permission="Edit Role">
                  <Permistioneditpage />
                </ProtectedRoute>
              } />
              <Route path="/Banner" element={
                <ProtectedRoute permission="Brander">
                  <Homespage />
                </ProtectedRoute>
              } />
              <Route path="/Banner/create" element={
                <ProtectedRoute permission="Add Brander">
                  <Homescreatepage />
                </ProtectedRoute>
              } />
              <Route path="/Banner/edit/:id" element={
                <ProtectedRoute permission="Edit Brander">
                  <Homeseditpage />
                </ProtectedRoute>
              } />
              <Route path="/Banner/rank" element={
                <ProtectedRoute permission="DropDown Brander">
                  <Homesrankpage />
                </ProtectedRoute>
              } />
              {/* ----------------------------------------------------------------------------------- */}
              {/* Branch */}
              <Route path="/Branch" element={
                <ProtectedRoute permission="Branch">
                  <Branchpage />
                </ProtectedRoute>
              } />
              <Route path="/Branch/create" element={
                <ProtectedRoute permission="Add Branch">
                  <Branchcreatepage />
                </ProtectedRoute>
              } />
              {/* ----------------------------------------------------------------------------------- */}
              {/* Vedio */}
              <Route path="/Vedio" element={
                <ProtectedRoute permission="Vedio">
                  <Vediopage />
                </ProtectedRoute>
              } />

              {/* ----------------------------------------------------------------------------------- */}
              {/* FAQ */}

              {/* <Route path="/faq" element={
                <ProtectedRoute permission="FAQ">
                  <Faqpage />
                </ProtectedRoute>
              } /> */}

              <Route path="/faq/type" element={
                <ProtectedRoute permission="FAQ">
                  <FaqTypepage />
                </ProtectedRoute>
              } />

              <Route path="/faq/type/rank" element={
                <ProtectedRoute permission="FAQ">
                  <FaqTypeRankpage />
                </ProtectedRoute>
              } />

              {/* <Route path="/faq/question" element={
                <ProtectedRoute permission="FAQ">
                  <FaqQuestionpage />
                </ProtectedRoute>
              } /> */}

              {/* ----------------------------------------------------------------------------------- */}
              {/* Setting */}
              {/* <Route path="Settings_Theme" element={
                    <ProtectedRoute permission="SettingsTheme">
                      <SettingLogopage />
                    </ProtectedRoute>
                  } /> */}
              <Route path="/Settings_Question" element={
                <ProtectedRoute permission="Question">
                  <SettingQuestionpage />
                </ProtectedRoute>
              } />
              <Route path="/Settings_Question/rank" element={
                <ProtectedRoute permission="DropDown Question">
                  <SettingQuestionRankpage />
                </ProtectedRoute>
              } />
              <Route path="/Settings_Contact" element={
                <ProtectedRoute permission="Contact">
                  <SettingContactpage />
                </ProtectedRoute>
              } />
            </Route>
            {/* 🟦 404 */}
            <Route path="/" element={<Loginpage />} />
          </Routes>
        </HelmetProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
