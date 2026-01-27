import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Stack,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
} from "@mui/material";
import dayjs from "dayjs";
import {
    logout,
    adminGetStats,
    adminListEvents,
    adminListHosts,
    adminListRegistrations,
    adminDeleteEvent,
} from "../api";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(() => {
        try {
            const raw = localStorage.getItem("authUser");
            const user = raw ? JSON.parse(raw) : null;
            if (!user || user.role !== "admin") {
                setTimeout(() => navigate("/admin/login"), 0);
                return null;
            }
            return user;
        } catch {
            setTimeout(() => navigate("/admin/login"), 0);
            return null;
        }
    });

    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);
    const [hosts, setHosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [registrationsOpen, setRegistrationsOpen] = useState(false);
    const [registrations, setRegistrations] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [regLoading, setRegLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

    useEffect(() => {
        if (!auth) return;
        loadData();
    }, [auth]);

    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const [statsData, eventsData, hostsData] = await Promise.all([
                adminGetStats(),
                adminListEvents({ pageSize: 100 }),
                adminListHosts({ pageSize: 100 }),
            ]);
            setStats(statsData);
            setEvents(eventsData.items || []);
            setHosts(hostsData.items || []);
        } catch (err) {
            setError(err.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        setAuth(null);
        navigate("/admin/login");
    };

    const viewRegistrations = async (event) => {
        setSelectedEvent(event);
        setRegistrationsOpen(true);
        setRegLoading(true);
        try {
            const data = await adminListRegistrations(event._id);
            setRegistrations(data.items || []);
        } catch (err) {
            console.error(err);
            setRegistrations([]);
        } finally {
            setRegLoading(false);
        }
    };

    const confirmDelete = (event) => {
        setEventToDelete(event);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!eventToDelete) return;
        try {
            await adminDeleteEvent(eventToDelete._id);
            setEvents((prev) =>
                prev.filter((e) => e._id !== eventToDelete._id),
            );
            setDeleteDialogOpen(false);
            setEventToDelete(null);
            // Reload stats to update counts
            const statsData = await adminGetStats();
            setStats(statsData);
        } catch (err) {
            setError(err.message || "Failed to delete event");
        }
    };

    if (!auth) {
        return (
            <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
                <Typography>Redirecting to admin login...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 6 }}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 4 }}
            >
                <Typography variant="h3" fontWeight={700}>
                    Super Admin Dashboard
                </Typography>
                <Button variant="outlined" onClick={handleLogout}>
                    Sign Out
                </Button>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card>
                            <CardContent>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    Total Events
                                </Typography>
                                <Typography variant="h4" fontWeight={700}>
                                    {stats.totalEvents}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card>
                            <CardContent>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    Published
                                </Typography>
                                <Typography variant="h4" fontWeight={700}>
                                    {stats.publishedEvents}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card>
                            <CardContent>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    Total Hosts
                                </Typography>
                                <Typography variant="h4" fontWeight={700}>
                                    {stats.totalHosts}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card>
                            <CardContent>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    Volunteers
                                </Typography>
                                <Typography variant="h4" fontWeight={700}>
                                    {stats.totalVolunteers}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <Card>
                            <CardContent>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    Registrations
                                </Typography>
                                <Typography variant="h4" fontWeight={700}>
                                    {stats.totalRegistrations}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Hosts Table */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                        All Hosts ({hosts.length})
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Events</TableCell>
                                    <TableCell>Joined</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && hosts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No hosts found
                                        </TableCell>
                                    </TableRow>
                                )}
                                {hosts.map((host) => (
                                    <TableRow key={host._id}>
                                        <TableCell>{host.name}</TableCell>
                                        <TableCell>{host.email}</TableCell>
                                        <TableCell>
                                            {host.eventCount || 0}
                                        </TableCell>
                                        <TableCell>
                                            {dayjs(host.createdAt).format(
                                                "MMM D, YYYY",
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Events Table */}
            <Card>
                <CardContent>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                        All Events ({events.length})
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Host</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Tag</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Registrations</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && events.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            No events found
                                        </TableCell>
                                    </TableRow>
                                )}
                                {events.map((event) => (
                                    <TableRow key={event._id}>
                                        <TableCell>{event.title}</TableCell>
                                        <TableCell>
                                            {event.host?.name || "Unknown"}
                                            <br />
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {event.host?.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {dayjs(event.date).format(
                                                "MMM D, YYYY",
                                            )}
                                        </TableCell>
                                        <TableCell>{event.location}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={event.tag}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={event.status}
                                                size="small"
                                                color={
                                                    event.status === "published"
                                                        ? "success"
                                                        : "default"
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {event.registrationsCount || 0}
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    size="small"
                                                    onClick={() =>
                                                        viewRegistrations(event)
                                                    }
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() =>
                                                        confirmDelete(event)
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="xs"
            >
                <DialogTitle>Delete Event?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{eventToDelete?.title}
                        "? This will also delete all{" "}
                        {eventToDelete?.registrationsCount || 0} registrations.
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleDelete}
                    >
                        Delete Event
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Registrations Dialog */}
            <Dialog
                open={registrationsOpen}
                onClose={() => setRegistrationsOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Registrations for: {selectedEvent?.title}
                </DialogTitle>
                <DialogContent dividers>
                    {regLoading && <Typography>Loading...</Typography>}
                    {!regLoading && registrations.length === 0 && (
                        <Typography color="text.secondary">
                            No registrations yet
                        </Typography>
                    )}
                    {!regLoading && registrations.length > 0 && (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Attendees</TableCell>
                                        <TableCell>Registered</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {registrations.map((reg) => (
                                        <TableRow key={reg._id}>
                                            <TableCell>{reg.name}</TableCell>
                                            <TableCell>{reg.email}</TableCell>
                                            <TableCell>
                                                {reg.attendees}
                                            </TableCell>
                                            <TableCell>
                                                {dayjs(reg.createdAt).format(
                                                    "MMM D, YYYY h:mm A",
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRegistrationsOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminDashboard;
