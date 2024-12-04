import { useEffect, useState } from "react"
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { useParams } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";

const Edit = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    // Starting off with an empty object for our form
    const [form, setForm] = useState({})

    useEffect(() => {
        axios.get(`https://fed-medical-clinic-api.vercel.app/doctors/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res)
                // Making a request to get info on festivals/{id}
                // Then set our form data using that, so our fields get pre-populated              
                setForm(res.data)
            })
            .catch((err) => {
                console.error(err)
            })
    }, [])



    const handleSubmit = () => {
        axios.put(`https://fed-medical-clinic-api.vercel.app/doctors/${id}`, form, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((res) => {
                console.log(res.data)
                navigate(`/festivals/${id}`, { relative: 'path', replace: true })
            })
            .catch((err) => {
                console.error(err)
            })
    }


    return (
        <div>
            <h1>Edit a doctor</h1>
            <div>
                Not implemented
            </div>
        </div>
    )
}

export default Edit;