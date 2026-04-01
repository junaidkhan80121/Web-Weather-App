import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import BackgroundWrapper from "./BackgroundWrapper";
import "./App.css";

/* ───── Open-Meteo: hourly + daily forecast (free, no key) ───── */
async function fetchForecast(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,weathercode` +
    `&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,windspeed_10m_max` +
    `&timezone=auto&forecast_hours=18`;
  const res = await axios.get(url);
  return res.data;
}


/* WMO code → Material Symbol icon name */
function wmoMaterialIcon(code) {
  if ([0, 1].includes(code)) return "wb_sunny";
  if ([2].includes(code)) return "partly_cloudy_day";
  if ([3].includes(code)) return "cloud";
  if ([45, 48].includes(code)) return "foggy";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "rainy";
  if ([71, 73, 75].includes(code)) return "ac_unit";
  if ([95, 96, 99].includes(code)) return "thunderstorm";
  return "cloud";
}

/* WMO code → accent color class */
function wmoIconColor(code) {
  if ([0, 1].includes(code)) return "icon-tertiary";
  if ([2, 3].includes(code)) return "icon-secondary";
  if ([45, 48].includes(code)) return "icon-muted";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "icon-primary";
  if ([71, 73, 75].includes(code)) return "icon-snow";
  if ([95, 96, 99].includes(code)) return "icon-error";
  return "icon-secondary";
}

/* condition text → Material Symbol icon name */
function conditionIcon(text) {
  if (!text) return "cloud";
  const c = text.toLowerCase();
  if (c.includes("thunder") || c.includes("storm")) return "thunderstorm";
  if (c.includes("snow") || c.includes("blizzard") || c.includes("ice")) return "ac_unit";
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower")) return "rainy";
  if (c.includes("fog") || c.includes("mist") || c.includes("haze")) return "foggy";
  if (c.includes("overcast")) return "cloud";
  if (c.includes("cloudy") || c.includes("partly")) return "partly_cloudy_day";
  if (c.includes("clear") || c.includes("sunny")) return "wb_sunny";
  return "cloud";
}

/* ───── Main App ───── */
function App() {
  const [city, setCity] = useState("Kolkata");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorOpen, setErrorOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [current, setCurrent] = useState({
    temp_c: "--", temp_f: "--", condition: "", location: "",
    region: "", country: "", humidity: "--", wind_kph: "--",
    feelslike_c: "--", is_day: 1, lat: null, lon: null,
    vis_km: "--", pressure_mb: "--", uv: "--",
    wind_dir: "", cloud: "--",
  });

  const [hourly, setHourly] = useState([]);
  const [forecast, setForecast] = useState([]);

  /* ── fetch current weather (RapidAPI) ── */
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
        temp_c: cur.temp_c, temp_f: cur.temp_f,
        condition: cur.condition.text,
        location: loc.name, region: loc.region, country: loc.country,
        humidity: cur.humidity, wind_kph: cur.wind_kph,
        feelslike_c: cur.feelslike_c, is_day: cur.is_day,
        lat: loc.lat, lon: loc.lon,
        vis_km: cur.vis_km, pressure_mb: cur.pressure_mb,
        uv: cur.uv, wind_dir: cur.wind_dir, cloud: cur.cloud,
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrorOpen(true);
    }
  }, []);

  /* ── fetch hourly + daily forecast (Open-Meteo) ── */
  const fetchForecastData = useCallback(async (lat, lon) => {
    try {
      const data = await fetchForecast(lat, lon);

      // Hourly (next 18 hours)
      if (data.hourly) {
        const hrs = data.hourly.time.slice(0, 18).map((t, i) => ({
          time: t,
          temp: Math.round(data.hourly.temperature_2m[i]),
          code: data.hourly.weathercode[i],
        }));
        setHourly(hrs);
      }

      // Daily (7 days)
      if (data.daily) {
        const days = data.daily.time.map((date, i) => ({
          date,
          max: Math.round(data.daily.temperature_2m_max[i]),
          min: Math.round(data.daily.temperature_2m_min[i]),
          code: data.daily.weathercode[i],
        }));
        setForecast(days);
      }
    } catch (err) {
      console.error("Forecast error:", err);
    }
  }, []);

  /* ── initial load ── */
  useEffect(() => {
    fetchCurrent("Kolkata");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── when current loads, fetch forecast ── */
  useEffect(() => {
    if (current.lat != null) {
      fetchForecastData(current.lat, current.lon);
    }
  }, [current.lat, current.lon, fetchForecastData]);

  /* ── autocomplete search ── */
  useEffect(() => {
    const q = inputValue.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get(
          "https://weatherapi-com.p.rapidapi.com/search.json",
          {
            params: { q },
            headers: {
              "X-RapidAPI-Key": process.env.REACT_APP_RAPIDAPI_KEY,
              "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
            },
          }
        );
        setSuggestions(data);
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [inputValue]);

  /* ── search ── */
  const handleSearch = () => {
    const q = inputValue.trim();
    if (q) {
      setCity(q);
      fetchCurrent(q);
    }
  };

  /* ── helpers ── */
  const dayName = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    return d.toLocaleDateString("en-US", { weekday: "short" });
  };

  const hourLabel = (timeStr, index) => {
    if (index === 0) return "Now";
    const d = new Date(timeStr);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  // Temperature range bar position for 7-day forecast
  const allTemps = forecast.length > 0
    ? { min: Math.min(...forecast.map(d => d.min)), max: Math.max(...forecast.map(d => d.max)) }
    : { min: 0, max: 30 };
  const tempRange = allTemps.max - allTemps.min || 1;

  /* ────────────── RENDER ────────────── */
  return (
    <BackgroundWrapper condition={current.condition} isDay={current.is_day === 1}>

      {/* ═══════ TOP HEADER BAR ═══════ */}
      <header className="top-bar">
        <div className="top-bar-brand">
          <div className="brand-icon">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
          </div>
          <span className="brand-name">Aura</span>
        </div>

        <div className="search-container">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search city..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setShowSuggestions(false);
                handleSearch();
              }
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="search-dropdown">
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  className="search-dropdown-item"
                  onClick={() => {
                    setInputValue(s.name);
                    setCity(s.name);
                    fetchCurrent(s.name);
                    setShowSuggestions(false);
                  }}
                >
                  <span className="material-symbols-outlined item-icon" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  <div className="item-text">
                    <span className="item-city">{s.name}</span>
                    <span className="item-region">{s.region ? `${s.region}, ` : ''}{s.country}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="top-bar-actions">
          <button className="icon-btn" onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => fetchCurrent(`${pos.coords.latitude},${pos.coords.longitude}`),
                () => {}
              );
            }
          }}>
            <span className="material-symbols-outlined">my_location</span>
          </button>
        </div>
      </header>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className="main-content">

        {/* ── HERO SECTION ── */}
        <section className="hero-section">
          <div className="hero-left">
            <div className="hero-location">
              <span className="material-symbols-outlined loc-pin" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              <span className="loc-text">{current.location}, {current.country}</span>
            </div>
            <h1 className="hero-temp">
              {current.temp_c}<span className="hero-unit">°C</span>
            </h1>
            <p className="hero-condition">
              {current.condition}
              <span className="material-symbols-outlined hero-cond-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                {conditionIcon(current.condition)}
              </span>
            </p>
          </div>
          <div className="hero-right">
            <div className="glass-stats-card">
              <div className="stat-item">
                <p className="stat-label">Humidity</p>
                <p className="stat-value">{current.humidity}%</p>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <p className="stat-label">UV Index</p>
                <p className="stat-value">{current.uv}</p>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <p className="stat-label">Visibility</p>
                <p className="stat-value">{current.vis_km} km</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── BENTO GRID ── */}
        <div className="bento-grid">

          {/* HOURLY FORECAST (wide) */}
          <section className="glass-card hourly-card">
            <div className="card-header">
              <h2 className="card-title">Hourly Forecast</h2>
              <span className="card-badge">Next 18 Hours</span>
            </div>
            <div className="hourly-scroll">
              {hourly.map((h, i) => (
                <div key={i} className={`hour-chip ${i === 0 ? "hour-active" : ""}`}>
                  <span className="hour-time">{hourLabel(h.time, i)}</span>
                  <span className={`material-symbols-outlined hour-icon ${wmoIconColor(h.code)}`}
                        style={{ fontVariationSettings: i === 0 ? "'FILL' 1" : "'FILL' 0" }}>
                    {wmoMaterialIcon(h.code)}
                  </span>
                  <span className="hour-temp">{h.temp}°</span>
                </div>
              ))}
            </div>
            {/* Detail sub-cards */}
            <div className="detail-sub-grid">
              <div className="detail-sub-card">
                <div className="sub-card-label">
                  <span className="material-symbols-outlined">air</span> Wind
                </div>
                <p className="sub-card-value">{current.wind_kph} km/h</p>
                <p className="sub-card-extra">{current.wind_dir}</p>
              </div>
              <div className="detail-sub-card">
                <div className="sub-card-label">
                  <span className="material-symbols-outlined">compress</span> Pressure
                </div>
                <p className="sub-card-value">{current.pressure_mb} hPa</p>
                <p className="sub-card-extra">Stable</p>
              </div>
              <div className="detail-sub-card">
                <div className="sub-card-label">
                  <span className="material-symbols-outlined">thermostat</span> Feels Like
                </div>
                <p className="sub-card-value">{current.feelslike_c}°</p>
                <p className="sub-card-extra">{current.feelslike_c > current.temp_c ? "Warmer" : "Cooler"}</p>
              </div>
              <div className="detail-sub-card">
                <div className="sub-card-label">
                  <span className="material-symbols-outlined">cloud</span> Cloud Cover
                </div>
                <p className="sub-card-value">{current.cloud}%</p>
                <p className="sub-card-extra">{current.cloud > 70 ? "Overcast" : current.cloud > 30 ? "Partial" : "Clear"}</p>
              </div>
            </div>
          </section>

          {/* 7-DAY FORECAST (narrow) */}
          <section className="glass-card forecast-card">
            <div className="card-header">
              <h2 className="card-title">7-Day Forecast</h2>
            </div>
            <div className="forecast-list">
              {forecast.map((day, i) => {
                const leftPct = ((day.min - allTemps.min) / tempRange) * 100;
                const widthPct = ((day.max - day.min) / tempRange) * 100;
                return (
                  <div key={i} className="forecast-row">
                    <span className={`forecast-day ${i === 0 ? "forecast-day-today" : ""}`}>
                      {dayName(day.date)}
                    </span>
                    <span className={`material-symbols-outlined forecast-icon ${wmoIconColor(day.code)}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}>
                      {wmoMaterialIcon(day.code)}
                    </span>
                    <div className="forecast-temp-row">
                      <span className="forecast-hi">{day.max}°</span>
                      <div className="temp-bar-track">
                        <div
                          className="temp-bar-fill"
                          style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 8)}%` }}
                        />
                      </div>
                      <span className="forecast-lo">{day.min}°</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </main>

      {/* ═══════ LOADING OVERLAY ═══════ */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
        </div>
      )}

      {/* ═══════ ERROR DIALOG ═══════ */}
      {errorOpen && (
        <div className="error-backdrop" onClick={() => setErrorOpen(false)}>
          <div className="error-dialog" onClick={(e) => e.stopPropagation()}>
            <p>Location <strong>{city}</strong> not found. Check for typos.</p>
            <button className="btn-primary" onClick={() => setErrorOpen(false)}>Close</button>
          </div>
        </div>
      )}

    </BackgroundWrapper>
  );
}

export default App;
