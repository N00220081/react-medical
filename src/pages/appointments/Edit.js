import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import { useForm } from "@mantine/form";
import {
  Text,
  Button,
  Select,
  Paper,
  Group,
  Stack,
  Divider,
  Notification,
  Loader,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useEffect, useState } from "react";

const EditAppointment = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // Appointment ID from route
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const form = useForm({
    initialValues: {
      appointment_date: "",
      doctor_id: "",
      patient_id: "",
    },
    validate: {
      appointment_date: (value) =>
        value instanceof Date ? null : "Invalid date",
      doctor_id: (value) => (value ? null : "Doctor selection is required"),
      patient_id: (value) => (value ? null : "Patient selection is required"),
    },
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, patientsRes, appointmentRes] = await Promise.all([
          axios.get(`https://fed-medical-clinic-api.vercel.app/doctors/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`https://fed-medical-clinic-api.vercel.app/patients/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `https://fed-medical-clinic-api.vercel.app/appointments/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        setDoctors(doctorsRes.data);
        setPatients(patientsRes.data);

        const appointment = appointmentRes.data;

        form.setValues({
          appointment_date: new Date(appointment.appointment_date * 1000),
          doctor_id: appointment.doctor_id.toString(),
          patient_id: appointment.patient_id.toString(),
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error loading data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleSubmit = async () => {
    const payload = {
      appointment_date: Math.floor(
        form.values.appointment_date.getTime() / 1000
      ),
      doctor_id: form.values.doctor_id,
      patient_id: form.values.patient_id,
    };

    try {
      const res = await axios.patch(
        `https://fed-medical-clinic-api.vercel.app/appointments/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}` },
          }
        );

      navigate(`/appointments/${res.data.id}`);
    } catch (err) {
      console.error("Error updating appointment:", err);

      if (err.response?.status === 422) {
        const errors = err.response.data.error.issues || [];
        form.setErrors(
          Object.fromEntries(errors.map((error) => [error.path[0], error.message]))
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <Group position="center" style={{ marginTop: "2rem" }}>
        <Loader size="lg" />
      </Group>
    );
  }

  return (
    <Paper
      shadow="md"
      radius="md"
      p="xl"
      style={{ maxWidth: 600, margin: "auto", marginTop: 40 }}
    >
      <Text size="xl" weight={700} mb="sm">
        Edit Appointment
      </Text>
      <Divider my="sm" />

      {error && (
        <Notification
          color="red"
          title="Error"
          onClose={() => setError("")}
        >
          {error}
        </Notification>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <DateInput
            withAsterisk
            label="Appointment Date"
            placeholder="Select a date"
            valueFormat="YYYY-MM-DD"
            {...form.getInputProps("appointment_date")}
          />

          <Select
            withAsterisk
            label="Doctor"
            placeholder="Select a doctor"
            data={doctors.map((doctor) => ({
              value: doctor.id.toString(),
              label: `Dr. ${doctor.first_name} ${doctor.last_name}`,
            }))}
            {...form.getInputProps("doctor_id")}
          />

          <Select
            withAsterisk
            label="Patient"
            placeholder="Select a patient"
            data={patients.map((patient) => ({
              value: patient.id.toString(),
              label: `${patient.first_name} ${patient.last_name}`,
            }))}
            {...form.getInputProps("patient_id")}
          />

          <Group position="right" mt="md">
            <Button type="submit">Save Changes</Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default EditAppointment;
