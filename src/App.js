import React, { useEffect, useState, useCallback } from "react";
import {
  TextField,
  Button,
  Box,
  Backdrop,
  CircularProgress,
  DialogContent,
  Typography,
  Dialog,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ThermostatAutoIcon from "@mui/icons-material/ThermostatAuto";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AirIcon from "@mui/icons-material/Air";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import axios from "axios";
import BackgroundWrapper from "./BackgroundWrapper";
import "./App.css";

/* ───── Open-Meteo helper (free, no API key) ───── */
async function fetchForecast(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,windspeed_10m_max` +
    `&timezone=auto`;
  const res = await axios.get(url);
  return res.data.daily;
}

/* Maps WMO weather codes to friendly labels */
function wmoLabel(code) {
  const map = {
    0: "Clear sky",    1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog",         48: "Rime fog",
    51: "Light drizzle", 53: "Drizzle",  55: "Dense drizzle",
    61: "Slight rain", 63: "Rain",       65: "Heavy rain",
    71: "Slight snow", 73: "Snow",       75: "Heavy snow",
    80: "Rain showers",81: "Rain showers",82: "Heavy showers",
    95: "Thunderstorm",96: "Thunderstorm + hail", 99: "Thunderstorm + hail",
  };
  return map[code] || "Unknown";
}

function wmoIcon(code) {
  if ([0, 1].includes(code))               return "☀️";
  if ([2, 3].includes(code))               return "⛅";
  if ([45, 48].includes(code))             return "🌫️";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75].includes(code))         return "❄️";
  if ([95, 96, 99].includes(code))         return "⛈️";
  return "🌤️";
}

/* ───── Main App ───── */
function App() {
  const [city, setCity] = useState("Kolkata");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [view, setView] = useState("today"); // "today" | "week"

  const [current, setCurrent] = useState({
    temp_c: "",
    temp_f: "",
    condition: "",
    conditionIcon: "",
    location: "",
    humidity: "",
    wind_kph: "",
    feelslike_c: "",
    is_day: 1,
    lat: null,
    lon: null,
  });

  const [forecast, setForecast] = useState([]); // 7-day

  /* ---- fetch current weather (RapidAPI) ---- */
  const fetchCurrent = useCallback(async (q) => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        "https://weatherapi-com.p.rapidapi.com/current.json",
        {
          params: { q },
          headers: {
            "X-RapidAPI-Key": process.env.REACT_APP_RAPIDAPI_KEY,
            "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
          },
        }
      );

      const loc = data.location;
      const cur = data.current;
      setCurrent({
        temp_c: cur.temp_c,
        temp_f: cur.temp_f,
        condition: cur.condition.text,
        conditionIcon: cur.condition.icon,
        location: `${loc.name}, ${loc.region}, ${loc.country}`,
        humidity: cur.humidity,
        wind_kph: cur.wind_kph,
        feelslike_c: cur.feelslike_c,
        is_day: cur.is_day,
        lat: loc.lat,
        lon: loc.lon,
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrorOpen(true);
    }
  }, []);

  /* ---- fetch 7-day forecast (Open-Meteo) ---- */
  const fetchWeekly = useCallback(async () => {
    if (current.lat == null) return;
    setLoading(true);
    try {
      const daily = await fetchForecast(current.lat, current.lon);
      const days = daily.time.map((date, i) => ({
        date,
        max: daily.temperature_2m_max[i],
        min: daily.temperature_2m_min[i],
        code: daily.weathercode[i],
        precip: daily.precipitation_sum[i],
        wind: daily.windspeed_10m_max[i],
      }));
      setForecast(days);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [current.lat, current.lon]);

  /* ---- initial load ---- */
  useEffect(() => {
    fetchCurrent("Kolkata");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- when user switches to week, pull forecast ---- */
  useEffect(() => {
    if (view === "week") fetchWeekly();
  }, [view, fetchWeekly]);

  /* ---- search handler ---- */
  const handleSearch = () => {
    if (inputValue.trim()) {
      setCity(inputValue.trim());
      fetchCurrent(inputValue.trim());
      setView("today");
    }
  };

  /* ---- helpers ---- */
  const dayName = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  /* ────────────── RENDER ────────────── */
  return (
    <BackgroundWrapper condition={current.condition}>
      {/* ---- Glass card container ---- */}
      <Box className="app-container">
        <Box className="glass-card">
          {/* Title */}
          <Typography className="app-title" variant="h4" component="h1">
            {current.is_day ? <WbSunnyIcon className="title-icon" /> : <NightsStayIcon className="title-icon" />}
            Sub-Zero
          </Typography>
          <Typography className="app-subtitle">Real-time weather at your fingertips</Typography>

          {/* Search */}
          <Box className="search-row">
            <TextField
              fullWidth
              size="small"
              placeholder="Search any city..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch} size="small" sx={{ color: "rgba(255,255,255,0.7)" }}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  color: "#fff",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  "& fieldset": { border: "1px solid rgba(255,255,255,0.2)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4) !important" },
                  "&.Mui-focused fieldset": { borderColor: "rgba(255,255,255,0.5) !important" },
                  "& input::placeholder": { color: "rgba(255,255,255,0.5)" },
                },
              }}
            />
          </Box>

          {/* Toggle: Today / Week */}
          <Box className="toggle-row">
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={(_, val) => { if (val) setView(val); }}
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  color: "rgba(255,255,255,0.6)",
                  borderColor: "rgba(255,255,255,0.2)",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  "&.Mui-selected": {
                    color: "#fff",
                    backgroundColor: "rgba(255,255,255,0.18)",
                  },
                },
              }}
            >
              <ToggleButton value="today">Today</ToggleButton>
              <ToggleButton value="week">7 Days</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* ---- TODAY VIEW ---- */}
          {view === "today" && current.condition && (
            <Box className="today-view">
              <Box className="weather-icon-row">
                <img className="condition-icon" src={current.conditionIcon} alt={current.condition} />
                <Typography className="temp-text">
                  {current.temp_c}°<span className="temp-unit">C</span>
                </Typography>
              </Box>
              <Typography className="condition-label">{current.condition}</Typography>

              <Box className="details-grid">
                <Box className="detail-chip">
                  <ThermostatAutoIcon className="chip-icon" />
                  <Box>
                    <Typography className="chip-value">{current.feelslike_c}°C</Typography>
                    <Typography className="chip-label">Feels Like</Typography>
                  </Box>
                </Box>
                <Box className="detail-chip">
                  <WaterDropIcon className="chip-icon" />
                  <Box>
                    <Typography className="chip-value">{current.humidity}%</Typography>
                    <Typography className="chip-label">Humidity</Typography>
                  </Box>
                </Box>
                <Box className="detail-chip">
                  <AirIcon className="chip-icon" />
                  <Box>
                    <Typography className="chip-value">{current.wind_kph} km/h</Typography>
                    <Typography className="chip-label">Wind</Typography>
                  </Box>
                </Box>
              </Box>

              <Box className="location-row">
                <LocationOnIcon sx={{ fontSize: 18, opacity: 0.7 }} />
                <Typography className="location-text">{current.location}</Typography>
              </Box>
            </Box>
          )}

          {/* ---- WEEK VIEW ---- */}
          {view === "week" && forecast.length > 0 && (
            <Box className="week-view">
              {forecast.map((day, i) => (
                <Box key={i} className="forecast-row">
                  <Typography className="forecast-day">{dayName(day.date)}</Typography>
                  <Typography className="forecast-icon">{wmoIcon(day.code)}</Typography>
                  <Typography className="forecast-desc">{wmoLabel(day.code)}</Typography>
                  <Typography className="forecast-temps">
                    <span className="hi">{Math.round(day.max)}°</span>
                    <span className="lo">{Math.round(day.min)}°</span>
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Typography className="footer-text">
          Powered by WeatherAPI &amp; Open-Meteo
        </Typography>
      </Box>

      {/* Loading overlay */}
      <Backdrop sx={{ color: "#fff", zIndex: 9999 }} open={loading} onClick={() => setLoading(false)}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Error dialog */}
      <Dialog onClose={() => setErrorOpen(false)} open={errorOpen}>
        <DialogContent>
          Location <b>{city}</b> not found. Check for typos.
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setErrorOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </BackgroundWrapper>
  );
}

export default App;
