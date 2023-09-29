import {
  TextField,
  Button,
  Box,
  Card,
  Backdrop,
  Container,
  CircularProgress,
  DialogContent,
  Typography,
  Dialog,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ThermostatAutoIcon from "@mui/icons-material/ThermostatAuto";
import LocationOnIcon from "@mui/icons-material/LocationOn";
//import CloseIcon from '@mui/icons-material/Close';
import axios from "axios";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [city, update_city] = useState("pune");
  const [open, setopen] = useState(false);
  const [ErrorDialog, setErrorDialog] = useState(false);
  const [values, setvalues] = useState({
    Weather: "",
    City: "",
    Current_weather: "",
    Condition: "",
  });
  useEffect(() => {
    update_city("Kolkata");
    fetch_weather_data();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //function to fetch weathe data using API
  async function fetch_weather_data() {
    setopen(true);
    const options = {
      method: "GET",
      url: "https://weatherapi-com.p.rapidapi.com/current.json",
      params: { q: city, days: "1" },
      headers: {
        "X-RapidAPI-Key": "31371bc5c3msh34f399b07961d46p192883jsn2ba7562e3194",
        "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
      },
    };

    try {
      await axios.request(options).then((response) => {
        console.log(response);
        setvalues({
          ...values,
          Weather:
            response.data["current"]["temp_c"] +
            "\xB0" +
            " C / " +
            response.data["current"]["temp_f"] +
            "\xB0" +
            " F",
          City:
            response.data["location"]["name"] +
            ", " +
            response.data["location"]["region"] +
            ", " +
            response.data["location"]["country"],
          Condition: response.data["current"]["condition"]["icon"],
          Current_weather: response.data["current"]["condition"]["text"],
        });
      });
      setopen(false);
    } catch (error) {
      console.error(error);
      setopen(false);
      setErrorDialog(true);
    }
  }

  return (
    <Container maxWidth="sm">
      <Card
        elevation={7}
        sx={{
          textAlign: "center",
          margin: "30% auto 5% auto",
          padding: "5% 10% 5% 10%",
        }}
      >
        <Typography variant="h5">
          <b>Sub-Zero</b>
        </Typography>
        <br />
        <Box sx={{ margin: "0% 20% 0% 20%" }}>
          <TextField
            fullWidth={true}
            size="small"
            placeholder="Enter a city."
            onKeyDown={(e) => {
              if (e.keyCode === 13) fetch_weather_data();
            }}
            onChange={(e) => {
              update_city(e.target.value);
            }}
          />
          <br />
          <br />
          <Backdrop
            sx={{ color: "#fff" }}
            open={open}
            onClick={() => {
              setopen(false);
            }}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
          <Button
            //fullWidth={true}
            color="primary"
            variant="contained"
            size="medium"
            onClick={() => fetch_weather_data()}
            endIcon={<SearchIcon />}
          >
            Search
          </Button>
        </Box>
        <br />
        <br />
        <Box>
          <img
            className="image"
            src={values["Condition"]}
            alt="weather_image"
          />
          <Typography className="text_weather" sx={{ fontSize: "2.5vh" }}>
            {values["Current_weather"]}
          </Typography>
        </Box>
        <Typography className="text_weather" sx={{ fontSize: "2.2vh" }}>
          <ThermostatAutoIcon sx={{ fontSize: "3vh" }} />
          &ensp;Temperature: {values["Weather"]}.
        </Typography>
        <Typography className="text_weather" sx={{ fontSize: "2.2vh" }}>
          <LocationOnIcon sx={{ fontSize: "3vh" }} />
          &nbsp;Location: {values["City"]}.
        </Typography>
        <Dialog
          onClose={() => {
            setErrorDialog(false);
          }}
          open={ErrorDialog}
        >
          <DialogContent>Location <b>{city}</b> not found. Check any mistypings.</DialogContent>
          <DialogActions><Button variant="contained" onClick={()=>setErrorDialog(false)}>Close</Button></DialogActions>
        </Dialog>
      </Card>
    </Container>
  );
}

export default App;
