import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";
import {
  Text,
  Title,
  Button,
  Group,
  Loader,
  Stack,
  Container,
  Divider,
} from "@mantine/core";

const SingleDoctor = () => {
  const { token } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    axios
      .get(`https://fed-medical-clinic-api.vercel.app/doctors/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setDoctor(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching doctor data:", err);
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

  if (!doctor) {
    return (
      <Text color="red" align="center" style={{ marginTop: "2rem" }}>
        Unable to load doctor data. Please try again later.
      </Text>
    );
  }

  return (
    <Container size="md" style={{ marginTop: 40 }}>
      <Group position="apart" align="center" mb="md">
        <Title order={1}>
          Dr. {doctor.first_name} {doctor.last_name}
        </Title>
        <Button component={Link} to={`/doctors/${id}/edit`} variant="outline">
          Edit Doctor
        </Button>
      </Group>

      <Divider my="md" />

      <Stack spacing="md">
        <Text>
          <strong>Specialisation:</strong> {doctor.specialisation}
        </Text>
        <Text>
          <strong>Email:</strong> {doctor.email}
        </Text>
        <Text>
          <strong>Mobile Number:</strong> {doctor.phone}
        </Text>
      </Stack>
    </Container>
  );
};

export default SingleDoctor;
