import { useEffect, useState } from "react";
import {
    AppBar,
    Box,
    Autocomplete,
    Button,
    Container,
    Divider,
    Drawer,
    IconButton,
    InputAdornment,
    List,
    ListItemButton,
    ListItemText,
    Stack,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import { MapPin, Search, UserRound } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { getEvents } from "../api";

import logo from "../assets/logo.png";

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const isHostRoute = location.pathname.startsWith("/host");
    const isAdminRoute = location.pathname.startsWith("/admin");
    const [searchInput, setSearchInput] = useState(
        () => localStorage.getItem("lastSearchTerm") || "",
    );
    const [locationInput, setLocationInput] = useState(
        () => localStorage.getItem("lastLocation") || "",
    );
    const [searchOptions, setSearchOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);

    const toggleDrawer = () => setMobileOpen((prev) => !prev);

    const navigateToSearch = (term, loc) => {
        const t = (term || "").trim();
        const l = (loc || "").trim();
        if (!t) return;
        localStorage.setItem("lastSearchTerm", t);
        if (l) localStorage.setItem("lastLocation", l);
        const qp = l ? `?location=${encodeURIComponent(l)}` : "";
        navigate(`/search/${encodeURIComponent(t)}${qp}`);
    };

    useEffect(() => {
        let active = true;
        const t = searchInput.trim();
        if (!t) {
            setSearchOptions([]);
            return;
        }
        const handle = setTimeout(async () => {
            try {
                const res = await getEvents({ term: t, pageSize: 10 });
                if (!active) return;
                const titles = Array.from(
                    new Set(
                        (res.items || []).map((e) => e.title).filter(Boolean),
                    ),
                );
                setSearchOptions(titles);
            } catch (e) {
                if (active) setSearchOptions([]);
            }
        }, 200);
        return () => {
            active = false;
            clearTimeout(handle);
        };
    }, [searchInput]);

    useEffect(() => {
        let active = true;
        const l = locationInput.trim();
        if (!l) {
            setLocationOptions([]);
            return;
        }
        const handle = setTimeout(async () => {
            try {
                const res = await getEvents({ location: l, pageSize: 20 });
                if (!active) return;
                const locations = Array.from(
                    new Set(
                        (res.items || [])
                            .map((e) => e.location)
                            .filter(Boolean),
                    ),
                );
                setLocationOptions(locations);
            } catch (e) {
                if (active) setLocationOptions([]);
            }
        }, 200);
        return () => {
            active = false;
            clearTimeout(handle);
        };
    }, [locationInput]);

    return (
        <AppBar
            position="sticky"
            color="inherit"
            elevation={0}
            sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                backdropFilter: "blur(12px)",
            }}
        >
            <Container maxWidth="lg">
                <Toolbar
                    disableGutters
                    sx={{
                        py: 1.5,
                        gap: 2,
                        flexWrap: "wrap",
                        rowGap: 2,
                        justifyContent: "space-between",
                    }}
                >
                    <Stack
                        direction="row"
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1.25}
                        sx={{ width: { xs: "100%", md: "auto" } }}
                    >
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            sx={{ gap: 1 }}
                        >
                            <Box
                                sx={{
                                    width: { xs: 20, sm: 34, md: 38, lg: 72 },
                                }}
                            >
                                <img
                                    src={logo}
                                    alt="Cause Connect logo"
                                    style={{
                                        width: "100%",
                                        height: "auto",
                                        display: "block",
                                    }}
                                />
                            </Box>
                            <Typography
                                variant="body2"
                                component="div"
                                noWrap
                                sx={{
                                    fontSize: 14,
                                    lineHeight: 1.2,
                                    fontWeight: 700,
                                    color: "text.primary",
                                }}
                            >
                                <Link
                                    to="/"
                                    style={{
                                        textDecoration: "none",
                                        color: "inherit",
                                    }}
                                >
                                    Cause Connect
                                </Link>
                            </Typography>
                        </Box>
                        <Box>
                            <IconButton
                                onClick={toggleDrawer}
                                sx={{
                                    display: { xs: "inline-flex", md: "none" },
                                    ml: 1,
                                }}
                                aria-label="Open navigation menu"
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        width: 22,
                                        height: 2,
                                        backgroundColor: "text.primary",
                                        display: "block",
                                        borderRadius: 1,
                                        boxShadow:
                                            "0 6px 0 0 currentColor, 0 -6px 0 0 currentColor",
                                    }}
                                />
                            </IconButton>
                        </Box>
                    </Stack>

                    {!isAdminRoute && !isHostRoute && (
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={1.25}
                            sx={{
                                flexGrow: 1,
                                minWidth: { xs: "100%", md: "auto" },
                            }}
                        >
                            <Autocomplete
                                freeSolo
                                options={searchOptions}
                                size="small"
                                sx={{ width: "100%" }}
                                inputValue={searchInput}
                                onInputChange={(e, val) => setSearchInput(val)}
                                onChange={(event, value, reason) => {
                                    if (reason === "selectOption" && value) {
                                        navigateToSearch(value, locationInput);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Search campaigns"
                                        variant="outlined"
                                        fullWidth
                                        sx={{ borderRadius: "8px" }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                navigateToSearch(
                                                    searchInput,
                                                    locationInput,
                                                );
                                            }
                                        }}
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}
                            />
                            <Autocomplete
                                freeSolo
                                options={locationOptions}
                                size="small"
                                sx={{
                                    maxWidth: { md: 200, xs: "100%" },
                                    width: "100%",
                                }}
                                inputValue={locationInput}
                                onInputChange={(e, val) =>
                                    setLocationInput(val)
                                }
                                onChange={(event, value, reason) => {
                                    if (reason === "selectOption" && value) {
                                        setLocationInput(value);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Location"
                                        variant="outlined"
                                        fullWidth
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                navigateToSearch(
                                                    searchInput,
                                                    locationInput,
                                                );
                                            }
                                        }}
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <MapPin />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </Stack>
                    )}

                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="flex-end"
                        sx={{
                            width: { xs: "auto", md: "auto" },
                            display: { xs: "none", md: "flex" },
                        }}
                    >
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() =>
                                navigate(isHostRoute ? "/" : "/host")
                            }
                        >
                            {isHostRoute
                                ? "Visit Application"
                                : "Become a Host"}
                        </Button>
                        {isHostRoute && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate("/admin/login")}
                            >
                                Login Admin
                            </Button>
                        )}
                        {/* <Button color="inherit">Sign In</Button>
                        <Button variant="contained" color="primary">
                            Register
                        </Button> */}
                        <IconButton
                            color="default"
                            sx={{
                                border: "1px solid",
                                borderColor: "divider",
                            }}
                        >
                            <UserRound />
                        </IconButton>
                    </Stack>
                </Toolbar>
            </Container>

            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={toggleDrawer}
                PaperProps={{ sx: { width: 280, p: 2 } }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                            color="default"
                            sx={{
                                border: "1px solid",
                                borderColor: "divider",
                            }}
                        >
                            <UserRound />
                        </IconButton>
                    </Stack>
                    <IconButton
                        onClick={toggleDrawer}
                        aria-label="Close navigation menu"
                    >
                        ✕
                    </IconButton>
                </Stack>

                {!isAdminRoute && !isHostRoute && (
                    <Stack spacing={1.25} sx={{ mb: 2 }}>
                        <Autocomplete
                            freeSolo
                            options={searchOptions}
                            size="small"
                            inputValue={searchInput}
                            onInputChange={(e, val) => setSearchInput(val)}
                            onChange={(event, value, reason) => {
                                if (reason === "selectOption" && value) {
                                    navigateToSearch(value, locationInput);
                                    setMobileOpen(false);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Search campaigns"
                                    variant="outlined"
                                    fullWidth
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            navigateToSearch(
                                                searchInput,
                                                locationInput,
                                            );
                                            setMobileOpen(false);
                                        }
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        />
                        <Autocomplete
                            freeSolo
                            options={locationOptions}
                            size="small"
                            inputValue={locationInput}
                            onInputChange={(e, val) => setLocationInput(val)}
                            onChange={(event, value, reason) => {
                                if (reason === "selectOption" && value) {
                                    setLocationInput(value);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Location"
                                    variant="outlined"
                                    fullWidth
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            navigateToSearch(
                                                searchInput,
                                                locationInput,
                                            );
                                            setMobileOpen(false);
                                        }
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <MapPin />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Stack>
                )}

                <Divider sx={{ mb: 1.5 }} />

                <List sx={{ mb: 2 }}>
                    <ListItemButton
                        onClick={() => {
                            navigate(isHostRoute ? "/" : "/host");
                            setMobileOpen(false);
                        }}
                    >
                        <ListItemText
                            primary={
                                isHostRoute
                                    ? "Visit Application"
                                    : "Become a Host"
                            }
                        />
                    </ListItemButton>
                    {isHostRoute && (
                        <ListItemButton
                            onClick={() => {
                                navigate("/admin/login");
                                setMobileOpen(false);
                            }}
                        >
                            <ListItemText primary="Login Admin" />
                        </ListItemButton>
                    )}
                    {/* <ListItemButton>
                        <ListItemText primary="Sign In" />
                    </ListItemButton>
                    <ListItemButton>
                        <ListItemText primary="Register" />
                    </ListItemButton> */}
                </List>
            </Drawer>
        </AppBar>
    );
};

export default Navbar;
