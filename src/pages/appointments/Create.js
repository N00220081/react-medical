import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import { useForm } from "@mantine/form";
import { Text, Button, Select } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useEffect, useState } from "react";

const Create = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

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

  // Fetch doctors and patients
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, patientsRes] = await Promise.all([
          axios.get(`https://fed-medical-clinic-api.vercel.app/doctors/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`https://fed-medical-clinic-api.vercel.app/patients/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setDoctors(doctorsRes.data);
        setPatients(patientsRes.data);
      } catch (err) {
        console.error("Error fetching doctors or patients:", err);
      }
    };

    fetchData();
  }, [token]);

  const handleSubmit = async () => {
    const payload = {
      appointment_date: form.values.appointment_date
        .toISOString()
        .split("T")[0],
      doctor_id: parseInt(form.values.doctor_id, 10),
      patient_id: parseInt(form.values.patient_id, 10),
    };

    try {
      const res = await axios.post(
        `https://fed-medical-clinic-api.vercel.app/appointments`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Appointment created successfully:", res.data);
      navigate(`/appointments/${res.data.id}`);
    } catch (err) {
      console.error("Error creating appointment:", err);

      if (err.response?.status === 422) {
        const errors = err.response.data.error.issues || [];
        form.setErrors(
          Object.fromEntries(
            errors.map((error) => [error.path[0], error.message])
          )
        );
      } else {
        form.setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    }
  };

  return (
    <div>
      <Text size={24} mb={5}>
        Create an Appointment
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
          Submit
        </Button>
      </form>
    </div>
  );
};

export default Create;
