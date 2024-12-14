import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Grid,
  Button,
  Text,
  Flex,
  Title,
  Divider,
  Box,
  Container,
} from "@mantine/core";
import { useAuth } from "../utils/useAuth";

const Home = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const msg = useLocation()?.state?.msg || null;

  const fetchData = async () => {
    try {
      const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
        axios.get(`https://fed-medical-clinic-api.vercel.app/doctors/`),
        axios.get(`https://fed-medical-clinic-api.vercel.app/patients/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`https://fed-medical-clinic-api.vercel.app/appointments/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDoctors(doctorsRes.data);
      setPatients(patientsRes.data);
      setAppointments(
        await Promise.all(
          appointmentsRes.data.map(async (appointment) => {
            try {
              const [doctorRes, patientRes] = await Promise.all([
                axios.get(
                  `https://fed-medical-clinic-api.vercel.app/doctors/${appointment.doctor_id}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                ),
                axios.get(
                  `https://fed-medical-clinic-api.vercel.app/patients/${appointment.patient_id}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                ),
              ]);
              return {
                ...appointment,
                doctorName: `Dr. ${doctorRes.data.first_name} ${doctorRes.data.last_name}`,
                patientName: `${patientRes.data.first_name} ${patientRes.data.last_name}`,
              };
            } catch {
              return {
                ...appointment,
                doctorName: "Unknown Doctor",
                patientName: "Unknown Patient",
              };
            }
          })
        )
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (type, id) => {
    const endpoints = {
      doctor: `https://fed-medical-clinic-api.vercel.app/doctors/${id}`,
      patient: `https://fed-medical-clinic-api.vercel.app/patients/${id}`,
      appointment: `https://fed-medical-clinic-api.vercel.app/appointments/${id}`,
    };

    try {
      await axios.delete(endpoints[type], {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (type === "doctor") setDoctors((prev) => prev.filter((d) => d.id !== id));
      if (type === "patient") setPatients((prev) => prev.filter((p) => p.id !== id));
      if (type === "appointment")
        setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}. Please try again.`);
    }
  };

  if (!doctors.length && !patients.length && !appointments.length) {
    return <Text align="center">Loading...</Text>;
  }

  return (
    <Container size="lg">
      {msg && (
        <Text mb={10} color="red" size="sm">
          {msg}
        </Text>
      )}

      <Title order={2} mb="lg" align="center">
        Admin Dashboard
      </Title>
      
      <Divider my="xl" label="Doctors" labelPosition="center" />
     

      <Grid gutter="lg">
        {doctors.map((doctor) => (
          <Grid.Col key={doctor.id} sm={6} md={4}>
            <Card shadow="sm" padding="md">
              <Text size="md" weight={600}>
                Dr. {doctor.first_name} {doctor.last_name}
              </Text>
              <Text size="sm" color="dimmed">
                Specialisation: {doctor.specialisation}
              </Text>
              <Divider my="sm" />
              <Flex justify="space-between">
                <Button size="xs" onClick={() => navigate(`/doctors/${doctor.id}`)}>
                  View
                </Button>
                <Button
                  size="xs"
                  color="red"
                  onClick={() =>
                    window.confirm("Delete this doctor?") && handleDelete("doctor", doctor.id)
                  }
                >
                  Delete
                </Button>
              </Flex>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Divider my="xl" label="Patients" labelPosition="center" />

      <Grid gutter="lg">
        {patients.map((patient) => (
          <Grid.Col key={patient.id} sm={6} md={4}>
            <Card shadow="sm" padding="md">
              <Text size="md" weight={600}>
                {patient.first_name} {patient.last_name}
              </Text>
              <Text size="sm" color="dimmed">
                {patient.email}
              </Text>
              <Divider my="sm" />
              <Flex justify="space-between">
                <Button size="xs" onClick={() => navigate(`/patients/${patient.id}`)}>
                  View
                </Button>
                <Button
                  size="xs"
                  color="red"
                  onClick={() =>
                    window.confirm("Delete this patient?") && handleDelete("patient", patient.id)
                  }
                >
                  Delete
                </Button>
              </Flex>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Divider my="xl" label="Appointments" labelPosition="center" />

      <Grid gutter="lg">
        {appointments.map((appointment) => (
          <Grid.Col key={appointment.id} sm={6} md={4}>
            <Card shadow="sm" padding="md">
              <Text size="md" weight={600}>
                Appointment ID: {appointment.id}
              </Text>
              <Text size="sm" color="dimmed">
                Doctor: {appointment.doctorName}
              </Text>
              <Text size="sm" color="dimmed">
                Patient: {appointment.patientName}
              </Text>
              <Divider my="sm" />
              <Flex justify="space-between">
                <Button
                  size="xs"
                  onClick={() => navigate(`/appointments/${appointment.id}`)}
                >
                  View
                </Button>
                <Button
                  size="xs"
                  color="red"
                  onClick={() =>
                    window.confirm("Delete this appointment?") &&
                    handleDelete("appointment", appointment.id)
                  }
                >
                  Delete
                </Button>
              </Flex>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;
