import { useEffect, useState } from "react";
import axios from 'axios'
import { useLocation, useNavigate } from "react-router-dom";
import { Card, SimpleGrid, Button, Text, Flex } from "@mantine/core";
import { useAuth } from "../utils/useAuth";

const Home = () => {
    const { token } = useAuth();
    const [doctors, setDoctors] = useState([])
    const [doctorInfo, setDoctorsInfo] = useState([null])
    const [doctorAppointments, setDoctorAppointments] = useState([])
    const [doctorPatients, setDoctorPatients] = useState([])

    const navigate = useNavigate();

    // We saw in a previous class how our ProtectedRoute checks for authorisation
    // if no token is found, it redirects to the '/' route, passing a 'msg' via the route state
    // if there is a message, we retrieve it here and display it
    const msg = useLocation()?.state?.msg || null;

    const getDoctors = async () => {
        try {
            const res = await axios.get(`https://fed-medical-clinic-api.vercel.app/doctors/`);
            setDoctors(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchDoctorRelatedData = async (id) => {
        try {
            const [appointmentsRes, patientsRes] = await Promise.all([
                axios.get(`https://fed-medical-clinic-api.vercel.app/appointments/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`https://fed-medical-clinic-api.vercel.app/patients/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            setDoctorAppointments(appointmentsRes.data);
            setDoctorPatients(patientsRes.data);
        } catch (error) {
            console.error("Error fetching doctor-related data:", error.response?.data || error.message);
        }
    };
    

    const deleteDoctor = async (id) => {
        if (!doctorInfo) {
            return;
        }
    
        try {
            console.log("Fetching related data...");
            await fetchDoctorRelatedData(id); // Ensure related data is up-to-date
    
            console.log("Appointments to delete:", doctorAppointments);
            console.log("Patients to delete:", doctorPatients);
    
            // Delete appointments first
            if (doctorAppointments.length > 0) {
                const deleteAppointmentJobs = doctorAppointments.map((appointment) =>
                    axios.delete(`https://fed-medical-clinic-api.vercel.app/appointments/${appointment.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                );
                await Promise.all(deleteAppointmentJobs);
                console.log("All appointments deleted.");
            }
    
            // Delete patients next
            if (doctorPatients.length > 0) {
                const deletePatientJobs = doctorPatients.map((patient) =>
                    axios.delete(`https://fed-medical-clinic-api.vercel.app/patients/${patient.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                );
                await Promise.all(deletePatientJobs);
                console.log("All patients deleted.");
            }
    
            // Delete the doctor
            await axios.delete(`https://fed-medical-clinic-api.vercel.app/doctors/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Doctor deleted.");
    
            // Clear state
            setDoctorAppointments([]);
            setDoctorPatients([]);
            setDoctorsInfo(null);
    
            // Optionally update doctor list
            setDoctors((prevDoctors) => prevDoctors.filter((doctor) => doctor.id !== id));
        } catch (e) {
            console.error("Error deleting doctor or related data:", e.response?.data || e.message);
            alert("Failed to delete doctor. Please try again.");
        }
    };
    


    useEffect(() => {
        // We can't make useEffect itself async, so we call an async function from inside it
        const fetchData = async () => {
            await getDoctors();
        }

        fetchData();
    }, []);


    if (!doctors.length) {
        return <div>Loading...</div>
    }

    return (
        <div>
            {msg && <Text mb={10} color='red'>{msg}</Text>}
            <Button mb={10} onClick={() => navigate('/doctors/create')}>Create doctor</Button>
            <SimpleGrid cols={3}>

                {
                    doctors && doctors.map((doctor) => {
                        return (
                          
                            <Card shadow="sm" component={Flex} justify={'space-between'} direction={'column'}>
                                <h2>Dr {doctor.first_name} {doctor.last_name}</h2>
                                <p>Specialisation: {doctor.specialisation}</p>
                                <Flex w={'100%'} justify={'space-between'}>
                                    <button onClick={() => navigate(`/doctors/${doctor.id}`)}>View</button>
                                    <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this doctor?')) {
                                        deleteDoctor(doctor.id);
                                    }
                                }}
                            >
                                🗑️
                            </button>
                                </Flex>
                            </Card>
                        )
                    })
                }
            </SimpleGrid>
        </div>
    );
};

export default Home;