import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';
import { Navbar as MantineNavbar, Button, Stack, Group, Title, Divider } from '@mantine/core';
import { IconHome, IconUserPlus, IconLogin, IconLogout } from '@tabler/icons-react';

const Navbar = () => {
    const { logout, token } = useAuth();
    const navigate = useNavigate();

    return (
        <MantineNavbar width={{ base: 300 }} height="100vh" p="md" style={{ backgroundColor: '#f8f9fa' }}>
            <Stack spacing="md">
                {/* Header Section */}
                <Group position="apart">
                    <Title order={3} style={{ color: '#1c7ed6' }}>Clinic Navigation</Title>
                </Group>
                <Divider />

                {/* Navigation Buttons */}
                <Button
                    component={Link}
                    to="/"
                    leftIcon={<IconHome size={18} />}
                    variant="subtle"
                    fullWidth
                >
                    Home
                </Button>

                {!token && (
                    <>
                        <Button
                            component={Link}
                            to="/register"
                            leftIcon={<IconUserPlus size={18} />}
                            variant="subtle"
                            fullWidth
                        >
                            Register
                        </Button>

                        <Button
                            component={Link}
                            to="/login"
                            leftIcon={<IconLogin size={18} />}
                            variant="subtle"
                            fullWidth
                        >
                            Login
                        </Button>
                    </>
                )}

                {/* Logout Button */}
                {token && (
                    <Button
                        color="red"
                        variant="filled"
                        leftIcon={<IconLogout size={18} />}
                        onClick={() => {
                            logout();
                            navigate('/login', { replace: true });
                        }}
                        fullWidth
                    >
                        Logout
                    </Button>
                )}
            </Stack>
        </MantineNavbar>
    );
};

export default Navbar;
