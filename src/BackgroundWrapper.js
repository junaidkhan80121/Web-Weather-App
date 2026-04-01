import React, { useMemo } from 'react';
import './BackgroundWrapper.css';

/**
 * Maps the weather condition text from the API to one of our
 * supported background themes.
 */
function getWeatherTheme(conditionText) {
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
  if (c.includes('clear'))                           return 'sunny';
  if (c.includes('sunny') || c.includes('hot'))      return 'sunny';

  return 'default';
}

/* ---------- particle generators ---------- */

function RainDrops() {
  const drops = useMemo(() =>
    Array.from({ length: 150 }, (_, i) => ({
      key: i,
      left:     `${Math.random() * 100}%`,
      duration: `${0.4 + Math.random() * 0.5}s`,
      delay:    `${Math.random() * 2}s`,
      height:   `${16 + Math.random() * 18}px`,
      opacity:  0.5 + Math.random() * 0.5,
    })), []);

  return (
    <>
      {drops.map(d => (
        <div
          key={d.key}
          className="rain-drop"
          style={{
            left: d.left,
            animationDuration: d.duration,
            animationDelay: d.delay,
            height: d.height,
            opacity: d.opacity,
          }}
        />
      ))}
      <div className="rain-splash" />
    </>
  );
}

function SnowFlakes() {
  const flakes = useMemo(() =>
    Array.from({ length: 100 }, (_, i) => ({
      key: i,
      left:     `${Math.random() * 100}%`,
      size:     `${5 + Math.random() * 10}px`,
      duration: `${2.5 + Math.random() * 4}s`,
      delay:    `${Math.random() * 4}s`,
      opacity:  0.6 + Math.random() * 0.4,
    })), []);

  return flakes.map(f => (
    <div
      key={f.key}
      className="snowflake"
      style={{
        left: f.left,
        width: f.size,
        height: f.size,
        animationDuration: f.duration,
        animationDelay: f.delay,
        opacity: f.opacity,
      }}
    />
  ));
}

function Clouds() {
  const clouds = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      key: i,
      top:      `${5 + Math.random() * 60}%`,
      width:    `${300 + Math.random() * 500}px`,
      height:   `${120 + Math.random() * 200}px`,
      duration: `${15 + Math.random() * 25}s`,
      delay:    `${-Math.random() * 20}s`,
      opacity:  0.4 + Math.random() * 0.35,
    })), []);

  return clouds.map(cl => (
    <div
      key={cl.key}
      className="cloud"
      style={{
        top: cl.top,
        width: cl.width,
        height: cl.height,
        animationDuration: cl.duration,
        animationDelay: cl.delay,
        opacity: cl.opacity,
      }}
    />
  ));
}

function FogLayers() {
  const layers = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      key: i,
      top:      `${10 + i * 15}%`,
      duration: `${14 + Math.random() * 12}s`,
      delay:    `${-Math.random() * 10}s`,
      opacity:  0.4 + Math.random() * 0.35,
    })), []);

  return layers.map(l => (
    <div
      key={l.key}
      className="fog-layer"
      style={{
        top: l.top,
        animationDuration: l.duration,
        animationDelay: l.delay,
        opacity: l.opacity,
      }}
    />
  ));
}

function Stars() {
  const stars = useMemo(() =>
    Array.from({ length: 120 }, (_, i) => ({
      key: i,
      top:      `${Math.random() * 85}%`,
      left:     `${Math.random() * 100}%`,
      size:     `${1 + Math.random() * 4}px`,
      duration: `${1.5 + Math.random() * 3}s`,
      delay:    `${Math.random() * 5}s`,
    })), []);

  return stars.map(s => (
    <div
      key={s.key}
      className="star"
      style={{
        top: s.top,
        left: s.left,
        width: s.size,
        height: s.size,
        animationDuration: s.duration,
        animationDelay: s.delay,
      }}
    />
  ));
}

/* ---------- main wrapper ---------- */

export default function BackgroundWrapper({ condition, children }) {
  const theme = getWeatherTheme(condition);

  return (
    <div className={`weather-bg ${theme}`}>
      {/* conditional particles */}
      {theme === 'sunny'       && <><div className="sun-orb" /><div className="sun-ray" /></>}
      {theme === 'rainy'       && <RainDrops />}
      {theme === 'thunderstorm' && <><RainDrops /><div className="lightning" /></>}
      {theme === 'snowy'       && <SnowFlakes />}
      {theme === 'cloudy'      && <Clouds />}
      {theme === 'misty'       && <FogLayers />}
      {theme === 'clear-night' && <Stars />}

      {/* app content above the background */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
}
