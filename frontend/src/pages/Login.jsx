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
} from "@mui/material";
import { login } from "../api";

const Login = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const data = await login(form.email, form.password);
            if (data?.user?.role === "host") {
                navigate("/host");
            } else {
                setError("Only hosts can access the dashboard");
                localStorage.removeItem("authToken");
                localStorage.removeItem("authUser");
            }
        } catch (err) {
            setError(err.message || "Login failed");
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
                        Host Login
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ mb: 4 }}
                    >
                        Sign in to manage your events
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={3}>
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
                                value={form.password}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        password: e.target.value,
                                    }))
                                }
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </Button>
                        </Stack>
                    </Box>

                    <Box sx={{ mt: 3, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account?{" "}
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate("/signup")}
                                sx={{ cursor: "pointer" }}
                            >
                                Sign up
                            </Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Login;
