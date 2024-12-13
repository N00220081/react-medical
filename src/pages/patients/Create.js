import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../utils/useAuth";
import { useForm } from '@mantine/form';
import { TextInput, Text, Button, Textarea } from "@mantine/core";
import { DateInput } from '@mantine/dates';

const Create = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const form = useForm({
        initialValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            address: '',
            date_of_birth: '', // Date will be stored here
        },
        validate: {
            first_name: (value) =>
                value.length > 2 && value.length < 255
                    ? null
                    : 'First name must be between 2 and 255 characters',
            last_name: (value) =>
                value.length > 2 && value.length < 255
                    ? null
                    : 'Last name must be between 2 and 255 characters',
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            phone: (value) => (value.length === 10 ? null : 'Phone number must be 10 digits'),
            address: (value) => (value.length > 5 ? null : 'Address must be at least 5 characters'),
            date_of_birth: (value) => (value instanceof Date ? null : 'Invalid date'),
        },
    });

    const handleSubmit = () => {
        const payload = {
            first_name: form.values.first_name,
            last_name: form.values.last_name,
            email: form.values.email,
            phone: form.values.phone,
            address: form.values.address,
            date_of_birth: form.values.date_of_birth.toISOString().split('T')[0], // Convert Date to ISO string
        };

        axios.post(`https://fed-medical-clinic-api.vercel.app/patients`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                console.log("Patient created successfully:", res.data);
                navigate(`../${res.data.id}`, { relative: 'path' });
            })
            .catch((err) => {
                console.error("Error creating patient:", err);

                if (err.response?.status === 422) {
                    const errors = err.response.data.error.issues || [];
                    form.setErrors(
                        Object.fromEntries(errors.map((error) => [error.path[0], error.message]))
                    );
                }

                if (
                    err.response.data.message ===
                    'SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: patients.email'
                ) {
                    form.setFieldError('email', 'Email must be unique.');
                }

                if (
                    err.response.data.message ===
                    'SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: patients.phone'
                ) {
                    form.setFieldError('phone', 'Phone number must be unique.');
                }
            });
    };

    return (
        <div>
            <Text size={24} mb={5}>
                Create a Patient
            </Text>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <TextInput
                    withAsterisk
                    label={'First name'}
                    name='first_name'
                    {...form.getInputProps('first_name')}
                />
                <TextInput
                    withAsterisk
                    label='Last name'
                    name='last_name'
                    {...form.getInputProps('last_name')}
                />
                <TextInput
                    label={'Email'}
                    withAsterisk
                    name='email'
                    {...form.getInputProps('email')}
                />
                <TextInput
                    label={'Phone'}
                    name='phone'
                    withAsterisk
                    {...form.getInputProps('phone')}
                />
                <DateInput
                    label="Date of Birth"
                    name="date_of_birth"
                    withAsterisk
                    placeholder="Select a date"
                    valueFormat="YYYY-MM-DD"
                    {...form.getInputProps('date_of_birth')}
                />
                <Textarea
                    label={'Address'}
                    name='address'
                    withAsterisk
                    {...form.getInputProps('address')}
                />
                <Button mt={10} type={'submit'}>
                    Submit
                </Button>
            </form>
        </div>
    );
};

export default Create;
