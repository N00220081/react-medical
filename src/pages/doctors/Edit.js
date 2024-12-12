import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from "../../utils/useAuth";
import { useForm } from '@mantine/form';
import { TextInput, Select, Text, Button, Loader } from "@mantine/core";

const Edit = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);

    const form = useForm({
        initialValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            specialisation: 'General Practitioner',
        },
        validate: {
            first_name: (value) => value.length > 2 && value.length < 255 ? null : 'First name must be between 2 and 255 characters',
            last_name: (value) => value.length > 2 && value.length < 255 ? null : 'Last name must be between 2 and 255 characters',
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            phone: (value) => value.length === 10 ? null : 'Phone number must be 10 digits'
        },
    });

    useEffect(() => {
        axios.get(`https://fed-medical-clinic-api.vercel.app/doctors/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                form.setValues(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching doctor data:", err);
                setLoading(false);
            });
    }, [id, token]);

    const handleSubmit = () => {
        axios.patch(`https://fed-medical-clinic-api.vercel.app/doctors/${id}`, form.values, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                console.log("Doctor updated successfully:", res.data);
                navigate(`../../${res.data.id}`, { relative: 'path' });
            })
            .catch((err) => {
                console.error("Error updating doctor:", err);

                if (err.response?.status === 422) {
                    let errors = err.response.data.error.issues;
                    form.setErrors(Object.fromEntries(errors.map((error) => [error.path[0], error.message])));
                } else {
                    form.setErrors({ general: 'An unexpected error occurred. Please try again.' });
                }
            });
    };

    const specialisations = [
        'Podiatrist',
        'Dermatologist',
        'Pediatrician',
        'Psychiatrist',
        'General Practitioner',
    ];

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            <Text size={24} mb={5}>Edit Doctor</Text>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <TextInput withAsterisk label={'First name'} name='first_name' {...form.getInputProps('first_name')} />
                <TextInput withAsterisk label='Last name' name='last_name' {...form.getInputProps('last_name')} />

                <Select
                    searchable
                    withAsterisk
                    name='specialisation'
                    label="Specialisation"
                    placeholder="Pick one"
                    data={specialisations.map(specialisation => ({ value: specialisation, label: specialisation }))}
                    {...form.getInputProps('specialisation')}
                />

                <TextInput label={'Email'} withAsterisk name='email' {...form.getInputProps('email')} />
                <TextInput label={'Phone'} name='phone' withAsterisk {...form.getInputProps('phone')} />

                <Button mt={10} type={'submit'}>Save Changes</Button>
            </form>
        </div>
    );
};

export default Edit;
