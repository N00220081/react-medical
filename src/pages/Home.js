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
  const [doctorInfo, setDoctorsInfo] = useState([null]);
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [doctorPatients, setDoctorPatients] = useState([]);

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

  // Fetch patients
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

      // Map appointments to include doctor and patient names
      const appointmentsWithNames = res.data.map((appointment) => {
        const doctor = doctors.find((doc) => doc.id === appointment.doctor_id);
        const patient = patients.find(
          (pat) => pat.id === appointment.patient_id
        );

        return {
          ...appointment,
          doctorName: doctor
            ? `Dr. ${doctor.first_name} ${doctor.last_name}`
            : "Unknown Doctor",
          patientName: patient
            ? `${patient.first_name} ${patient.last_name}`
            : "Unknown Patient",
        };
      });

      setAppointments(appointmentsWithNames);
    } catch (e) {
      console.error("Error fetching appointments:", e);
    }
  };

  const fetchDoctorRelatedData = async (id) => {
    try {
      const [appointmentsRes, patientsRes] = await Promise.all([
        axios.get(
          `https://fed-medical-clinic-api.vercel.app/appointments/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(`https://fed-medical-clinic-api.vercel.app/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setDoctorAppointments(appointmentsRes.data);
      setDoctorPatients(patientsRes.data);
    } catch (error) {
      console.error(
        "Error fetching doctor-related data:",
        error.response?.data || error.message
      );
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
          axios.delete(
            `https://fed-medical-clinic-api.vercel.app/appointments/${appointment.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        );
        await Promise.all(deleteAppointmentJobs);
        console.log("All appointments deleted.");
      }

      // Delete patients next
      if (doctorPatients.length > 0) {
        const deletePatientJobs = doctorPatients.map((patient) =>
          axios.delete(
            `https://fed-medical-clinic-api.vercel.app/patients/${patient.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        );
        await Promise.all(deletePatientJobs);
        console.log("All patients deleted.");
      }

      // Delete the doctor
      await axios.delete(
        `https://fed-medical-clinic-api.vercel.app/doctors/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Doctor deleted.");

      // Clear state
      setDoctorAppointments([]);
      setDoctorPatients([]);
      setDoctorsInfo(null);

      // Optionally update doctor list
      setDoctors((prevDoctors) =>
        prevDoctors.filter((doctor) => doctor.id !== id)
      );
    } catch (e) {
      console.error(
        "Error deleting doctor or related data:",
        e.response?.data || e.message
      );
      alert("Failed to delete doctor. Please try again.");
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
            </Flex>
          </Card>
        ))}
      </SimpleGrid>
    </div>
  );
};

export default Home;
