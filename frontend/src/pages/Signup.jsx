import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Stack,
    TextField,
    Typography,
    Alert,
    Link,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { signup } from "../api";

const Signup = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "host",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const data = await signup(form);
            if (data?.user?.role === "host") {
                navigate("/host");
            } else {
                setError("Only hosts can access the dashboard");
                localStorage.removeItem("authToken");
                localStorage.removeItem("authUser");
            }
        } catch (err) {
            setError(err.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Card sx={{ boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                        align="center"
                        gutterBottom
                    >
                        Host Signup
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ mb: 4 }}
                    >
                        Create an account to start hosting events
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            <TextField
                                label="Full Name"
                                required
                                fullWidth
                                value={form.name}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        name: e.target.value,
                                    }))
                                }
                            />
                            <TextField
                                label="Email"
                                type="email"
                                required
                                fullWidth
                                value={form.email}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        email: e.target.value,
                                    }))
                                }
                            />
                            <TextField
                                label="Password"
                                type="password"
                                required
                                fullWidth
                                inputProps={{ minLength: 8 }}
                                helperText="Minimum 8 characters"
                                value={form.password}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        password: e.target.value,
                                    }))
                                }
                            />
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={form.role}
                                    label="Role"
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            role: e.target.value,
                                        }))
                                    }
                                >
                                    <MenuItem value="host">Host</MenuItem>
                                    <MenuItem value="volunteer">
                                        Volunteer
                                    </MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                            >
                                {loading ? "Creating account..." : "Sign Up"}
                            </Button>
                        </Stack>
                    </Box>

                    <Box sx={{ mt: 3, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?{" "}
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate("/login")}
                                sx={{ cursor: "pointer" }}
                            >
                                Sign in
                            </Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Signup;
