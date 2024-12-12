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

    const deleteDoctor = async (id) => {
        if (!doctorInfo) {
            return
        }
        try {
            if(doctorAppointments.length > 0) {
                const deleteAppointmentJobs = doctorAppointments.map((appointment) => {
                    return axios.delete(`https://fed-medical-clinic-api.vercel.app/appointments/${appointment.id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                });
                await Promise.all(deleteAppointmentJobs);
            }

            if (doctorPatients.length > 0) {
                const deletePatientAssigned = doctorPatients.map((patient) => {
                    return axios.delete(`https://fed-medical-clinic-api.vercel.app/patients/${patient.id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                });
                await Promise.all(deletePatientAssigned);
            }

            await axios.delete(`https://fed-medical-clinic-api.vercel.app/doctors/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            console.log('Doctor Deleted');

            setDoctorAppointments([])
            setDoctorPatients([])
            setDoctorsInfo(null)
        } catch (e) {
            console.error(e);
            
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
                            // Here we're using a polymorphic mantine component
                            // This is a card, but we're passing in a Flex component to be the root element
                            // That means the card will be rendered as a Flex component, but still have the styling of a card
                            // We can use the props of both the card and the Flex component
                            // So here I've given Flex as the root component
                            // That means I can use the justify and direction props of Flex, and use that to make sure the buttons pushed to the bottom
                            // https://dev.to/thexdev/polymorphic-component-2737
                            <Card shadow="sm" component={Flex} justify={'space-between'} direction={'column'}>
                                <h2>Dr {doctor.first_name} {doctor.last_name}</h2>
                                <p>Specialisation: {doctor.specialisation}</p>
                                <Flex w={'100%'} justify={'space-between'}>
                                    <button onClick={() => navigate(`/doctors/${doctor.id}`)}>View</button>
                                    <button onClick={() => alert('Not implemented!')}>🗑️</button>
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