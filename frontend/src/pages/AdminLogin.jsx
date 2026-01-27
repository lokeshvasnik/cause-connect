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
} from "@mui/material";
import { login } from "../api";

const AdminLogin = () => {
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
            if (data?.user?.role === "admin") {
                navigate("/admin");
            } else {
                setError("Unauthorized: Admin access only");
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
                        Admin Login
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ mb: 4 }}
                    >
                        Super Admin Access Only
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            <TextField
                                label="Admin Email"
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
                                {loading ? "Signing in..." : "Sign In as Admin"}
                            </Button>
                        </Stack>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default AdminLogin;
