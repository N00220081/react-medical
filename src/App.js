import { AuthProvider } from "./utils/useAuth";
import { createContext } from "react";
import { MantineProvider, AppShell, Header, Footer, Text, Group, Container } from "@mantine/core";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import SingleDoctor from "./pages/doctors/SingleDoctor";
import DoctorCreate from "./pages/doctors/Create";
import DoctorEdit from "./pages/doctors/Edit";

import SinglePatient from "./pages/patients/SinglePatient";
import PatientCreate from "./pages/patients/Create";
import PatientEdit from "./pages/patients/Edit";

import SingleAppointment from "./pages/appointments/SingleAppointment";
import AppointmentEdit from "./pages/appointments/Edit";
import AppointmentCreate from "./pages/appointments/Create";

export const UserContext = createContext();

const App = () => {
    return (
        <AuthProvider>
            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{
                    colorScheme: "light", // Change to "dark" for dark mode
                    primaryColor: "blue",
                    fontFamily: "Inter, sans-serif",
                }}
            >
                <Router>
                    <AppShell
                        padding="md"
                        navbar={<Navbar />}
                        header={
                            <Header height={70} p="md" style={{ backgroundColor: "#1c7ed6", color: "white" }}>
                                <Group position="apart" align="center" style={{ height: "100%" }}>
                                    <Text size="xl" weight={700}>
                                        Clinic Manager
                                    </Text>
                                </Group>
                            </Header>
                        }
                        footer={
                            <Footer height={60} p="md" style={{ backgroundColor: "#f1f3f5" }}>
                                <Container>
                                    <Text align="center" size="sm" color="dimmed">
                                        © 2024 Clinic Manager. All rights reserved.
                                    </Text>
                                </Container>
                            </Footer>
                        }
                        styles={{
                            main: {
                                backgroundColor: "#f8f9fa",
                            },
                        }}
                    >
                        <Routes>
                            <Route path="/" element={<Home />} />

                            {/* Doctor Routes */}
                            <Route path="/" element={<ProtectedRoute />}>
                                <Route path="/doctors/create" element={<DoctorCreate />} />
                                <Route path="/doctors/:id/edit" element={<DoctorEdit />} />
                                <Route path="/doctors/:id" element={<SingleDoctor />} />
                            </Route>

                            {/* Patient Routes */}
                            <Route path="/" element={<ProtectedRoute />}>
                                <Route path="/patients/create" element={<PatientCreate />} />
                                <Route path="/patients/:id/edit" element={<PatientEdit />} />
                                <Route path="/patients/:id" element={<SinglePatient />} />
                            </Route>

                            {/* Appointment Routes */}
                            <Route path="/" element={<ProtectedRoute />}>
                                <Route path="/appointments/create" element={<AppointmentCreate />} />
                                <Route path="/appointments/:id/edit" element={<AppointmentEdit />} />
                                <Route path="/appointments/:id" element={<SingleAppointment />} />
                            </Route>

                            <Route path="/login" element={<LoginForm />} />
                            <Route path="/register" element={<RegisterForm />} />
                        </Routes>
                    </AppShell>
                </Router>
            </MantineProvider>
        </AuthProvider>
    );
};

export default App;
