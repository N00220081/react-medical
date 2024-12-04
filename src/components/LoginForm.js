import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';

const LoginForm = () => {
    const navigate = useNavigate();
    const {login} = useAuth();

    const [form, setForm] = useState({
        email: '',
        password: ''
    })

    const handleSubmit = (e) => {
        // The form will cause a refresh by default. We don't want that, because our state will disappear.
        e.preventDefault();        

        login(form.email, form.password)
           
        navigate('/')
    }

    const handleChange = (e) => {
        setForm(({
            ...form,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <form>
            <input onChange={handleChange} value={form.email} type='email' name='email' placeholder='joe.bloggs@email.com'></input>
            <input onChange={handleChange} value={form.password} type='password' name='password'></input>
            <button onClick={handleSubmit}>Submit</button>
        </form>
    )
}

export default LoginForm