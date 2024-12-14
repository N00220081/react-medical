import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from "../../utils/useAuth";
import { useForm } from '@mantine/form';
import {
  TextInput,
  Select,
  Text,
  Button,
  Paper,
  Loader,
  Group,
  Stack,
  Divider,
  Notification,
} from "@mantine/core";

const Edit = () => {
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
      specialisation: 'General Practitioner',
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
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : 'Invalid email',
      phone: (value) =>
        value.length === 10 ? null : 'Phone number must be 10 digits',
    },
  });

  useEffect(() => {
    axios
      .get(`https://fed-medical-clinic-api.vercel.app/doctors/${id}`, {
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
        setError("Error loading data. Please try again.");
        setLoading(false);
      });
  }, [id, token]);

  const handleSubmit = async () => {
    try {
      const res = await axios.patch(
        `https://fed-medical-clinic-api.vercel.app/doctors/${id}`,
        form.values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Doctor updated successfully:", res.data);
      navigate(`../../${res.data.id}`, { relative: 'path' });
    } catch (err) {
      console.error("Error updating doctor:", err);

      if (err.response?.status === 422) {
        let errors = err.response.data.error.issues;
        form.setErrors(
          Object.fromEntries(
            errors.map((error) => [error.path[0], error.message])
          )
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const specialisations = [
    'Podiatrist',
    'Dermatologist',
    'Pediatrician',
    'Psychiatrist',
    'General Practitioner',
  ];

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
        Edit Doctor
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
          <Select
            searchable
            withAsterisk
            label="Specialisation"
            placeholder="Select a specialisation"
            data={specialisations.map((specialisation) => ({
              value: specialisation,
              label: specialisation,
            }))}
            {...form.getInputProps('specialisation')}
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

          <Group position="right" mt="md">
            <Button type="submit">Save Changes</Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default Edit;
