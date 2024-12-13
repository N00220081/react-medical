import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from "../../utils/useAuth";
import { useForm } from '@mantine/form';
import { TextInput, Textarea, Text, Button, Loader } from "@mantine/core";
import { DateInput } from "@mantine/dates";

const Edit = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  // Initialize form with patient fields
  const form = useForm({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      date_of_birth: '', // Will store as Date for the form
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

  // Fetch patient data
  useEffect(() => {
    axios
      .get(`https://fed-medical-clinic-api.vercel.app/patients/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // Set form values
        form.setValues({
          first_name: res.data.first_name,
          last_name: res.data.last_name,
          email: res.data.email,
          phone: res.data.phone,
          address: res.data.address,
          date_of_birth: new Date(res.data.date_of_birth * 1000), // Convert UNIX timestamp to Date
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching patient data:", err);
        setLoading(false);
      });
  }, [id, token]);

  // Handle form submission
  const handleSubmit = async () => {
    console.log("Debug: Appointment ID being sent in the URL:", id);
  
    const payload = {
      appointment_date: Math.floor(
        form.values.appointment_date.getTime() / 1000
      ), // Convert Date to UNIX timestamp
      doctor_id: parseInt(form.values.doctor_id, 10),
      patient_id: parseInt(form.values.patient_id, 10),
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
  
      if (err.response?.status === 404) {
        alert("The appointment you are trying to update does not exist.");
      } else if (err.response?.status === 422) {
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
    return <Loader />;
  }

  return (
    <div>
      <Text size={24} mb={5}>
        Edit Patient
      </Text>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          withAsterisk
          label={'First name'}
          name="first_name"
          {...form.getInputProps('first_name')}
        />
        <TextInput
          withAsterisk
          label="Last name"
          name="last_name"
          {...form.getInputProps('last_name')}
        />
        <TextInput
          label={'Email'}
          withAsterisk
          name="email"
          {...form.getInputProps('email')}
        />
        <TextInput
          label={'Phone'}
          name="phone"
          withAsterisk
          {...form.getInputProps('phone')}
        />
        <DateInput
          label="Date of Birth"
          name="date_of_birth"
          withAsterisk
          placeholder="Select a date"
          valueFormat="DD/MM/YYYY"
          {...form.getInputProps('date_of_birth')}
        />
        <Textarea
          label={'Address'}
          name="address"
          withAsterisk
          {...form.getInputProps('address')}
        />
        <Button mt={10} type={'submit'}>
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default Edit;
