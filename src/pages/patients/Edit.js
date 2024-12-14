import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from "../../utils/useAuth";
import { useForm } from '@mantine/form';
import {
  TextInput,
  Textarea,
  Text,
  Button,
  Paper,
  Loader,
  Group,
  Stack,
  Divider,
  Notification,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";

const EditPatient = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const form = useForm({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      date_of_birth: '', // Date for the form
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

  useEffect(() => {
    axios
      .get(`https://fed-medical-clinic-api.vercel.app/patients/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        form.setValues({
          first_name: res.data.first_name,
          last_name: res.data.last_name,
          email: res.data.email,
          phone: res.data.phone,
          address: res.data.address,
          date_of_birth: new Date(res.data.date_of_birth), // Convert to Date
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching patient data:", err);
        setError("Error loading data. Please try again.");
        setLoading(false);
      });
  }, [id, token]);

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form.values,
        date_of_birth: form.values.date_of_birth.toISOString().split("T")[0], // Format date for the backend
      };

      const res = await axios.patch(
        `https://fed-medical-clinic-api.vercel.app/patients/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate(`/patients/${res.data.id}`);
    } catch (err) {
      console.error("Error updating patient:", err);

      if (err.response?.status === 422) {
        const errors = err.response.data.error.issues || [];
        form.setErrors(
          Object.fromEntries(errors.map((error) => [error.path[0], error.message]))
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <Group position="center" style={{ marginTop: "2rem" }}>
        <Loader size="lg" />
      </Group>
    );
  }

  return (
    <Paper
      shadow="md"
      radius="md"
      p="xl"
      style={{ maxWidth: 600, margin: "auto", marginTop: 40 }}
    >
      <Text size="xl" weight={700} mb="sm">
        Edit Patient
      </Text>
      <Divider my="sm" />

      {error && (
        <Notification
          color="red"
          title="Error"
          onClose={() => setError("")}
        >
          {error}
        </Notification>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <TextInput
            withAsterisk
            label="First Name"
            placeholder="Enter first name"
            {...form.getInputProps('first_name')}
          />
          <TextInput
            withAsterisk
            label="Last Name"
            placeholder="Enter last name"
            {...form.getInputProps('last_name')}
          />
          <TextInput
            withAsterisk
            label="Email"
            placeholder="Enter email address"
            {...form.getInputProps('email')}
          />
          <TextInput
            withAsterisk
            label="Phone"
            placeholder="Enter phone number"
            {...form.getInputProps('phone')}
          />
          <DateInput
            withAsterisk
            label="Date of Birth"
            placeholder="Select a date"
            valueFormat="YYYY-MM-DD"
            {...form.getInputProps('date_of_birth')}
          />
          <Textarea
            withAsterisk
            label="Address"
            placeholder="Enter address"
            {...form.getInputProps('address')}
          />

          <Group position="right" mt="md">
            <Button type="submit">Save Changes</Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default EditPatient;
