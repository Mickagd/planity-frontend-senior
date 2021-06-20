import React from 'react';

import './Calendar.css';

const Calendar = () => {
  // Range from 9am to 9pm
  const calendarTime = [...Array(21 - 9).keys()].map((key) => `${key + 9}:00`);

  return (
    <div className="wrapper">
      {calendarTime.map((key) => (
        <div
          key={key}
          className="hour_wrapper"
        >
          <p className="hour">{key}</p>
        </div>
      ))}
    </div>
  );
};

export default Calendar;