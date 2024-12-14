import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Select,
  Text,
  Button,
  Paper,
  Group,
  Stack,
  Divider,
  Notification,
} from "@mantine/core";
import { useState } from "react";

const Create = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const form = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      specialisation: "General Practitioner",
    },
    validate: {
      first_name: (value) =>
        value.length > 2 && value.length < 255
          ? null
          : "First name must be between 2 and 255 characters",
      last_name: (value) =>
        value.length > 2 && value.length < 255
          ? null
          : "Last name must be between 2 and 255 characters",
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid email", // Regex for email validation
      phone: (value) =>
        value.length === 10 ? null : "Phone number must be 10 digits",
    },
  });

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `https://fed-medical-clinic-api.vercel.app/doctors`,
        form.values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate(`../${res.data.id}`, { relative: "path" });
    } catch (err) {
      console.error(err);

      if (err.response?.status === 422) {
        const errors = err.response.data.error.issues;
        form.setErrors(
          Object.fromEntries(errors.map((error) => [error.path[0], error.message]))
        );
      }

      if (err.response?.data.message === "SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: doctors.email") {
        form.setFieldError("email", "Email must be unique.");
      }

      if (err.response?.data.message === "SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: doctors.phone") {
        form.setFieldError("phone", "Phone number must be unique.");
      }

      setError("An unexpected error occurred. Please try again.");
    }
  };

  const specialisations = [
    "Podiatrist",
    "Dermatologist",
    "Pediatrician",
    "Psychiatrist",
    "General Practitioner",
  ];

  return (
    <Paper
      shadow="md"
      radius="md"
      p="xl"
      style={{ maxWidth: 600, margin: "auto", marginTop: 40 }}
    >
      <Text size="xl" weight={700} mb="sm">
        Create a Doctor
      </Text>
      <Divider my="sm" />

      {error && (
        <Notification color="red" title="Error" onClose={() => setError("")}>
          {error}
        </Notification>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <TextInput
            withAsterisk
            label="First Name"
            placeholder="Enter first name"
            {...form.getInputProps("first_name")}
          />
          <TextInput
            withAsterisk
            label="Last Name"
            placeholder="Enter last name"
            {...form.getInputProps("last_name")}
          />
          <Select
            withAsterisk
            label="Specialisation"
            placeholder="Select a specialisation"
            data={specialisations.map((specialisation) => ({
              value: specialisation,
              label: specialisation,
            }))}
            {...form.getInputProps("specialisation")}
          />
          <TextInput
            withAsterisk
            label="Email"
            placeholder="Enter email address"
            {...form.getInputProps("email")}
          />
          <TextInput
            withAsterisk
            label="Phone"
            placeholder="Enter phone number"
            {...form.getInputProps("phone")}
          />

          <Group position="right" mt="md">
            <Button type="submit">Submit</Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default Create;
