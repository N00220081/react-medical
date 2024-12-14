import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Text,
  Button,
  Textarea,
  Paper,
  Group,
  Stack,
  Divider,
  Notification,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
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
      address: "",
      date_of_birth: "",
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
        /^\S+@\S+$/.test(value) ? null : "Invalid email",
      phone: (value) =>
        value.length === 10 ? null : "Phone number must be 10 digits",
      address: (value) =>
        value.length > 5 ? null : "Address must be at least 5 characters",
      date_of_birth: (value) =>
        value instanceof Date ? null : "Invalid date",
    },
  });

  const handleSubmit = async () => {
    try {
      const payload = {
        first_name: form.values.first_name,
        last_name: form.values.last_name,
        email: form.values.email,
        phone: form.values.phone,
        address: form.values.address,
        date_of_birth: form.values.date_of_birth.toISOString().split("T")[0],
      };

      const res = await axios.post(
        `https://fed-medical-clinic-api.vercel.app/patients`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate(`../${res.data.id}`, { relative: "path" });
    } catch (err) {
      console.error("Error creating patient:", err);

      if (err.response?.status === 422) {
        const errors = err.response.data.error.issues || [];
        form.setErrors(
          Object.fromEntries(errors.map((error) => [error.path[0], error.message]))
        );
      }

      if (
        err.response?.data.message ===
        "SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: patients.email"
      ) {
        form.setFieldError("email", "Email must be unique.");
      }

      if (
        err.response?.data.message ===
        "SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: patients.phone"
      ) {
        form.setFieldError("phone", "Phone number must be unique.");
      }

      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Paper
      shadow="md"
      radius="md"
      p="xl"
      style={{ maxWidth: 600, margin: "auto", marginTop: 40 }}
    >
      <Text size="xl" weight={700} mb="sm">
        Create a Patient
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
          <DateInput
            withAsterisk
            label="Date of Birth"
            placeholder="Select a date"
            valueFormat="YYYY-MM-DD"
            {...form.getInputProps("date_of_birth")}
          />
          <Textarea
            withAsterisk
            label="Address"
            placeholder="Enter address"
            {...form.getInputProps("address")}
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
