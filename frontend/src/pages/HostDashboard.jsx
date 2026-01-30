import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Stack,
    TextField,
    Typography,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import {
    logout,
    hostListEvents,
    hostCreateEvent,
    hostDeleteEvent,
    hostListRegistrations,
} from "../api";

const HostDashboard = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [auth, setAuth] = useState(() => {
        try {
            const raw = localStorage.getItem("authUser");
            const user = raw ? JSON.parse(raw) : null;
            // Redirect to login if not authenticated or not a host
            if (!user || user.role !== "host") {
                setTimeout(() => navigate("/login"), 0);
                return null;
            }
            return user;
        } catch {
            setTimeout(() => navigate("/login"), 0);
            return null;
        }
    });
    const [form, setForm] = useState({
        title: "",
        date: null,
        startTime: null,
        endTime: null,
        tag: "",
        location: "",
        description: "",
        image: "",
    });
    const [snack, setSnack] = useState({
        open: false,
        msg: "",
        severity: "info",
    });
    const [membersOpen, setMembersOpen] = useState(false);
    const [membersLoading, setMembersLoading] = useState(false);
    const [membersError, setMembersError] = useState("");
    const [members, setMembers] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const totalRegistrations = useMemo(
        () => events.reduce((sum, e) => sum + (e.registrationsCount || 0), 0),
        [events],
    );

    useEffect(() => {
        let mounted = true;
        async function load() {
            if (!auth) return;
            setLoading(true);
            setError("");
            try {
                const res = await hostListEvents();
                const normalized = (res.items || []).map((e) => ({
                    id: e._id || e.id,
                    title: e.title,
                    date: e.date,
                    startTime: e.startTime,
                    endTime: e.endTime,
                    tag: e.tag,
                    location: e.location,
                    description: e.description,
                    image: e.image,
                    registrationsCount:
                        typeof e.registrationsCount === "number"
                            ? e.registrationsCount
                            : 0,
                }));
                if (mounted) setEvents(normalized);
            } catch (err) {
                if (mounted) setError(err.message || "Failed to load events");
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => {
            mounted = false;
        };
    }, [auth]);

    const isValid = useMemo(() => {
        const basic =
            form.title.trim() &&
            !!form.date &&
            !!form.startTime &&
            !!form.endTime &&
            form.tag.trim() &&
            form.location.trim() &&
            form.description.trim();
        if (!basic) return false;
        // Ensure end after start (same day)
        try {
            const d = form.date;
            const st = d
                .hour(form.startTime.hour())
                .minute(form.startTime.minute())
                .second(0)
                .millisecond(0);
            const et = d
                .hour(form.endTime.hour())
                .minute(form.endTime.minute())
                .second(0)
                .millisecond(0);
            return et.isAfter(st);
        } catch {
            return false;
        }
    }, [form]);

    const doLogout = () => {
        logout();
        setAuth(null);
        setEvents([]);
        navigate("/login");
        setSnack({ open: true, msg: "Signed out", severity: "info" });
    };

    const addEvent = async (e) => {
        e.preventDefault();
        if (!isValid || !auth) return;
        try {
            // Combine date with start/end times
            const date = form.date;
            const startDt = date
                .hour(form.startTime.hour())
                .minute(form.startTime.minute())
                .second(0)
                .millisecond(0);
            const endDt = date
                .hour(form.endTime.hour())
                .minute(form.endTime.minute())
                .second(0)
                .millisecond(0);

            if (!endDt.isAfter(startDt)) {
                setSnack({
                    open: true,
                    msg: "End time must be after start time",
                    severity: "error",
                });
                return;
            }

            const payload = {
                title: form.title,
                date: form.date?.toDate().toISOString(),
                startTime: startDt.toDate().toISOString(),
                endTime: endDt.toDate().toISOString(),
                tag: form.tag,
                location: form.location,
                description: form.description,
                image: form.image || undefined,
                status: "published",
            };
            const created = await hostCreateEvent(payload);
            const evt = {
                id: created._id || created.id,
                title: created.title,
                date: created.date,
                tag: created.tag,
                location: created.location,
                description: created.description,
                image: created.image,
            };
            setEvents((prev) => [evt, ...prev]);
            setForm({
                title: "",
                date: null,
                startTime: null,
                endTime: null,
                tag: "",
                location: "",
                description: "",
                image: "",
            });
            setSnack({ open: true, msg: "Event created", severity: "success" });
        } catch (err) {
            setSnack({
                open: true,
                msg: err.message || "Failed to create event",
                severity: "error",
            });
        }
    };

    const deleteEvent = async (id) => {
        if (!auth) return;
        try {
            await hostDeleteEvent(id);
            setEvents((prev) => prev.filter((e) => e.id !== id));
            setSnack({ open: true, msg: "Event deleted", severity: "success" });
        } catch (err) {
            setSnack({
                open: true,
                msg: err.message || "Failed to delete event",
                severity: "error",
            });
        }
    };

    const viewMembers = async (evt) => {
        if (!auth) return;
        setSelectedEvent(evt);
        setMembersOpen(true);
        setMembersError("");
        setMembers([]);
        setMembersLoading(true);
        try {
            const res = await hostListRegistrations(evt.id, {
                page: 1,
                pageSize: 50,
            });
            const rows = (res.items || []).map((r) => ({
                id: r._id || r.id,
                name: r.name,
                email: r.email,
                phone: r.phone,
                attendees: r.attendees,
                notes: r.notes,
                createdAt: r.createdAt,
            }));
            setMembers(rows);
        } catch (err) {
            setMembersError(err.message || "Failed to load registrations");
        } finally {
            setMembersLoading(false);
        }
    };

    const handleEnterFocusNext = (e) => {
        if (e.key !== "Enter") return;
        const formEl = e.currentTarget;
        const fields = Array.from(
            formEl.querySelectorAll("input, textarea, select"),
        ).filter(
            (el) => !el.disabled && el.tabIndex !== -1 && el.type !== "hidden",
        );
        const idx = fields.indexOf(e.target);
        if (idx >= 0) {
            // find next focusable field
            for (let i = idx + 1; i < fields.length; i++) {
                const next = fields[i];
                if (next) {
                    e.preventDefault();
                    next.focus();
                    break;
                }
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 3 }}
            >
                <Typography variant="h3" fontWeight={700}>
                    Host Dashboard
                </Typography>
                {auth && (
                    <Button variant="outlined" onClick={doLogout}>
                        Sign Out
                    </Button>
                )}
            </Stack>

            {!auth && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                        Redirecting to login...
                    </Typography>
                </Box>
            )}

            {auth && (
                <>
                    <Typography color="text.secondary" sx={{ mb: 4 }}>
                        Add and manage your events below.
                    </Typography>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Card sx={{ mb: 4 }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{ mb: 2 }}
                                >
                                    Add New Event
                                </Typography>
                                <Stack
                                    component="form"
                                    onSubmit={addEvent}
                                    onKeyDown={handleEnterFocusNext}
                                    spacing={2}
                                    sx={{ maxWidth: 720 }}
                                >
                                    <TextField
                                        label="Title"
                                        value={form.title}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                title: e.target.value,
                                            }))
                                        }
                                        required
                                        fullWidth
                                    />
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={4}>
                                            <TimePicker
                                                label="Start Time"
                                                value={form.startTime}
                                                onChange={(newValue) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        startTime: newValue,
                                                    }))
                                                }
                                                slotProps={{
                                                    textField: {
                                                        required: true,
                                                        fullWidth: true,
                                                    },
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <TimePicker
                                                label="End Time"
                                                value={form.endTime}
                                                onChange={(newValue) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        endTime: newValue,
                                                    }))
                                                }
                                                slotProps={{
                                                    textField: {
                                                        required: true,
                                                        fullWidth: true,
                                                    },
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={4}>
                                            <DatePicker
                                                label="Date"
                                                value={form.date}
                                                onChange={(newValue) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        date: newValue,
                                                    }))
                                                }
                                                slotProps={{
                                                    textField: {
                                                        required: true,
                                                        fullWidth: true,
                                                    },
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Tag"
                                                placeholder="Environment, Community, Health"
                                                value={form.tag}
                                                onChange={(e) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        tag: e.target.value,
                                                    }))
                                                }
                                                required
                                                fullWidth
                                            />
                                        </Grid>
                                    </Grid>
                                    <TextField
                                        label="Location"
                                        placeholder="@Downtown Park"
                                        value={form.location}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                location: e.target.value,
                                            }))
                                        }
                                        required
                                        fullWidth
                                    />
                                    <TextField
                                        label="Image URL"
                                        placeholder="https://…"
                                        value={form.image}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                image: e.target.value,
                                            }))
                                        }
                                        fullWidth
                                    />
                                    <TextField
                                        label="Description"
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                description: e.target.value,
                                            }))
                                        }
                                        multiline
                                        minRows={3}
                                        required
                                        fullWidth
                                    />
                                    <Box>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={!isValid || !auth}
                                        >
                                            Add Event
                                        </Button>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </LocalizationProvider>

                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                        Your Events
                    </Typography>
                    {/* <Typography color="text.secondary" sx={{ mb: 2 }}>
                Registrations across your events: {totalRegistrations}
            </Typography> */}
                    <Grid container spacing={3}>
                        {loading && (
                            <Grid item xs={12}>
                                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                    <CircularProgress color="primary" />
                                </Box>
                            </Grid>
                        )}
                        {!!error && (
                            <Grid item xs={12}>
                                <Typography color="error.main">
                                    {error}
                                </Typography>
                            </Grid>
                        )}
                        {!loading && events.length === 0 && (
                            <Grid item xs={12}>
                                <Typography color="text.secondary">
                                    {auth
                                        ? "No events yet."
                                        : "Sign in to see your events."}
                                </Typography>
                            </Grid>
                        )}
                        {events.map((event) => (
                            <Grid item xs={12} md={4} key={event.id}>
                                <Card
                                    sx={{
                                        border: "1px solid",
                                        borderColor: "divider",
                                    }}
                                >
                                    <CardContent>
                                        <Stack spacing={1}>
                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                            >
                                                {event.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {event.date
                                                    ? dayjs(event.date).format(
                                                          "MMM D, YYYY",
                                                      )
                                                    : ""}
                                                {event.startTime &&
                                                    event.endTime &&
                                                    `, ${dayjs(
                                                        event.startTime,
                                                    ).format(
                                                        "h:mm A",
                                                    )} to ${dayjs(
                                                        event.endTime,
                                                    ).format("h:mm A")}`}{" "}
                                                · {event.tag} · {event.location}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {event.description}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "flex-end",
                                                }}
                                            >
                                                <Button
                                                    onClick={() =>
                                                        viewMembers(event)
                                                    }
                                                    disabled={!auth}
                                                    sx={{ mr: 1 }}
                                                >
                                                    View Members
                                                </Button>
                                                <Button
                                                    color="error"
                                                    onClick={() =>
                                                        deleteEvent(event.id)
                                                    }
                                                    disabled={!auth}
                                                >
                                                    Delete
                                                </Button>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Dialog
                        open={membersOpen}
                        onClose={() => setMembersOpen(false)}
                        maxWidth="md"
                        fullWidth
                    >
                        <DialogTitle>
                            {selectedEvent
                                ? `Members for: ${selectedEvent.title}`
                                : "Members"}
                        </DialogTitle>
                        <DialogContent dividers>
                            {membersLoading && (
                                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                                    <CircularProgress color="primary" />
                                </Box>
                            )}
                            {!!membersError && (
                                <Typography color="error.main">
                                    {membersError}
                                </Typography>
                            )}
                            {!membersLoading &&
                                !membersError &&
                                members.length === 0 && (
                                    <Typography color="text.secondary">
                                        No registrations yet.
                                    </Typography>
                                )}
                            {!membersLoading &&
                                !membersError &&
                                members.length > 0 && (
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Phone</TableCell>
                                                <TableCell>Attendees</TableCell>
                                                <TableCell>Notes</TableCell>
                                                <TableCell>
                                                    Registered At
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {members.map((m) => (
                                                <TableRow key={m.id}>
                                                    <TableCell>
                                                        {m.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {m.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {m.phone}
                                                    </TableCell>
                                                    <TableCell>
                                                        {m.attendees}
                                                    </TableCell>
                                                    <TableCell>
                                                        {m.notes}
                                                    </TableCell>
                                                    <TableCell>
                                                        {m.createdAt
                                                            ? dayjs(
                                                                  m.createdAt,
                                                              ).format(
                                                                  "MMM D, YYYY h:mm A",
                                                              )
                                                            : ""}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setMembersOpen(false)}>
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Snackbar
                        open={snack.open}
                        autoHideDuration={3000}
                        onClose={() => setSnack((s) => ({ ...s, open: false }))}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                        }}
                    >
                        <Alert
                            onClose={() =>
                                setSnack((s) => ({ ...s, open: false }))
                            }
                            severity={snack.severity}
                            variant="filled"
                            sx={{ width: "100%" }}
                        >
                            {snack.msg}
                        </Alert>
                    </Snackbar>
                </>
            )}
        </Container>
    );
};

export default HostDashboard;
