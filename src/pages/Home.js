import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, SimpleGrid, Button, Text, Flex } from "@mantine/core";
import { useAuth } from "../utils/useAuth";

const Home = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const msg = useLocation()?.state?.msg || null;

  const getDoctors = async () => {
    try {
      const res = await axios.get(
        `https://fed-medical-clinic-api.vercel.app/doctors/`
      );
      setDoctors(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const getPatients = async () => {
    try {
      const res = await axios.get(
        `https://fed-medical-clinic-api.vercel.app/patients/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPatients(res.data);
    } catch (e) {
      console.error("Error fetching patients:", e);
    }
  };

  const getAppointments = async () => {
    try {
      const res = await axios.get(
        `https://fed-medical-clinic-api.vercel.app/appointments/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const appointmentsWithNames = await Promise.all(
        res.data.map(async (appointment) => {
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
      );

      setAppointments(appointmentsWithNames);
    } catch (e) {
      console.error("Error fetching appointments:", e);
    }
  };

  const deletePatient = async (id) => {
    try {
      await axios.delete(
        `https://fed-medical-clinic-api.vercel.app/patients/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPatients((prevPatients) =>
        prevPatients.filter((patient) => patient.id !== id)
      );
      console.log("Patient deleted.");
    } catch (e) {
      console.error("Error deleting patient:", e);
      alert("Failed to delete patient. Please try again.");
    }
  };

  const deleteDoctor = async (id) => {
    try {
      await axios.delete(
        `https://fed-medical-clinic-api.vercel.app/doctors/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDoctors((prevDoctors) =>
        prevDoctors.filter((doctor) => doctor.id !== id)
      );
      console.log("Doctor deleted.");
    } catch (e) {
      console.error("Error deleting doctor:", e);
      alert("Failed to delete doctor. Please try again.");
    }
  };

  const deleteAppointment = async (id) => {
    try {
      await axios.delete(
        `https://fed-medical-clinic-api.vercel.app/appointments/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments((prevAppointments) =>
        prevAppointments.filter((appointment) => appointment.id !== id)
      );
      console.log("Appointment deleted.");
    } catch (e) {
      console.error("Error deleting appointment:", e);
      alert("Failed to delete appointment. Please try again.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([getDoctors(), getPatients(), getAppointments()]);
    };

    fetchData();
  }, []);

  if (!doctors.length) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {msg && (
        <Text mb={10} color="red">
          {msg}
        </Text>
      )}
      <Button mb={10} onClick={() => navigate("/doctors/create")}>
        Create Doctor
      </Button>

      {/* Doctors Section */}
      <Text mb={10} size="lg" weight={700}>
        Doctors
      </Text>
      <SimpleGrid cols={3}>
        {doctors.map((doctor) => (
          <Card
            key={doctor.id}
            shadow="sm"
            component={Flex}
            justify={"space-between"}
            direction={"column"}
          >
            <h2>
              Dr {doctor.first_name} {doctor.last_name}
            </h2>
            <p>Specialisation: {doctor.specialisation}</p>
            <Flex w={"100%"} justify={"space-between"}>
              <button onClick={() => navigate(`/doctors/${doctor.id}`)}>
                View
              </button>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this doctor?"
                    )
                  ) {
                    deleteDoctor(doctor.id);
                  }
                }}
              >
                🗑️
              </button>
            </Flex>
          </Card>
        ))}
      </SimpleGrid>

      {/* Patients Section */}
      <Text mt={20} mb={10} size="lg" weight={700}>
        Patients
      </Text>
      <SimpleGrid cols={3}>
        {patients.map((patient) => (
          <Card
            key={patient.id}
            shadow="sm"
            component={Flex}
            justify={"space-between"}
            direction={"column"}
          >
            <h2>
              {patient.first_name} {patient.last_name}
            </h2>
            <p>Email: {patient.email}</p>
            <p>Phone Number: {patient.phone}</p>
            <p>Address: {patient.address}</p>
            <Flex w={"100%"} justify={"space-between"}>
              <button onClick={() => navigate(`/patients/${patient.id}`)}>
                View
              </button>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this patient?"
                    )
                  ) {
                    deletePatient(patient.id);
                  }
                }}
              >
                🗑️
              </button>
            </Flex>
          </Card>
        ))}
      </SimpleGrid>

      {/* Appointments Section */}
      <Text mt={20} mb={10} size="lg" weight={700}>
        Appointments
      </Text>
      <SimpleGrid cols={3}>
        {appointments.map((appointment) => (
          <Card
            key={appointment.id}
            shadow="sm"
            component={Flex}
            justify={"space-between"}
            direction={"column"}
          >
            <h2>Appointment ID: {appointment.id}</h2>
            <p>Patient: {appointment.patientName}</p>
            <p>Doctor: {appointment.doctorName}</p>
            <p>Date: {appointment.appointment_date}</p>
            <Flex w={"100%"} justify={"space-between"}>
              <button
                onClick={() => navigate(`/appointments/${appointment.id}`)}
              >
                View
              </button>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this appointment?"
                    )
                  ) {
                    deleteAppointment(appointment.id);
                  }
                }}
              >
                🗑️
              </button>
            </Flex>
          </Card>
        ))}
      </SimpleGrid>
    </div>
  );
};

export default Home;
