import HeroBanner from "../components/HeroBanner";
import EventsListing from "../components/EventsListing";
import HowItWorks from "../components/HowItWorks";
import { useLocation } from "react-router-dom";

const Home = () => {
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const loc = params.get("location") || "";
    return (
        <>
            <HeroBanner />
            <EventsListing filterLocation={loc} />
            <HowItWorks />
        </>
    );
};

export default Home;
