import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";

const SingleAppointment = () => {
    const { token } = useAuth();
    const [appointment, setAppointment] = useState(null);
    const [doctorName, setDoctorName] = useState("Loading...");
    const [patientName, setPatientName] = useState("Loading...");

    const { id } = useParams();

    useEffect(() => {
        // Fetch the appointment data
        axios.get(`https://fed-medical-clinic-api.vercel.app/appointments/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(async (res) => {
                const appointmentData = res.data;
                setAppointment(appointmentData);

                // Fetch doctor and patient names concurrently
                try {
                    const [doctorRes, patientRes] = await Promise.all([
                        appointmentData.doctor_id
                            ? axios.get(`https://fed-medical-clinic-api.vercel.app/doctors/${appointmentData.doctor_id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                              })
                            : Promise.resolve(null),
                        appointmentData.patient_id
                            ? axios.get(`https://fed-medical-clinic-api.vercel.app/patients/${appointmentData.patient_id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                              })
                            : Promise.resolve(null),
                    ]);

                    if (doctorRes?.data) {
                        setDoctorName(`Dr. ${doctorRes.data.first_name} ${doctorRes.data.last_name}`);
                    } else {
                        setDoctorName("Unknown Doctor");
                    }

                    if (patientRes?.data) {
                        setPatientName(`${patientRes.data.first_name} ${patientRes.data.last_name}`);
                    } else {
                        setPatientName("Unknown Patient");
                    }
                } catch (err) {
                    console.error("Error fetching doctor or patient data:", err);
                }
            })
            .catch((err) => {
                console.error("Error fetching appointment data:", err);
            });
    }, [id, token]);

    if (!appointment) {
        return 'Loading...';
    }

    return (
        <div>
            <Link to={`/appointments/${id}/edit`}>
                Edit appointment
            </Link>
            <h1>Date: {appointment.appointment_date}</h1>
            <h2>Doctor: {doctorName}</h2>
            <h2>Patient: {patientName}</h2>
        </div>
    );
};

export default SingleAppointment;
