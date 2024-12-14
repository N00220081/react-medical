import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import {
  Text,
  Title,
  Button,
  Stack,
  Group,
  Loader,
  Container,
  Divider,
} from "@mantine/core";

const SinglePatient = () => {
  const { token } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();

  useEffect(() => {
    axios
      .get(`https://fed-medical-clinic-api.vercel.app/patients/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setPatient(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching patient data:", err);
        setLoading(false);
      });
  }, [id, token]);

  if (loading) {
    return (
      <Group position="center" style={{ marginTop: "2rem" }}>
        <Loader size="lg" />
      </Group>
    );
  }

  if (!patient) {
    return (
      <Text color="red" align="center" style={{ marginTop: "2rem" }}>
        Unable to load patient data. Please try again later.
      </Text>
    );
  }

  return (
    <Container size="md" style={{ marginTop: 40 }}>
      <Group position="apart" align="center" mb="md">
        <Title order={1}>
          {patient.first_name} {patient.last_name}
        </Title>
        <Button component={Link} to={`/patients/${id}/edit`} variant="outline">
          Edit Patient
        </Button>
      </Group>

      <Divider my="md" />

      <Stack spacing="md">
        <Text>
          <strong>Email:</strong> {patient.email}
        </Text>
        <Text>
          <strong>Phone Number:</strong> {patient.phone}
        </Text>
        <Text>
          <strong>Date of Birth:</strong> {new Date(patient.date_of_birth).toLocaleDateString()}
        </Text>
        <Text>
          <strong>Address:</strong> {patient.address}
        </Text>
      </Stack>
    </Container>
  );
};

export default SinglePatient;
