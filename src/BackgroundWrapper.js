import React, { useMemo } from 'react';
import './BackgroundWrapper.css';

/**
 * Maps weather condition text → theme key
 */
function getWeatherTheme(conditionText, isDay) {
  if (!conditionText) return 'default';
  const c = conditionText.toLowerCase();

  if (c.includes('thunder') || c.includes('storm'))  return 'thunderstorm';
  if (c.includes('snow') || c.includes('blizzard') || c.includes('sleet') || c.includes('ice'))
    return 'snowy';
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower'))
    return 'rainy';
  if (c.includes('fog') || c.includes('mist') || c.includes('haze'))
    return 'misty';
  if (c.includes('overcast') || c.includes('cloudy') || c.includes('partly'))
    return 'cloudy';
  if (c.includes('clear') && !isDay)  return 'night';
  if (c.includes('clear'))           return 'sunny';
  if (c.includes('sunny') || c.includes('hot'))  return 'sunny';

  return 'default';
}

/* ---------- Particle generators ---------- */

function RainDrops() {
  const drops = useMemo(() =>
    Array.from({ length: 120 }, (_, i) => ({
      key: i,
      left: `${Math.random() * 100}%`,
      duration: `${0.35 + Math.random() * 0.4}s`,
      delay: `${Math.random() * 2}s`,
      height: `${14 + Math.random() * 16}px`,
      opacity: 0.3 + Math.random() * 0.5,
    })), []);

  return drops.map(d => (
    <div key={d.key} className="rain-drop" style={{
      left: d.left, animationDuration: d.duration,
      animationDelay: d.delay, height: d.height, opacity: d.opacity,
    }} />
  ));
}

function SnowFlakes() {
  const flakes = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      key: i,
      left: `${Math.random() * 100}%`,
      size: `${4 + Math.random() * 8}px`,
      duration: `${3 + Math.random() * 4}s`,
      delay: `${Math.random() * 4}s`,
      opacity: 0.5 + Math.random() * 0.5,
    })), []);

  return flakes.map(f => (
    <div key={f.key} className="snowflake" style={{
      left: f.left, width: f.size, height: f.size,
      animationDuration: f.duration, animationDelay: f.delay, opacity: f.opacity,
    }} />
  ));
}

function CloudBlobs() {
  const clouds = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      key: i,
      top: `${5 + Math.random() * 55}%`,
      width: `${250 + Math.random() * 400}px`,
      height: `${100 + Math.random() * 180}px`,
      duration: `${18 + Math.random() * 22}s`,
      delay: `${-Math.random() * 18}s`,
      opacity: 0.06 + Math.random() * 0.08,
    })), []);

  return clouds.map(cl => (
    <div key={cl.key} className="cloud-blob" style={{
      top: cl.top, width: cl.width, height: cl.height,
      animationDuration: cl.duration, animationDelay: cl.delay, opacity: cl.opacity,
    }} />
  ));
}

function FogLayers() {
  const layers = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      key: i,
      top: `${10 + i * 16}%`,
      duration: `${16 + Math.random() * 10}s`,
      delay: `${-Math.random() * 8}s`,
      opacity: 0.15 + Math.random() * 0.15,
    })), []);

  return layers.map(l => (
    <div key={l.key} className="fog-layer" style={{
      top: l.top, animationDuration: l.duration,
      animationDelay: l.delay, opacity: l.opacity,
    }} />
  ));
}

function Stars() {
  const stars = useMemo(() =>
    Array.from({ length: 100 }, (_, i) => ({
      key: i,
      top: `${Math.random() * 80}%`,
      left: `${Math.random() * 100}%`,
      size: `${1 + Math.random() * 3}px`,
      duration: `${1.5 + Math.random() * 3}s`,
      delay: `${Math.random() * 5}s`,
    })), []);

  return stars.map(s => (
    <div key={s.key} className="star" style={{
      top: s.top, left: s.left, width: s.size, height: s.size,
      animationDuration: s.duration, animationDelay: s.delay,
    }} />
  ));
}

/* ---------- Main Wrapper ---------- */

export default function BackgroundWrapper({ condition, isDay = true, children }) {
  const theme = getWeatherTheme(condition, isDay);

  const particles = {
    rainy:        <><RainDrops /><CloudBlobs /></>,
    thunderstorm: <><RainDrops /><div className="lightning-flash" /></>,
    snowy:        <SnowFlakes />,
    cloudy:       <CloudBlobs />,
    misty:        <FogLayers />,
    night:        <Stars />,
    sunny:        null,
    default:      null,
  };

  return (
    <div className="weather-bg">
      {/* Background image */}
      <div className={`weather-bg-image bg-${theme}`} />
      {/* Overlay */}
      <div className={`weather-bg-overlay overlay-${theme}`} />
      {/* Particles */}
      <div className="weather-bg-particles">
        {particles[theme]}
      </div>
      {/* Content */}
      <div className="weather-bg-content">
        {children}
      </div>
    </div>
  );
}
