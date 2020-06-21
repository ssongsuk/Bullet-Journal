import React, { Component } from "react";
import MonthCalendar from "./MonthCalendar";
import styled, { css } from "styled-components";
import arrowLeft from "./../assets/icons/arrow_left.svg";

const Title = styled.div`
  span {
    padding: 0 0.5rem;
  }
`;

const MonthControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  h1 {
    user-select: none;
    margin-top: 0;
    transition: transform 0.1s;
    &:hover {
      cursor: pointer;
      transform: translateY(-5%);
    }
  }
`;

const MonthCalendarWrapper = styled.span`
  text-align: center;
  > span {
    position: relative;
  }
`;

const Arrow = styled.img`
  width: 52px;
  height: auto;
  margin: 0 1.5rem;
  user-select: none;
  transition: transform 0.1s;
  ${(props) =>
    props.flip &&
    css`
      transform: scaleX(-1);
    `}

  &:hover {
    cursor: pointer;
    ${(props) =>
      props.flip
        ? css`
            transform: translateX(4px) scaleX(-1);
          `
        : css`
            transform: translateX(-4px);
          `}
  }
`;

/**
 * Header of the application. Month can be selected here.
 */
class MonthHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Display month selection
      showMonthCalendar: false,
    };
  }

  render() {
    return (
      <header>
        {/* Application title */}
        <Title>
          <span>Bullet Journal</span> || <span>{this.props.year}</span>
        </Title>
        <MonthControls>
          <span>
            {/* Arrow Left */}
            <Arrow
              src={arrowLeft}
              onClick={(evnt) => {
                let newMonth = this.props.month - 1;
                let newYear = this.props.year;
                if (newMonth < 0) {
                  newYear -= 1;
                  newMonth = 11;
                }
                this.props.onChangeMonth(newMonth, newYear);
              }}
            />
          </span>
          {/* Central headline and month calendar */}
          <MonthCalendarWrapper>
            <h1
              onClick={() => {
                this.setState({
                  showMonthCalendar: !this.state.showMonthCalendar,
                });
              }}
            >
              {this.getMonthName(this.props.month)}
            </h1>
            <span>
              {this.state.showMonthCalendar && (
                <MonthCalendar
                  onMonthSelect={(month) => {
                    this.props.onChangeMonth(month, this.props.year);
                    this.setState({
                      showMonthCalendar: false,
                    });
                  }}
                />
              )}
            </span>
          </MonthCalendarWrapper>
          <span>
            {/* Arrow Right */}
            <Arrow
              flip="true"
              src={arrowLeft}
              onClick={(evnt) => {
                let newMonth = this.props.month + 1;
                let newYear = this.props.year;
                if (newMonth > 11) {
                  newYear += 1;
                  newMonth = 0;
                }
                this.props.onChangeMonth(newMonth, newYear);
              }}
            />
          </span>
        </MonthControls>
      </header>
    );
  }

  /**
   * Takes the id of the month and returns the string name.
   * @param {Number} month
   * @returns {String} monthName
   */
  getMonthName(month) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return months[month];
  }
}

export default MonthHeader;
