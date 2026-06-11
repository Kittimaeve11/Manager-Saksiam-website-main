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
import Homespage from './pages/Banner/Homespage';
import Permistioncreatepage from './pages/Permistion/Permistioncreatepage';
import Permistioneditpage from './pages/Permistion/Permistioneditpage';
import ProtectedRoute from './hooks/ProtectedRoute';
import Personelcreatepage from './pages/Personel/Personelcreatepage';
import Personeleditpage from './pages/Personel/Personeleditpage';
import SettingQuestionpage from './pages/Settingpage/SettingQuestionpage';
import SettingContactpage from './pages/Settingpage/SettingContactpage';
import SettingLogopage from './pages/Settingpage/SettingLogopage';
import Homescreatepage from './pages/Banner/Homescreatepage';
import SettingQuestionRankpage from './pages/Settingpage/SettingQuestionRankpage';
import Homeseditpage from './pages/Banner/Homeseditpage';
import Homesrankpage from './pages/Banner/Homesrankpage';
import Branchpage from './pages/Branch/Branchpage';
import Vediopage from './pages/Vedio/Vediopage';
import VedioCreatepage from './pages/Vedio/VedioCreatepage';
import VedioEditpage from './pages/Vedio/VedioEditpage';
import VedioShowpage from './pages/Vedio/VedioShowpage';
import VedioRankpage from './pages/Vedio/VedioRankpage';
import Branchcreatepage from './pages/Branch/Branchcreatepage';
import FaqTypepage from './pages/Faq/FaqTypepage';
import FaqTypeRankpage from './pages/Faq/FaqTypeRankpage';
import FaqQuestionpage from './pages/Faq/FaqQuestionpage';
import FaqQuestionCreatepage from './pages/Faq/FaqQuestionCreatepage';
import FaqQuestionEditpage from './pages/Faq/FaqQuestionEditpage';
import FaqQuestionRankpage from './pages/Faq/FaqQuestionRankpage';
import NewsTypePage from './pages/News/NewsTypepage';
import NewsTypeRankpage from './pages/News/NewsTypeRankpage';
import NewsPage from './pages/News/Newspage';
import NewsCreatepage from './pages/News/NewsCreatepage';
import NewsEditpage from './pages/News/NewsEditpage';
import NewsShowpage from './pages/News/NewsShowpage';
import Policypage from './pages/Policy/Policypage';
import PolicyCreatepage from './pages/Policy/PolicyCreatepage';
import PolicyEditpage from './pages/Policy/PolicyEditpage';
import PolicyShowpage from './pages/Policy/PolicyShowpage';
import PolicyRankpage from './pages/Policy/PolicyRankpage';
import AboutCompanyDirectorpage from './pages/About/AboutCompanyDirectorpage';
import AboutCompanyDirectorCreatepage from './pages/About/AboutCompanyDirectorCreatepage';
import AboutCompanyDirectorEditpage from './pages/About/AboutCompanyDirectorEditpage';
import AboutCompanyDirectorRankpage from './pages/About/AboutCompanyDirectorRankpage';
import AboutMissionpage from './pages/About/AboutMissionpage';
import AboutMissionCreatepage from './pages/About/AboutMissionCreatepage';
import AboutMissionEditpage from './pages/About/AboutMissionEditpage';
import AboutMissionRankpage from './pages/About/AboutMissionRankpage';

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
              <Route path="/Vedio/create" element={
                <ProtectedRoute permission="Vedio">
                  <VedioCreatepage />
                </ProtectedRoute>
              } />
              <Route path="/Vedio/edit/:id" element={
                <ProtectedRoute permission="Vedio">
                  <VedioEditpage />
                </ProtectedRoute>
              } />
              <Route path="/Vedio/view/:id" element={
                <ProtectedRoute permission="Vedio">
                  <VedioShowpage />
                </ProtectedRoute>
              } />
              <Route path="/Vedio/rank" element={
                <ProtectedRoute permission="Vedio">
                  <VedioRankpage />
                </ProtectedRoute>
              } />

              {/* ----------------------------------------------------------------------------------- */}
              {/* About */}
              <Route path="/About/Mission" element={
                <AboutMissionpage />
              } />

              <Route path="/About/Mission/create" element={
                <AboutMissionCreatepage />
              } />

              <Route path="/About/Mission/edit/:id" element={
                <AboutMissionEditpage />
              } />

              <Route path="/About/Mission/rank" element={
                <AboutMissionRankpage />
              } />

              <Route path="/About/Company_Director" element={
                <AboutCompanyDirectorpage />
              } />

              <Route path="/About/Company_Director/create" element={
                <AboutCompanyDirectorCreatepage />
              } />

              <Route path="/About/Company_Director/edit/:id" element={
                <AboutCompanyDirectorEditpage />
              } />

              <Route path="/About/Company_Director/rank" element={
                <AboutCompanyDirectorRankpage />
              } />

              {/* ----------------------------------------------------------------------------------- */}
              {/* FAQ */}

              {/* <Route path="/faq" element={
                <ProtectedRoute permission="FAQ">
                  <Faqpage />
                </ProtectedRoute>
              } /> */}

              <Route path="/Faq_Type" element={
                <ProtectedRoute permission="FAQ">
                  <FaqTypepage />
                </ProtectedRoute>
              } />

              <Route path="/Faq_Type/rank" element={
                <ProtectedRoute permission="FAQ">
                  <FaqTypeRankpage />
                </ProtectedRoute>
              } />

              <Route path="/Faq_Question" element={
                <ProtectedRoute permission="FAQ">
                  <FaqQuestionpage />
                </ProtectedRoute>
              } />

              <Route path="/Faq_Question/create" element={
                <ProtectedRoute permission="FAQ">
                  <FaqQuestionCreatepage />
                </ProtectedRoute>
              } />

              <Route path="/Faq_Question/edit/:id" element={
                <ProtectedRoute permission="FAQ">
                  <FaqQuestionEditpage />
                </ProtectedRoute>
              } />

              <Route path="/Faq_Question/rank" element={
                <ProtectedRoute permission="FAQ">
                  <FaqQuestionRankpage />
                </ProtectedRoute>
              } />

              {/* ----------------------------------------------------------------------------------- */}
              {/* News */}

              <Route path="/News_Type" element={
                <ProtectedRoute permissions={["News", "New"]}>
                  <NewsTypePage />
                </ProtectedRoute>
              } />

              <Route path="/News_Type/rank" element={
                <ProtectedRoute permissions={["News", "New"]}>
                  <NewsTypeRankpage />
                </ProtectedRoute>
              } />

              <Route path="/News_Activity" element={
                <ProtectedRoute permissions={["News", "New"]}>
                  <NewsPage />
                </ProtectedRoute>
              } />

              <Route path="/News_Activity/create" element={
                <ProtectedRoute permissions={["News", "New"]}>
                  <NewsCreatepage />
                </ProtectedRoute>
              } />

              <Route path="/News_Activity/edit/:id" element={
                <ProtectedRoute permissions={["News", "New"]}>
                  <NewsEditpage />
                </ProtectedRoute>
              } />

              <Route path="/News_Activity/view/:code" element={
                <ProtectedRoute permissions={["News", "New"]}>
                  <NewsShowpage />
                </ProtectedRoute>
              } />

              {/* ----------------------------------------------------------------------------------- */}
              {/* Policy */}

              <Route path="/Policy" element={
                <ProtectedRoute permissions={["Policy", "Policies"]}>
                  <Policypage />
                </ProtectedRoute>
              } />

              <Route path="/policy/terms" element={
                <ProtectedRoute permissions={["Policy", "Policies"]}>
                  <Policypage />
                </ProtectedRoute>
              } />

              <Route path="/Policy/create" element={
                <ProtectedRoute permissions={["Policy", "Policies"]}>
                  <PolicyCreatepage />
                </ProtectedRoute>
              } />

              <Route path="/Policy/rank" element={
                <ProtectedRoute permissions={["Policy", "Policies"]}>
                  <PolicyRankpage />
                </ProtectedRoute>
              } />

              <Route path="/Policy/edit/:id" element={
                <ProtectedRoute permissions={["Policy", "Policies"]}>
                  <PolicyEditpage />
                </ProtectedRoute>
              } />

              <Route path="/Policy/view/:code" element={
                <ProtectedRoute permissions={["Policy", "Policies"]}>
                  <PolicyShowpage />
                </ProtectedRoute>
              } />
              {/* ----------------------------------------------------------------------------------- */}
              {/* Setting */}
              <Route path="/Settings_Theme" element={
                <ProtectedRoute permission="SettingsTheme">
                  <SettingLogopage />
                </ProtectedRoute>
              } />
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
