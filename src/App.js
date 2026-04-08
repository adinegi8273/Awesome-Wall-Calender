import React, { useState, useCallback, useRef } from 'react';
import './App.css';

// ─── Constants ──────────────────────────────────────────────────────────────────

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const DAY_HEADERS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=80',
  'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=900&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&q=80',
  'https://images.unsplash.com/photo-1476370648495-3533f64427a2?w=900&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=80',
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=900&q=80',
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=80',
  'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=900&q=80',
  'https://images.unsplash.com/photo-1444930694458-01babf71870c?w=900&q=80',
  'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=900&q=80',
];

// ─── Date helpers ────────────────────────────────────────────────────────────────

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayMon(year, month) {
  const raw = new Date(year, month, 1).getDay(); 
  return (raw + 6) % 7; 
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

function isBetween(date, a, b) {
  if (!a || !b) return false;
  const [lo, hi] = a < b ? [a, b] : [b, a];
  return date > lo && date < hi;
}

function dateKey(d) {
  if (!d) return '';
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// ─── Nail component ──────────────────────────────────────────────────────────────

function WallNail() {
  return (
    <div className="wc-nail-wrap" aria-hidden="true">
      <div className="wc-nail">
        <div className="wc-nail-head" />
        <div className="wc-nail-shank" />
      </div>
    </div>
  );
}

// ─── Spiral binding ───────────────────────────────────────────────────────────────

function SpiralBinding({ count = 22 }) {
  return (
    <div className="wc-spiral" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="wc-coil" />
      ))}
    </div>
  );
}

// ─── Blue chevron SVG ────────────────────────────────────────────────────────────

function ChevronShape({ year, month }) {
  return (
    <>
      <svg
        className="wc-chevron"
        viewBox="0 0 600 90"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <polygon points="0,90 0,40 220,90" fill="#34b4df" />
        <polygon points="140,90 340,10 600,10 600,90" fill="#1da1d6" />
      </svg>
      <div className="wc-hero-label" aria-label={`${MONTHS[month]} ${year}`}>
        <span className="wc-label-year">{year}</span>
        <span className="wc-label-month">{MONTHS[month]}</span>
      </div>
    </>
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────────

function HeroSection({ year, month, onPrev, onNext }) {
  return (
    <div className="wc-hero">
      <img
        className="wc-hero-img"
        src={HERO_IMAGES[month]}
        alt={`${MONTHS[month]} scenery`}
      />
      <button className="wc-nav wc-nav--prev" onClick={onPrev} aria-label="Previous month">
        &#8249;
      </button>
      <button className="wc-nav wc-nav--next" onClick={onNext} aria-label="Next month">
        &#8250;
      </button>
      <ChevronShape year={year} month={month} />
    </div>
  );
}

// ─── Calendar grid ────────────────────────────────────────────────────────────────

function buildCells(year, month) {
  const daysThis  = getDaysInMonth(year, month);
  const offset    = getFirstDayMon(year, month);          

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear  = month === 0 ? year - 1 : year;
  const daysPrev  = getDaysInMonth(prevYear, prevMonth);

  const cells = [];

  for (let i = offset - 1; i >= 0; i--) {
    cells.push({ day: daysPrev - i, month: prevMonth, year: prevYear, overflow: true });
  }

  for (let d = 1; d <= daysThis; d++) {
    cells.push({ day: d, month, year, overflow: false });
  }

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear  = month === 11 ? year + 1 : year;
  const remainder = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remainder; d++) {
    cells.push({ day: d, month: nextMonth, year: nextYear, overflow: true });
  }

  return cells;
}

function CalendarGrid({ year, month, rangeStart, rangeEnd, hoveredDate, selectingEnd, notes, holidays, today, onDayClick, onDayEnter, onDayLeave }) {
  const cells = buildCells(year, month);

  return (
    <div className="wc-grid-col" role="grid" aria-label={`${MONTHS[month]} ${year}`}>
      <div className="wc-dheaders" role="row">
        {DAY_HEADERS.map((d, i) => (
          <div key={d} className={`wc-dheader${i >= 5 ? ' wc-weekend-hdr' : ''}`} role="columnheader">
            {d}
          </div>
        ))}
      </div>

      <div className="wc-days-grid">
        {cells.map((cell, idx) => {
          const date     = new Date(cell.year, cell.month, cell.day);
          const col      = idx % 7;
          const isWeekend = col === 5 || col === 6;

          const isStart   = !cell.overflow && isSameDay(date, rangeStart);
          const isEnd     = !cell.overflow && isSameDay(date, rangeEnd);
          const inRange   = !cell.overflow && rangeStart && rangeEnd ? isBetween(date, rangeStart, rangeEnd) : false;
          const previewEnd = !cell.overflow && selectingEnd && hoveredDate && isSameDay(date, hoveredDate) && !isSameDay(hoveredDate, rangeStart);
          const previewMid = !cell.overflow && selectingEnd && rangeStart && hoveredDate ? isBetween(date, rangeStart, hoveredDate) : false;
          const isToday   = isSameDay(date, today);
          const hasNote   = !cell.overflow && !!notes[dateKey(date)];
          const isHoliday = !cell.overflow && !!holidays[dateKey(date)];

          const classes = [
            'wc-day-inner',
            cell.overflow                 ? 'wc-overflow'    : '',
            isWeekend && !cell.overflow   ? 'wc-weekend'     : '',
            isWeekend && cell.overflow    ? 'wc-weekend wc-overflow' : '',
            isStart                       ? 'wc-start'       : '',
            isEnd                         ? 'wc-end'         : '',
            !isStart && !isEnd && inRange ? 'wc-in-range'    : '',
            previewMid                    ? 'wc-preview-mid' : '',
            previewEnd                    ? 'wc-preview-end' : '',
            isToday                       ? 'wc-today'       : '',
            isHoliday                     ? 'wc-holiday'     : '',
          ].filter(Boolean).join(' ');

          return (
            <div key={idx} className="wc-day-cell">
              <div
                className={classes}
                onClick={() => !cell.overflow && onDayClick(date)}
                onMouseEnter={() => !cell.overflow && onDayEnter(date)}
                onMouseLeave={onDayLeave}
                role={cell.overflow ? 'presentation' : 'button'}
                tabIndex={cell.overflow ? -1 : 0}
                aria-label={cell.overflow ? undefined : `${MONTHS[cell.month]} ${cell.day}, ${cell.year}`}
                onKeyDown={(e) => !cell.overflow && e.key === 'Enter' && onDayClick(date)}
              >
                {cell.day}
                {hasNote && <span className="wc-note-dot" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Notes column ─────────────────────────────────────────────────────────────────

const LINE_COUNT = 5; // Reduced slightly to make room for the holiday button

function NotesColumn({ noteText, onNoteChange, rangeStart, rangeEnd, isHoliday, onToggleHoliday }) {
  let statusText = '';
  if (rangeStart && rangeEnd) {
    statusText = `${MONTHS[rangeStart.getMonth()]} ${rangeStart.getDate()} → ${MONTHS[rangeEnd.getMonth()]} ${rangeEnd.getDate()}`;
  } else if (rangeStart) {
    statusText = `${MONTHS[rangeStart.getMonth()]} ${rangeStart.getDate()} selected`;
  }

  // Only show the holiday toggle if a single valid date is selected (no range active)
  const canToggleHoliday = rangeStart && !rangeEnd;

  return (
    <div className="wc-notes-col">
      <div className="wc-notes-heading">Notes</div>

      <div className="wc-notes-lines">
        {Array.from({ length: LINE_COUNT }).map((_, i) => (
          <div key={i} className="wc-note-line" />
        ))}
        <textarea
          className="wc-notes-textarea"
          value={noteText}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder={rangeStart ? 'Type your note…' : 'Select a date…'}
          rows={LINE_COUNT}
          aria-label="Notes for selected date"
          disabled={!rangeStart}
        />
      </div>

      <div className="wc-range-status" aria-live="polite">
        {statusText}
      </div>

      {/* Holiday Toggle Button */}
      <button 
        className={`wc-holiday-btn ${isHoliday ? 'active' : ''}`}
        disabled={!canToggleHoliday}
        onClick={onToggleHoliday}
        style={{ opacity: canToggleHoliday ? 1 : 0 }}
      >
        {isHoliday ? '★ Remove Holiday' : 'Mark as Holiday'}
      </button>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const today = useRef(new Date()).current;

  // View
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [flipKey,   setFlipKey]   = useState(0); // Used to trigger the flip animation

  // Range selection
  const [rangeStart,   setRangeStart]   = useState(null);
  const [rangeEnd,     setRangeEnd]     = useState(null);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [hoveredDate,  setHoveredDate]  = useState(null);

  // Notes & Holidays
  const [notes,    setNotes]    = useState({});
  const [noteText, setNoteText] = useState('');
  const [holidays, setHolidays] = useState({});

  // ── Navigation ────────────────────────────────────────────────────────────
  const goToPrev = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) { setViewYear((y) => y - 1); return 11; }
      return m - 1;
    });
    setFlipKey(k => k + 1);
  }, []);

  const goToNext = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) { setViewYear((y) => y + 1); return 0; }
      return m + 1;
    });
    setFlipKey(k => k + 1);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDayClick = useCallback((date) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date);
      setRangeEnd(null);
      setSelectingEnd(true);
      setNoteText(notes[dateKey(date)] || '');
    } else {
      const [s, e] = date < rangeStart ? [date, rangeStart] : [rangeStart, date];
      setRangeStart(s);
      setRangeEnd(e);
      setSelectingEnd(false);
      setNoteText(notes[dateKey(s)] || '');
    }
  }, [rangeStart, rangeEnd, notes]);

  const handleDayEnter  = useCallback((date) => setHoveredDate(date), []);
  const handleDayLeave  = useCallback(() => setHoveredDate(null), []);

  const handleNoteChange = useCallback((text) => {
    setNoteText(text);
    if (rangeStart) {
      setNotes((prev) => ({ ...prev, [dateKey(rangeStart)]: text }));
    }
  }, [rangeStart]);

  const toggleHoliday = useCallback(() => {
    if (rangeStart && !rangeEnd) {
      const key = dateKey(rangeStart);
      setHolidays(prev => ({ ...prev, [key]: !prev[key] }));
    }
  }, [rangeStart, rangeEnd]);

  const isCurrentSelectionHoliday = rangeStart && !rangeEnd && !!holidays[dateKey(rangeStart)];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="wc-scene">
      <WallNail />

      <div className="wc-card" role="main" aria-label="Wall Calendar">
        <SpiralBinding count={22} />
        
        {/* Wrapping the changing content with a key to trigger the flip animation */}
        <div className="wc-page-wrapper" key={flipKey}>
          <HeroSection
            year={viewYear}
            month={viewMonth}
            onPrev={goToPrev}
            onNext={goToNext}
          />

          <div className="wc-bottom">
            <NotesColumn
              noteText={noteText}
              onNoteChange={handleNoteChange}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              isHoliday={isCurrentSelectionHoliday}
              onToggleHoliday={toggleHoliday}
            />

            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              hoveredDate={hoveredDate}
              selectingEnd={selectingEnd}
              notes={notes}
              holidays={holidays}
              today={today}
              onDayClick={handleDayClick}
              onDayEnter={handleDayEnter}
              onDayLeave={handleDayLeave}
            />
          </div>
        </div>
      </div>
    </div>
  );
}