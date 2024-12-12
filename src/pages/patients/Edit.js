import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../utils/useAuth";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Select,
  Text,
  Button,
  Loader,
  Textarea,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";

const Edit = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const form = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      address: "",
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
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      phone: (value) =>
        value.length === 10 ? null : "Phone number must be 10 digits",
      date_of_birth: (value) => {
        const isValidDate = dayjs(value, "DD/MM/YYYY", true).isValid();
        return isValidDate
          ? null
          : "Date of birth must be in dd/mm/yyyy format";
      },
      address: (value) =>
        value.length > 5 ? null : "Address must be at least 5 characters",
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
        form.setValues(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching patient data:", err);
        setLoading(false);
      });
  }, [id, token]);

  const handleSubmit = () => {
    axios
      .patch(
        `https://fed-medical-clinic-api.vercel.app/patients/${id}`,
        form.values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        console.log("Patient updated successfully:", res.data);
        navigate(`../../${res.data.id}`, { relative: "path" });
      })
      .catch((err) => {
        console.error("Error updating patient:", err);

        if (err.response?.status === 422) {
          let errors = err.response.data.error.issues;
          form.setErrors(
            Object.fromEntries(
              errors.map((error) => [error.path[0], error.message])
            )
          );
        } else {
          form.setErrors({
            general: "An unexpected error occurred. Please try again.",
          });
        }
      });
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
          label={"First name"}
          name="first_name"
          {...form.getInputProps("first_name")}
        />
        <TextInput
          withAsterisk
          label="Last name"
          name="last_name"
          {...form.getInputProps("last_name")}
        />
        <TextInput
          label={"Email"}
          withAsterisk
          name="email"
          {...form.getInputProps("email")}
        />
        <TextInput
          label={"Phone"}
          name="phone"
          withAsterisk
          {...form.getInputProps("phone")}
        />
        <DateInput
          label="Date of Birth"
          name="date_of_birth"
          withAsterisk
          placeholder="Select a date"
          value={form.values.date_of_birth}
          onChange={(date) => form.setFieldValue("date_of_birth", date)}
          valueFormat="DD/MM/YYYY" // Format for display
        />
        <Textarea
          label={"Address"}
          name="address"
          withAsterisk
          {...form.getInputProps("address")}
        />

        <Button mt={10} type={"submit"}>
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default Edit;
