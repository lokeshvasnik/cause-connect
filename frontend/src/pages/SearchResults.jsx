import { Container, Typography, Box, Stack, Button } from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import EventsListing from "../components/EventsListing";

const SearchResults = () => {
    const { term } = useParams();
    const { search } = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(search);
    const loc = params.get("location") || "";

    return (
        <Box sx={{ py: 6 }}>
            <Container maxWidth="lg">
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    justifyContent="space-between"
                    sx={{ mb: 3 }}
                >
                    <Typography variant="h4" fontWeight={700}>
                        Results for: {decodeURIComponent(term || "")}{" "}
                        {loc ? `in ${loc}` : ""}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" onClick={() => navigate(-1)}>
                            Back
                        </Button>
                        <Button variant="text" onClick={() => navigate("/")}>
                            Clear
                        </Button>
                    </Stack>
                </Stack>
            </Container>
            <EventsListing
                filterTerm={decodeURIComponent(term || "")}
                filterLocation={loc}
            />
        </Box>
    );
};

export default SearchResults;
