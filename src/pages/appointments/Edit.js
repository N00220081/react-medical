import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import { useForm } from "@mantine/form";
import { Text, Button, Select } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useEffect, useState } from "react";

const EditAppointment = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // To get the appointment ID from the route
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch doctors, patients, and appointment details
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

        // Populate the form with the fetched appointment details
        form.setValues({
          appointment_date: new Date(appointment.appointment_date * 1000),
          doctor_id: appointment.doctor_id.toString(),
          patient_id: appointment.patient_id.toString(),
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleSubmit = async () => {
    const payload = {
      appointment_date: Math.floor(
        form.values.appointment_date.getTime() / 1000
      ), // Convert Date to UNIX timestamp
      doctor_id: form.values.doctor_id,
      patient_id: form.values.patient_id,
    };

    try {
      const res = await axios.patch(
        `https://fed-medical-clinic-api.vercel.app/appointments/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Appointment updated successfully:", res.data);
      navigate(`/appointments/${res.data.id}`);
    } catch (err) {
      console.error("Error updating appointment:", err);

      if (err.response?.status === 422) {
        const errors = err.response.data.error.issues || [];
        form.setErrors(
          Object.fromEntries(errors.map((error) => [error.path[0], error.message]))
        );
      } else {
        form.setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <div>
      <Text size={24} mb={5}>
        Edit Appointment
      </Text>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <DateInput
          label="Appointment Date"
          name="appointment_date"
          withAsterisk
          placeholder="Select a date"
          valueFormat="YYYY-MM-DD"
          {...form.getInputProps("appointment_date")}
        />
        <Select
          label="Doctor"
          name="doctor_id"
          withAsterisk
          placeholder="Select a doctor"
          data={doctors.map((doctor) => ({
            value: doctor.id.toString(),
            label: `Dr. ${doctor.first_name} ${doctor.last_name}`,
          }))}
          {...form.getInputProps("doctor_id")}
        />
        <Select
          label="Patient"
          name="patient_id"
          withAsterisk
          placeholder="Select a patient"
          data={patients.map((patient) => ({
            value: patient.id.toString(),
            label: `${patient.first_name} ${patient.last_name}`,
          }))}
          {...form.getInputProps("patient_id")}
        />
        <Button mt={10} type="submit">
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default EditAppointment;
