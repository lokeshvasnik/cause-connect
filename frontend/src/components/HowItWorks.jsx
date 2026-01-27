import {
    Box,
    Typography,
    Container,
    Grid,
    Avatar,
    Stack,
    SvgIcon,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Search, UserRound, Heart } from "lucide-react";

const steps = [
    {
        title: "Find Events",
        description:
            "Browse upcoming events or use our search to find opportunities that match your interests and schedule.",
        icon: (
            <SvgIcon
                component={Search}
                inheritViewBox
                sx={{ color: "primary.main", fontSize: 40 }}
            />
        ),
        bgColor: (theme) => alpha(theme.palette.primary.main, 0.08),
    },
    {
        title: "Find Events", // Keeping title same as per your image
        description:
            "Browse upcoming events or use our search to find opportunities that match your interests and schedule.",
        icon: (
            <SvgIcon
                component={UserRound}
                inheritViewBox
                sx={{ color: "secondary.main", fontSize: 40 }}
            />
        ),
        bgColor: (theme) => alpha(theme.palette.secondary.main, 0.08),
    },
    {
        title: "Find Events", // Keeping title same as per your image
        description:
            "Browse upcoming events or use our search to find opportunities that match your interests and schedule.",
        icon: (
            <SvgIcon
                component={Heart}
                inheritViewBox
                sx={{ color: "error.main", fontSize: 40 }}
            />
        ),
        bgColor: (theme) => alpha(theme.palette.error.main, 0.08),
    },
];

const HowItWorks = () => {
    return (
        <Box sx={{ bgcolor: "grey.50", pt: 8 }}>
            {/* Steps Section */}
            <Container maxWidth="lg" sx={{ mb: 12 }}>
                <Typography
                    variant="h3"
                    align="center"
                    fontWeight={700}
                    sx={{ mb: 8 }}
                >
                    How It Works
                </Typography>

                <Grid container spacing={6} justifyContent="center">
                    {steps.map((step, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Stack
                                alignItems="center"
                                textAlign="center"
                                spacing={2}
                            >
                                <Avatar
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        bgcolor: step.bgColor,
                                        mb: 1,
                                    }}
                                >
                                    {step.icon}
                                </Avatar>
                                <Typography variant="h5" fontWeight={700}>
                                    {step.title}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ maxWidth: 300 }}
                                >
                                    {step.description}
                                </Typography>
                            </Stack>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Blue CTA Section */}
            <Box
                sx={{
                    bgcolor: "primary.dark",
                    color: "common.white",
                    py: { xs: 8, md: 12 },
                    textAlign: "center",
                }}
            >
                <Container maxWidth="md">
                    <Typography variant="h3" fontWeight={700} gutterBottom>
                        Ready to make a difference?
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{ opacity: 0.9, fontWeight: 400 }}
                    >
                        Join our community of changemakers and start
                        contributing to causes that matter to you.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default HowItWorks;
