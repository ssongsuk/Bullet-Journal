import React, { Component } from "react";
import styled, { css } from "styled-components";
import colorYellow from "./../assets/icons/color_preview_yellow.svg";
import colorBlue from "./../assets/icons/color_preview_blue.svg";
import colorRed from "./../assets/icons/color_preview_red.svg";

const CalendarHeader = styled.div`
  h2 {
    margin: 0;
    margin-bottom: 0.8rem;
    font-size: 2rem;
  }
`;

const CalendarRow = styled.div`
  display: flex;
  div {
    box-sizing: border-box;
    width: 38px;
    height: 38px;
    text-align: center;
  }
`;

const CalendarDay = styled.div`
  background-color: ${(props) => props.moodColor};
  border-bottom: 1px solid black;
  border-right: 1px solid black;

  ${(props) =>
    props.borderLeft &&
    css`
      border-left: 1px solid black;
    `}

    ${(props) =>
      props.borderTop &&
      css`
        border-top: 1px solid black;
      `}

  ${(props) =>
    props.active === false &&
    css`
      visibility: hidden;
    `}

  &:hover {
    cursor: pointer;
  }
`;

const Mood = styled.div`
  div {
    display: flex;
    img {
      width: 32px;
      height: auto;
    }
    span {
      margin-left: 0.5rem;
    }
  }
`;

/**
 * The MoodCalender tracks and displays the mood for every day of the month.
 */
class MoodCalendar extends Component {
  moodColors = ["#fff", "#fcff68", "#a0c6ff", "#e63a79"];

  // ------------------------------------------------- //
  // --- Component Lifecycle Methods ----------------- //
  // ------------------------------------------------- //

  constructor(props) {
    super(props);

    this.state = {
      calendarRows: [],
      startDay: 0,
    };
  }

  componentDidMount() {
    this.createCalendar(this.props.month, this.props.year);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.month !== this.props.month ||
      prevProps.year !== this.props.year
    ) {
      this.createCalendar(this.props.month, this.props.year);
    }
  }

  render() {
    return (
      <div>
        <CalendarHeader>
          <h2>Moodcalendar</h2>
        </CalendarHeader>
        {/* Headline with day legend */}
        <CalendarRow>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
          <div>S</div>
        </CalendarRow>
        {/* Iterate rows of the calendar grid */}
        {this.state.calendarRows.map((row, rowIndex) => {
          return (
            <CalendarRow key={rowIndex}>
              {/* Iterate Colums of the calendar grid */}
              {row.map((day, dayIndex) => {
                // Calculate the current day of the month, offsetted by the start day
                let cell = rowIndex * 7 + dayIndex;
                let dayOfMonth = cell - this.state.startDay;
                let mood = 0;
                // Get mood from the props
                if (dayOfMonth >= 0 && dayOfMonth < this.props.mood.length) {
                  mood = this.props.mood[dayOfMonth];
                }

                // Render one calendar cell
                return (
                  <CalendarDay
                    key={rowIndex + "," + dayIndex}
                    borderLeft={true}
                    borderTop={true}
                    active={day.active}
                    moodColor={this.moodColors[mood]}
                    onClick={() => {
                      // Update the mood on click
                      mood = (mood + 1) % 4;
                      this.props.onMoodUpdate(dayOfMonth, mood);
                    }}
                  ></CalendarDay>
                );
              })}
            </CalendarRow>
          );
        })}
        <Mood>
          <div>
            <img src={colorYellow} /> <span>good / joyful</span>
          </div>
          <div>
            <img src={colorBlue} /> <span>average / normal</span>
          </div>
          <div>
            <img src={colorRed} /> <span>bad / grumpy</span>
          </div>
        </Mood>
      </div>
    );
  }

  // ------------------------------------------------- //

  /**
   * Creates the calendar grid an saves the rows to the state
   *
   * @param {Number} month
   * @param {Number} year
   */
  createCalendar(month, year) {
    let currentMonth = this.props.month;
    let currentYear = this.props.year;

    // Determine number of days of the current month
    let numDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    let startDay = new Date(currentYear, currentMonth, 1).getDay() - 1;

    // Setup the rows and columns to dispaly the calendar
    let calendarRows = [];
    for (let y = 0; y < 6; ++y) {
      // Iterate rows
      calendarRows.push([]);
      for (let x = 0; x < 7; ++x) {
        // Iterate Columns
        // Determine the index in the grid
        let dayIndex = y * 7 + x;
        // Offset the index by the start weekday
        let dayOfMonth = dayIndex - startDay;

        calendarRows[y].push({
          // Set active, if the current day is in the bounds of the month
          active: dayOfMonth >= 0 && dayOfMonth < numDays,
        });
      }
    }

    this.setState({
      calendarRows,
      startDay,
    });
  }
}

export default MoodCalendar;
