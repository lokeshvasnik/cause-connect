import { Box, Container, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Grid, Paper } from "@mui/material";

import heroBanner from "../assets/hero-banner.png";

const HeroBanner = () => {
    const heroStats = [
        { label: "Active Users", value: "10,000+" },
        { label: "Completed campaigns", value: "5000+" },
        { label: "Active Users", value: "6000+" },
    ];
    return (
        <>
            <Box
                sx={{
                    position: "relative",
                    backgroundImage: `url(${heroBanner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    minHeight: { xs: 360, md: 480 },
                    display: "flex",
                    alignItems: "center",
                    color: "common.white",
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background: (theme) =>
                            `linear-gradient(120deg, ${alpha(
                                theme.palette.text.primary,
                                0.78,
                            )}, ${alpha(theme.palette.text.primary, 0.48)})`,
                    }}
                />

                <Container
                    maxWidth="lg"
                    sx={{ position: "relative", py: { xs: 4, md: 6 } }}
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
