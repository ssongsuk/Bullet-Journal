import React, { Component } from "react";
import BulletPoint from "./BulletPoint";
import styled from "styled-components";

const IndentDiv = styled.div`
  margin-left: ${(props) => props.indent * 2}em;
`;

const DateHeadline = styled.div`
  margin: 0.2rem 0;
  line-height: 1.2rem;
  display: flex;
  &:hover {
    cursor: pointer;
  }

  div:first-child {
    font-weight: bold;
    margin-right: 1rem;
  }
  div:last-child {
    color: #888;
  }
`;

const Spacer = styled.div`
  height: 1rem;
`;

const AddBulletContainer = styled.div`
  width: 250px;
  height 12px;
  padding-top: 0.5rem;
  padding-bottom: 1rem;
  opacity: 0;
  transition: opacity 0.3s, height 0.3s;
  display: flex;
  align-items: flex-end;
  color: #888;

  &:hover {
    cursor: pointer;
    opacity: 1;
    height: 24px;
  }

  span:last-child {
    height: 100%;
    width: 250px;
    border-bottom: 1px solid #888;
    margin-left: 0.5rem;
  }
`;

/**
 * Displays one day of a month with all bullet points.
 * Handles the edit, add and delete of bullet points.
 */
class DayView extends Component {
  // ------------------------------------------------- //
  // --- Component Lifecycle Methods ----------------- //
  // ------------------------------------------------- //

  constructor(props) {
    super(props);

    this.state = {
      // Id of the bullet point, which is currently edited
      editPoint: 0,
      // Create new bullet point data
      newBullet: {
        _id: "new",
        type: "NOTE",
        indent: 0,
      },
    };

    // Reference to the bullet point input which is currently in edit mode
    this.editPointRef = React.createRef();
    // Reference to the input of the new bullet
    this.newPointRef = React.createRef();
  }

  render() {
    // Show loading progress
    if (!this.props.dayObject.loaded) {
      return <div>is loading...</div>;
    }

    // Assamble current day string
    let day = this.props.dayObject.day;
    if (day < 10) day = `0${day}`;
    let month = this.props.month;
    if (month < 10) month = `0${month}`;
    let dateString = `${day}.${month}.${this.props.year}`;

    // Get weekday of the given date
    let date = new Date(this.props.year, month, day);
    let weekDay = this.weekDayString(date.getDay());

    return (
      <section id={"day-" + this.props.dayObject.day}>
        {/* Date headline */}
        <DateHeadline
          onClick={() => {
            this.props.onSetActive();
          }}
        >
          <div>{dateString}</div>
          <div>{weekDay}</div>
        </DateHeadline>

        {/* Display all bullet points */}
        {this.props.dayObject.bulletPoints.map((elem) => {
          return (
            <IndentDiv indent={elem.indent} key={elem._id}>
              <BulletPoint
                type={elem.type}
                value={elem.value}
                checked={elem.checked}
                canDelete={true}
                inputRef={this.editPointRef}
                editMode={this.state.editPoint === elem._id}
                onCheck={(checked) => {
                  // Callback, when checkbox of TASK type was checked or unchecked
                  let bulletPoint = elem;
                  elem.checked = checked;
                  this.props.onUpdateBulletPoint(bulletPoint);
                }}
                onEditMode={(on) => {
                  // Callback, when edit mode was activated or cancelled
                  if (on) {
                    // Start edit mode of current point
                    this.setState({ editPoint: elem._id }, () => {
                      this.editPointRef.current.value = elem.value;
                      this.editPointRef.current.focus();
                    });
                  } else {
                    // Exit edit mode
                    this.setState({ editPoint: 0 });
                  }
                }}
                onInputKey={(keyEvent) => {
                  // Key was pressed in input field
                  this.onInputKey(keyEvent, elem);
                }}
                onInputChange={(value) => {
                  // Input field value was changed
                  this.onInputChange(value, elem);
                }}
                onDelete={() => {
                  // Callback when the bullet point should be deleted
                  this.props.onDeleteBulletPoint(elem);
                  this.setState({
                    editPoint: 0,
                  });
                }}
              />
            </IndentDiv>
          );
        })}

        {/* Add new bullet point at the end */}
        {this.props.active && this.state.editPoint === 0 ? (
          <IndentDiv indent={this.state.newBullet.indent}>
            <BulletPoint
              type={this.state.newBullet.type}
              inputRef={this.newPointRef}
              editMode={true}
              onCheck={() => {}}
              onEditMode={() => {}}
              onInputKey={(keyEvent) => {
                this.onInputKeyNewBullet(keyEvent, this.state.newBullet);
              }}
              onInputChange={(value) => {
                this.onInputChange(value, this.state.newBullet);
              }}
            />
            <Spacer />
          </IndentDiv>
        ) : (
          <div>
            {/* Button to add new bullet point */}
            <AddBulletContainer
              onClick={() => {
                this.props.onSetActive();
              }}
            >
              <span>-</span> {/* Bullet point preview */}
              <span></span> {/* Input line preview */}
            </AddBulletContainer>
          </div>
        )}
      </section>
    );
  }

  // ------------------------------------------------- //

  /**
   * Handles key presses on the input field.
   * on Enter: Submit the bullet point data
   * on Tab: Increase/Decrease the indentation
   * on Backspace: Decrease the indentation, if field is empty
   *
   * @param {Event} evnt
   * @param {Object} bulletPoint
   */
  onInputKey(evnt, bulletPoint) {
    if (evnt.key === "Enter" && this.editPointRef.current.value !== "") {
      // Update the bullet point on enter
      bulletPoint.value = this.editPointRef.current.value;
      this.props.onUpdateBulletPoint(bulletPoint);
      this.setState({ editPoint: 0 });
    } else if (evnt.key === "Tab") {
      // Increase the indentation. If shift was pressed simultaniously, decrease the indentation
      evnt.preventDefault();
      let indent = bulletPoint.indent;
      if (evnt.shiftKey) {
        indent = Math.max(0, indent - 1);
      } else {
        indent = Math.min(4, indent + 1);
      }

      bulletPoint.indent = indent;
      this.props.onUpdateBulletPoint(bulletPoint);
    } else if (
      evnt.key === "Backspace" &&
      this.editPointRef.current.value === ""
    ) {
      // Decrease the indentation, if the value is empty
      let indent = bulletPoint.indent;
      bulletPoint.indent = Math.max(0, indent - 1);
      this.props.onUpdateBulletPoint(bulletPoint);
    }
  }

  /**
   * Handles key presses on the input field of the new bullet point.
   * on Enter: Create the new bullet point
   * on Tab: Increase/Decrease the indentation
   * on Backspace: Decrease the indentation, if field is empty
   *
   * @param {Event} evnt
   * @param {Object} bulletPoint
   */
  onInputKeyNewBullet(evnt, bulletPoint) {
    if (evnt.key === "Enter" && this.newPointRef.current.value !== "") {
      // Update the bullet point on enter
      bulletPoint.value = this.newPointRef.current.value;
      this.props.onAddBulletPoint({
        value: bulletPoint.value,
        type: bulletPoint.type,
        indent: bulletPoint.indent,
        checked: false,
      });
      this.newPointRef.current.value = "";
    } else if (evnt.key === "Tab") {
      // Increase the indentation. If shift was pressed simultaniously, decrease the indentation
      evnt.preventDefault();
      let indent = bulletPoint.indent;
      if (evnt.shiftKey) {
        indent = Math.max(0, indent - 1);
      } else {
        indent = Math.min(4, indent + 1);
      }

      bulletPoint.indent = indent;
      this.setState({
        newBullet: bulletPoint,
      });
    } else if (
      evnt.key === "Backspace" &&
      this.newPointRef.current.value === ""
    ) {
      // Decrease the indentation, if the value is empty
      let indent = bulletPoint.indent;
      bulletPoint.indent = Math.max(0, indent - 1);

      this.setState({
        newBullet: bulletPoint,
      });
    }
  }

  /**
   * Handle text change of the currently edited bullet point.
   * If the first character matches a bullet type (-,#,*),
   * the type of the bullet will be updated.
   *
   * @param {String} value
   * @param {Object} bulletPoint
   */
  onInputChange(value, bulletPoint) {
    let first = value.charAt(0);

    // Check, if the first character matches a bullet type
    if (first === "-" || first === "#" || first === "*") {
      let type = bulletPoint.type;
      if (first === "-") {
        type = "NOTE";
      } else if (first === "#") {
        type = "TASK";
      } else if (first === "*") {
        type = "EVENT";
      }

      bulletPoint.type = type;

      // Update the bulelt point
      if (bulletPoint._id === "new") {
        this.setState(
          {
            newBullet: bulletPoint,
          },
          () => {
            // Replace the value and move the cursor to the first position
            value = value.replace(first, "");
            this.newPointRef.current.value = value;
            this.newPointRef.current.selectionStart = 0;
            this.newPointRef.current.selectionEnd = 0;
          }
        );
      } else {
        // Replace the value and move the cursor to the first position
        value = value.replace(first, "");
        this.editPointRef.current.value = value;
        this.editPointRef.current.selectionStart = 0;
        this.editPointRef.current.selectionEnd = 0;
        this.props.onUpdateBulletPoint(bulletPoint);
      }
    }
  }

  /**
   * Returns the string name of a given weekday number.
   *
   * @param {Number} weekDay
   */
  weekDayString(weekDay) {
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return weekDays[weekDay];
  }
}

export default DayView;
