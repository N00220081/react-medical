import { useEffect, useState } from "react";
import axios from 'axios'
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";

const SinglePatient = () => {
    // No longer pulling this directly from localStorage, the context does that for us, and stores it in its state
    const {token} = useAuth();

    const [patient, setPatient] = useState(null)

    const { id } = useParams();

    useEffect(() => {
        axios.get(`https://fed-medical-clinic-api.vercel.app/patients/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res)
                setPatient(res.data)
            })  
            .catch((err) => {
                console.error(err)
            })
    }, [])

    if(!patient){
        return 'Loading...'
    }

    return patient && (
        <div>
            <Link to={`/patients/${id}/edit`}>
                Edit patient
            </Link>
            <h1>{patient.first_name} {patient.last_name}</h1>
            <p>email: {patient.email}</p>
            <p>Phone number: {patient.phone}</p>
            <p>Date of Birth: {patient.date_of_birth}</p>
            <p>Address: {patient.address}</p>
        </div>
    )
}

export default SinglePatient;