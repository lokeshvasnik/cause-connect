import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Stack,
    TextField,
    Typography,
    Snackbar,
    Alert,
    CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import { getEvents, registerForEvent } from "../api";

const EventsListing = ({ filterTerm = "", filterLocation = "" }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        attendees: "1",
        notes: "",
    });
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [snack, setSnack] = useState({
        open: false,
        msg: "",
        severity: "info",
    });
    const [clamped, setClamped] = useState({});

    const term = useMemo(() => filterTerm.trim(), [filterTerm]);
    const location = useMemo(
        () => (filterLocation || "").trim(),
        [filterLocation],
    );

    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            setError("");
            try {
                const res = await getEvents({ term, location });
                // Normalize ids and dates
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
                }));
                if (mounted) setItems(normalized);
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
    }, [term, location]);

    const openDetails = (evt) => {
        setSelected(evt);
        setIsRegistering(false);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setTimeout(() => {
            setSelected(null);
            setIsRegistering(false);
            setForm({
                name: "",
                email: "",
                phone: "",
                attendees: "1",
                notes: "",
            });
        }, 200);
    };

    const isValidIndianPhone = (p) =>
        /^(?:\+91|0)?[6-9]\d{9}$/.test((p || "").trim());

    const submitRegistration = async (e) => {
        e.preventDefault();
        if (!selected?.id) return;
        if (!isValidIndianPhone(form.phone)) {
            setSnack({
                open: true,
                msg: "Please enter a valid Indian phone number",
                severity: "error",
            });
            return;
        }
        try {
            await registerForEvent(selected.id, {
                name: form.name,
                email: form.email,
                phone: form.phone.trim(),
                attendees: Number(form.attendees || 1),
                notes: form.notes,
            });
            closeDialog();
            setSnack({
                open: true,
                msg: "Registered successfully — check your email for confirmation",
                severity: "success",
            });
        } catch (err) {
            setSnack({
                open: true,
                msg: err.message || "Failed to register",
                severity: "error",
            });
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Typography variant="h3" fontWeight={700} sx={{ mb: 4 }}>
                Upcoming Events
            </Typography>

            <Grid container spacing={3}>
                {loading && (
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                py: 4,
                            }}
                        >
                            <CircularProgress color="primary" />
                        </Box>
                    </Grid>
                )}
                {!!error && (
                    <Grid item xs={12}>
                        <Typography color="error.main">{error}</Typography>
                    </Grid>
                )}
                {!loading && !error && items.length === 0 && (
                    <Grid item xs={12}>
                        <Typography color="text.secondary">
                            No events found.
                        </Typography>
                    </Grid>
                )}
                {items.map((event, index) => (
                    <Grid
                        item
                        xs={12}
                        md={4}
                        key={index}
                        onClick={() => openDetails(event)}
                        sx={{ cursor: "pointer" }}
                    >
                        <Card
                            sx={{
                                borderRadius: 2,
                                boxShadow: "none",
                                border: "1px solid",
                                borderColor: "divider",
                                position: "relative",
                                height: "100%",
                                maxWidth: "360px",
                            }}
                        >
                            {/* Date Chip Overlay */}
                            <Chip
                                label={
                                    event.date
                                        ? dayjs(event.date).format(
                                              "MMM D, YYYY",
                                          )
                                        : ""
                                }
                                sx={{
                                    position: "absolute",
                                    top: 16,
                                    left: 16,
                                    bgcolor: (theme) =>
                                        alpha(theme.palette.common.white, 0.9),
                                    fontWeight: 500,
                                    borderRadius: "4px",
                                    color: "primary.main",
                                }}
                            />

                            <CardMedia
                                component="img"
                                height="220"
                                image={
                                    event.image ||
                                    "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1400&q=80"
                                }
                                alt={event.title}
                            />

                            <CardContent sx={{ px: 3, pt: 2, pb: 3 }}>
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                    sx={{ mb: 1 }}
                                >
                                    <Chip
                                        label={event.tag}
                                        size="small"
                                        sx={{
                                            bgcolor: (theme) =>
                                                alpha(
                                                    theme.palette.primary.main,
                                                    0.08,
                                                ),
                                            color: "primary.main",
                                            borderRadius: "4px",
                                            fontWeight: 600,
                                        }}
                                    />
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        <b> {event.location}</b>
                                    </Typography>
                                    {event.startTime && event.endTime && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ mb: 1 }}
                                        >
                                            <b>
                                                {" "}
                                                {`${dayjs(event.startTime).format("h:mm A")} to ${dayjs(event.endTime).format("h:mm A")}`}
                                            </b>
                                        </Typography>
                                    )}
                                </Stack>

                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                    gutterBottom
                                >
                                    {event.title}
                                </Typography>

                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{
                                        mb: 1.5,
                                        lineHeight: 1.6,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 4,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                    }}
                                    ref={(el) => {
                                        if (el) {
                                            const isOverflow =
                                                el.scrollHeight >
                                                el.clientHeight + 1;
                                            const key = event.id ?? index;
                                            if (clamped[key] !== isOverflow) {
                                                setClamped((prev) => ({
                                                    ...prev,
                                                    [key]: isOverflow,
                                                }));
                                            }
                                        }
                                    }}
                                >
                                    {event.description}
                                </Typography>

                                {clamped[event.id ?? index] && (
                                    <Button
                                        variant="text"
                                        sx={{
                                            textTransform: "none",
                                            fontWeight: 600,
                                            px: 0,
                                            mb: 2,
                                        }}
                                        onClick={() => openDetails(event)}
                                    >
                                        Read more
                                    </Button>
                                )}

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Button
                                        variant="text"
                                        sx={{
                                            textTransform: "none",
                                            fontWeight: 600,
                                            fontSize: "1rem",
                                        }}
                                        onClick={() => openDetails(event)}
                                    >
                                        Details
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                maxWidth="sm"
                fullWidth
            >
                {!isRegistering ? (
                    <>
                        <DialogTitle sx={{ fontWeight: 700 }}>
                            {selected?.title}
                        </DialogTitle>
                        <DialogContent dividers>
                            {selected?.image && (
                                <Box sx={{ mb: 2 }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={selected.image}
                                        alt={selected.title}
                                        sx={{ borderRadius: 1 }}
                                    />
                                </Box>
                            )}
                            <Stack spacing={1.25} sx={{ mb: 2 }}>
                                <Chip
                                    label={
                                        selected?.date
                                            ? dayjs(selected.date).format(
                                                  "MMM D, YYYY",
                                              )
                                            : ""
                                    }
                                    sx={{ alignSelf: "flex-start" }}
                                />
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                >
                                    <Chip
                                        label={selected?.tag}
                                        size="small"
                                        sx={{
                                            bgcolor: (theme) =>
                                                alpha(
                                                    theme.palette.primary.main,
                                                    0.08,
                                                ),
                                            color: "primary.main",
                                            borderRadius: "4px",
                                            fontWeight: 600,
                                        }}
                                    />
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {selected?.location}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Typography
                                color="text.secondary"
                                sx={{ lineHeight: 1.7 }}
                            >
                                {selected?.description}
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeDialog} color="inherit">
                                Close
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => setIsRegistering(true)}
                            >
                                Register
                            </Button>
                        </DialogActions>
                    </>
                ) : (
                    <>
                        <DialogTitle sx={{ fontWeight: 700 }}>
                            Register for {selected?.title}
                        </DialogTitle>
                        <DialogContent dividers>
                            <Stack
                                component="form"
                                id="register-form"
                                spacing={2}
                                onSubmit={submitRegistration}
                            >
                                <TextField
                                    label="Full Name"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            name: e.target.value,
                                        }))
                                    }
                                    required
                                    fullWidth
                                />
                                <TextField
                                    type="email"
                                    label="Email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            email: e.target.value,
                                        }))
                                    }
                                    required
                                    fullWidth
                                />
                                <TextField
                                    type="tel"
                                    label="Phone (India)"
                                    placeholder="e.g. +91 9876543210"
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            phone: e.target.value,
                                        }))
                                    }
                                    error={
                                        !!form.phone &&
                                        !isValidIndianPhone(form.phone)
                                    }
                                    helperText={
                                        !!form.phone &&
                                        !isValidIndianPhone(form.phone)
                                            ? "Enter a valid Indian mobile number"
                                            : ""
                                    }
                                    required
                                    fullWidth
                                />
                                <TextField
                                    type="number"
                                    label="Attendees"
                                    inputProps={{ min: 1 }}
                                    value={form.attendees}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            attendees: e.target.value,
                                        }))
                                    }
                                    fullWidth
                                />
                                <TextField
                                    label="Notes"
                                    value={form.notes}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            notes: e.target.value,
                                        }))
                                    }
                                    multiline
                                    minRows={3}
                                    fullWidth
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => setIsRegistering(false)}
                                color="inherit"
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                form="register-form"
                                variant="contained"
                            >
                                Submit
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnack((s) => ({ ...s, open: false }))}
                    severity={snack.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default EventsListing;
