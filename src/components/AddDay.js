import React, { Component } from "react";
import styled from "styled-components";

const AddDayContainer = styled.div`
  margin-bottom: 2rem;
  height: 1.5rem;
`;

const AddDayButton = styled.span`
  user-select: none;
  border: 1px solid #888;
  text-align: center;
  padding: 6px 32px;
  position: relative;
  overflow: hidden;
  transition: 0.3s;
  &:after {
    position: absolute;
    transition: 0.2s;
    content: "";
    width: 0;
    left: 50%;
    bottom: 0;
    height: 1px;
    background: black;
  }

  &:hover {
    cursor: pointer;
    &:after {
      width: 100%;
      left: 0;
    }
  }
`;

const AddButton = styled(AddDayButton)`
  padding: 2px 16px;
  margin-left: 1.5rem;
`;

const DayInput = styled.input`
  border: none;
  outline: none;
  border-bottom: 1px solid black;
  font-size: 1.5rem;
  line-height: 1.5rem;
  font-family: "Caveat", cursive;
  width: 30px;
`;

const ErrorMessage = styled.span`
  color: red;
  margin-left: 2rem;
`;

/**
 * Controls to add a day to the month.
 */
class AddDay extends Component {
  // ------------------------------------------------- //
  // --- Component Lifecycle Methods ----------------- //
  // ------------------------------------------------- //

  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      errorMessage: "",
    };

    this.inputRef = React.createRef();
  }

  render() {
    if (this.state.editMode) {
      // Display input field for the date
      return (
        <AddDayContainer>
          {/* Input field to enter day */}
          <DayInput
            ref={this.inputRef}
            onBlur={() => {
              if (this.inputRef.current.value === "") {
                this.setState({ editMode: false, errorMessage: "" });
              }
            }}
            onKeyPress={(keyEvnt) => {
              if (keyEvnt.key === "Enter") {
                if (
                  this.validateDay(
                    this.inputRef.current.value,
                    this.props.month,
                    this.props.year
                  )
                ) {
                  this.props.onAddDay(parseInt(this.inputRef.current.value));
                  this.setState({ editMode: false, errorMessage: "" });
                }
              }
            }}
          />
          .{/* Display current month */}
          <span>
            {this.props.month < 10 ? "0" + this.props.month : this.props.month}
          </span>
          .{/* Display current year */}
          <span>{this.props.year}</span>
          <span>
            {/* Display add button to submit */}
            <AddButton
              onMouseDown={() => {
                if (
                  this.validateDay(
                    this.inputRef.current.value,
                    this.props.month,
                    this.props.year
                  )
                ) {
                  this.props.onAddDay(parseInt(this.inputRef.current.value));
                  this.setState({ editMode: false, errorMessage: "" });
                }
              }}
            >
              Add
            </AddButton>
            <ErrorMessage>{this.state.errorMessage}</ErrorMessage>
          </span>
        </AddDayContainer>
      );
    } else {
      // Display add button
      return (
        <AddDayContainer>
          <AddDayButton
            onClick={() => {
              this.setState({ editMode: true }, () => {
                this.inputRef.current.focus();
              });
            }}
          >
            Add Day
          </AddDayButton>
        </AddDayContainer>
      );
    }
  }

  // ------------------------------------------------- //

  /**
   * Validates input for a new day
   *
   * @param {String} day
   * @param {Number} month
   * @param {Number} year
   */
  validateDay(day, month, year) {
    // Check if input string is empty
    if (day === "") {
      this.setState({ errorMessage: "Please enter a day" });
      return false;
    }

    // Check if input string is a valid number
    let intDay = parseInt(day);
    if (isNaN(intDay)) {
      this.setState({ errorMessage: "Please enter a valid number" });
      return false;
    }

    // Check if date is greater than 0
    if (intDay <= 0) {
      this.setState({ errorMessage: `The day has to be greater than 0` });
      return false;
    }

    // Check if date is in this month
    let numDays = new Date(year, month + 1, 0).getDate();
    if (intDay > numDays) {
      this.setState({ errorMessage: `This month only has ${numDays} days` });
      return false;
    }
    return true;
  }
}

export default AddDay;
