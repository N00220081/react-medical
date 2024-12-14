import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import {
  Text,
  Title,
  Button,
  Group,
  Loader,
  Stack,
  Container,
  Divider,
} from "@mantine/core";

const SingleAppointment = () => {
  const { token } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [doctorName, setDoctorName] = useState("Loading...");
  const [patientName, setPatientName] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  const { id } = useParams();

  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        // Fetch appointment data
        const res = await axios.get(
          `https://fed-medical-clinic-api.vercel.app/appointments/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const appointmentData = res.data;
        setAppointment(appointmentData);

        // Fetch doctor and patient names concurrently
        const [doctorRes, patientRes] = await Promise.all([
          appointmentData.doctor_id
            ? axios.get(
                `https://fed-medical-clinic-api.vercel.app/doctors/${appointmentData.doctor_id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              )
            : Promise.resolve(null),
          appointmentData.patient_id
            ? axios.get(
                `https://fed-medical-clinic-api.vercel.app/patients/${appointmentData.patient_id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              )
            : Promise.resolve(null),
        ]);

        setDoctorName(
          doctorRes?.data
            ? `Dr. ${doctorRes.data.first_name} ${doctorRes.data.last_name}`
            : "Unknown Doctor"
        );

        setPatientName(
          patientRes?.data
            ? `${patientRes.data.first_name} ${patientRes.data.last_name}`
            : "Unknown Patient"
        );

        setLoading(false);
      } catch (err) {
        console.error("Error fetching appointment data:", err);
        setLoading(false);
      }
    };

    fetchAppointmentData();
  }, [id, token]);

  if (loading) {
    return (
      <Group position="center" style={{ marginTop: "2rem" }}>
        <Loader size="lg" />
      </Group>
    );
  }

  if (!appointment) {
    return (
      <Text color="red" align="center" style={{ marginTop: "2rem" }}>
        Unable to load appointment data. Please try again later.
      </Text>
    );
  }

  return (
    <Container size="md" style={{ marginTop: 40 }}>
      <Group position="apart" align="center" mb="md">
        <Title order={2}>Appointment Details</Title>
        <Button
          component={Link}
          to={`/appointments/${id}/edit`}
          variant="outline"
        >
          Edit Appointment
        </Button>
      </Group>

      <Divider my="md" />

      <Stack spacing="md">
        <Text>
          <strong>Date:</strong>{" "}
          {new Date(appointment.appointment_date).toLocaleDateString()}
        </Text>
        <Text>
          <strong>Doctor:</strong> {doctorName}
        </Text>
        <Text>
          <strong>Patient:</strong> {patientName}
        </Text>
      </Stack>
    </Container>
  );
};

export default SingleAppointment;
