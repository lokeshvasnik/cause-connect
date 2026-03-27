import { useEffect, useMemo, useState } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Grid } from "@mui/material";
import { getPublicStats } from "../api";

import heroBanner from "../assets/carousel-one.jpg";
import heroBanner2 from "../assets/carousel-two.jpg";
import heroBanner3 from "../assets/carousel-three.jpg";

const HeroBanner = () => {
    const heroSlides = useMemo(
        () => [heroBanner, heroBanner2, heroBanner3],
        [],
    );
    const [activeSlide, setActiveSlide] = useState(0);
    const [stats, setStats] = useState({
        totalRegisteredUsers: 0,
        completedCampaigns: 0,
        activeCampaigns: 0,
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % heroSlides.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [heroSlides.length]);

    useEffect(() => {
        let mounted = true;

        async function loadStats() {
            try {
                const data = await getPublicStats();
                if (!mounted) return;
                setStats({
                    totalRegisteredUsers: data.totalRegisteredUsers || 0,
                    completedCampaigns: data.completedCampaigns || 0,
                    activeCampaigns: data.activeCampaigns || 0,
                });
            } catch {
                // Keep default zero values if stats API is unavailable.
            }
        }

        loadStats();
        return () => {
            mounted = false;
        };
    }, []);

    const heroStats = useMemo(
        () => [
            {
                label: "Registered Users",
                value: stats.totalRegisteredUsers.toLocaleString("en-IN"),
            },
            {
                label: "Completed campaigns",
                value: stats.completedCampaigns.toLocaleString("en-IN"),
            },
            {
                label: "Active campaigns",
                value: stats.activeCampaigns.toLocaleString("en-IN"),
            },
        ],
        [stats],
    );
    return (
        <>
            <Box
                sx={{
                    position: "relative",
                    minHeight: { xs: 360, md: 480 },
                    display: "flex",
                    alignItems: "center",
                    color: "common.white",
                    overflow: "hidden",
                }}
            >
                {heroSlides.map((image, index) => (
                    <Box
                        key={image}
                        sx={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: `url(${image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            opacity: index === activeSlide ? 1 : 0,
                            transition: "opacity 900ms ease-in-out",
                            zIndex: 0,
                        }}
                    />
                ))}
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background: (theme) =>
                            `linear-gradient(120deg, ${alpha(
                                theme.palette.text.primary,
                                0.78,
                            )}, ${alpha(theme.palette.text.primary, 0.48)})`,
                        zIndex: 1,
                    }}
                />

                <Container
                    maxWidth="lg"
                    sx={{
                        position: "relative",
                        zIndex: 2,
                        py: { xs: 4, md: 6 },
                    }}
                >
                    <Stack
                        spacing={2}
                        sx={{
                            maxWidth: { xs: "100%", md: "80%" },
                            textAlign: "center",
                            display: "flex",
                            justifyContent: "center",
                            width: "100%",
                            margin: "0 auto",
                        }}
                    >
                        <Typography
                            variant="h3"
                            component="h1"
                            textAlign="center"
                            fontWeight={800}
                        >
                            Make a Difference in Your Community
                        </Typography>
                        <Typography
                            variant="h6"
                            fontWeight={400}
                            sx={{ opacity: 0.95 }}
                        >
                            Join thousands of volunteers creating positive
                            change. Find meaningful opportunities to help and
                            connect with like minded people.
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            <Box sx={{ backgroundColor: "common.white" }}>
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            p: 3,
                        }}
                    >
                        <Grid
                            container
                            spacing={{ xs: 2, md: 0 }}
                            justifyContent={{
                                xs: "center",
                                md: "space-between",
                            }}
                            alignItems="center"
                        >
                            {heroStats.map((stat) => (
                                <Grid
                                    item
                                    xs={12}
                                    sm="auto"
                                    key={stat.label}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Stack
                                        spacing={1}
                                        alignItems="center"
                                        textAlign="center"
                                        sx={{ minWidth: { md: 200 } }}
                                    >
                                        <Typography
                                            variant="h4"
                                            color="primary.main"
                                            sx={{
                                                fontSize: {
                                                    xs: "1.75rem",
                                                    md: "2rem",
                                                },
                                                fontWeight: 700,
                                            }}
                                        >
                                            {stat.value}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                fontSize: {
                                                    xs: "0.875rem",
                                                    md: "0.95rem",
                                                },
                                            }}
                                        >
                                            {stat.label}
                                        </Typography>
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Container>
            </Box>
        </>
    );
};

export default HeroBanner;
