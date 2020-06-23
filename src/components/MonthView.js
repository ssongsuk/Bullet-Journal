import React, { Component } from "react";
import JournalApi from "./../api/JournalApi";
import DayView from "./DayView";
import AddDay from "./AddDay";
import MonthHeader from "./MonthHeader";
import MoodCalendar from "./MoodCalendar";
import styled from "styled-components";

const JournalHeader = styled.div`
  h2 {
    margin: 0;
    margin-bottom: 1.8rem;
    font-size: 2rem;
  }
`;

const MonthContainer = styled.div`
  padding: 1rem 2rem;
`;

const JournalColumns = styled.section`
  display: flex;
  margin-top: 1rem;
  div {
    &.left {
      flex: 2;
      height: 100%;
      padding-left: 12rem;
    }
    &.right {
      flex: 1;
    }
  }
`;

/**
 * The MonthView component renders all days and handles
 * the server synchronization
 */
class MonthView extends Component {
  // ------------------------------------------------- //
  // --- Component Lifecycle Methods ----------------- //
  // ------------------------------------------------- //

  constructor(props) {
    super(props);

    this.journalApi = new JournalApi();

    let today = new Date();

    this.state = {
      // Currently selected month
      selectedMonth: today.getMonth(),
      selectedYear: today.getFullYear(),
      // Month object from the server
      monthData: {
        _id: false,
        days: [],
        mood: [],
      },
      // Loading progress of all day data
      loadedDays: 0,
      numDays: 0,
      todayExists: false,
      // Bullet points can be added to the active day
      activeDay: today.getDate(),
    };
  }

  componentDidMount() {
    // Fetch the current month initially
    this.fetchMonth(
      this.state.selectedMonth,
      this.state.selectedYear,
      (result) => {
        this.onMonthFetched(result);
      }
    );
  }

  render() {
    return (
      <MonthContainer>
        {/* Header */}
        <MonthHeader
          month={this.state.selectedMonth}
          year={this.state.selectedYear}
          onChangeMonth={(newMonth, newYear) => {
            this.changeMonth(newMonth, newYear);
          }}
        />
        {/* Main body */}
        <JournalColumns>
          {/* Left column with day bullet-points */}
          <div className="left">
            <JournalHeader>
              <h2>Journal</h2>
            </JournalHeader>
            {/* Add day button */}
            <AddDay
              month={this.state.selectedMonth + 1}
              year={this.state.selectedYear}
              onAddDay={(day) => {
                this.addNewDay(day);
              }}
            />
            {/* List day components of current month */}
            {this.state.loadedDays >= this.state.numDays ? (
              this.state.monthData.days.map((day) => {
                return (
                  <DayView
                    active={this.state.activeDay === day.day}
                    key={day._id}
                    dayObject={day}
                    month={this.state.selectedMonth + 1}
                    year={this.state.selectedYear}
                    onSetActive={() => {
                      this.setState({
                        activeDay: day.day,
                      });
                    }}
                    onAddBulletPoint={(bulletPoint) => {
                      this.createBulletPoint(day, bulletPoint);
                    }}
                    onUpdateBulletPoint={(bulletPoint) => {
                      // Local Update
                      this.updateStateBulletPoint(day, bulletPoint);

                      // Server update
                      this.updateBulletPoint(day, bulletPoint);
                    }}
                    onDeleteBulletPoint={(bulletPoint) => {
                      // Local state update
                      this.deleteStateBulletPoint(day, bulletPoint);

                      // Server Update
                      this.deleteBulletPoint(day, bulletPoint);
                    }}
                  />
                );
              })
            ) : (
              <div>Loading day data...</div>
            )}
          </div>
          {/* Right column with mood calendar */}
          <div className="right">
            <MoodCalendar
              month={this.state.selectedMonth}
              year={this.state.selectedYear}
              mood={this.state.monthData.mood || []}
              onMoodUpdate={(day, mood) => {
                // Local state update
                let monthData = this.state.monthData;
                monthData.mood[day] = mood;
                this.setState({ monthData });

                // Server update
                this.updateMood(this.state.monthData._id, day, mood);
              }}
            />
          </div>
        </JournalColumns>
      </MonthContainer>
    );
  }

  // ------------------------------------------------- //

  // ------------------------------------------------- //
  // --- API communication  -------------------------- //
  // ------------------------------------------------- //

  /**
   * Fetches a month object from the server by month and year number.
   * If it does not exist on the server, create a new object.
   *
   * @param {Number} month
   * @param {Number} year
   * @param {Function} callBack
   */
  fetchMonth(month, year, callBack) {
    this.journalApi.fetchData(
      `months/${year}/${month}`,
      (result) => {
        // Success Callback
        // If requested month does not exist, create a new month object
        if (result.data === null) {
          let postData = {
            month,
            year,
          };
          this.journalApi.postData(
            `months`,
            postData,
            (result) => {
              let month = {
                _id: result.data._id,
                days: result.data.days.map((dayId) => {
                  return {
                    _id: dayId,
                    loaded: false,
                    day: -1,
                    bulletPoints: [],
                  };
                }),
                mood: result.data.mood,
              };
              callBack(month);
            },
            (err) => {
              console.error(err);
            }
          );
        } else {
          // Month already exists. Return the month

          // Check if mood array is valid and filled
          let mood = result.data.mood;
          if (!mood || mood.length === 0) {
            // Get number of days of selected month
            let numDays = new Date(
              result.data.year,
              result.data.month + 1,
              0
            ).getDate();
            mood = new Array(numDays).fill(0);
          }

          // Map the month object to match the local naming conventions and call the callback function
          let month = {
            _id: result.data._id,
            days: result.data.days.map((dayId) => {
              return {
                _id: dayId,
                loaded: false, // Day data is initially not loaded
                day: -1,
                bulletPoints: [],
              };
            }),
            mood,
          };
          callBack(month);
        }
      },
      (error) => {
        // Error callback
        console.error(error);
      }
    );
  }

  /**
   * Fetches a day object by ID from the server
   *
   * @param {String} dayId
   * @param {Function} callBack
   */
  fetchDayById(dayId, callBack) {
    this.journalApi.fetchData(
      `days/${dayId}`,
      (result) => {
        // Success Callback
        // Map bullet points to match the local naming conventions
        let bulletPoints = result.data.bullet_points.map((elem) => {
          return {
            _id: elem._id,
            value: elem.value,
            type: elem.bullet_type,
            indent: elem.indent,
            checked: elem.checked,
          };
        });

        let day = {
          _id: dayId,
          day: result.data.day,
          bulletPoints,
          loaded: true,
        };

        callBack(day);
      },
      (err) => {
        // Error callback
        console.error(err);
      }
    );
  }

  /**
   * Fetches a day object from the server by given date.
   *
   * @param {Number} day
   * @param {Number} month
   * @param {Number} year
   * @param {Function} callBack
   */
  fetchDayByDate(day, month, year, callBack) {
    this.journalApi.fetchData(`days/${day}/${month}/${year}`, (result) => {
      // Map bullet points to match the local naming conventions
      let bulletPoints = result.data.bullet_points.map((elem) => {
        return {
          _id: elem._id,
          value: elem.value,
          type: elem.bullet_type,
          indent: elem.indent,
          checked: elem.checked,
        };
      });

      let day = {
        _id: result.data._id,
        day: result.data.day,
        bulletPoints,
        loaded: true,
      };

      callBack(day);
    });
  }

  /**
   * Creates a new day object on the server.
   *
   * @param {String} monthId
   * @param {Number} day
   * @param {Function} callBack
   */
  createDay(monthId, day, callBack) {
    this.journalApi.postData(
      `months/${monthId}`,
      { day },
      (result) => {
        // Success callback
        let newDay = {
          _id: result.data._id,
          day: result.data.day,
          bulletPoints: [],
          loaded: true,
        };

        callBack(newDay);
      },
      (err) => {
        // Error callback
        console.error(err);
      }
    );
  }

  /**
   * Adds a new bullet point to an existing day on the server.
   *
   * @param {Object} day
   * @param {Object} bulletPoint
   * @param {Function} callBack
   */
  addBulletPoint(day, bulletPoint, callBack) {
    this.journalApi.postData(
      `days/${day._id}`,
      {
        value: bulletPoint.value,
        bullet_type: bulletPoint.type,
        checked: bulletPoint.checked,
        indent: bulletPoint.indent,
      },
      (result) => {
        // Success callback
        if (callBack) {
          // Call the callback with the newly added bullet point
          bulletPoint._id = result.data._id;
          callBack(bulletPoint);
        }
      },
      (err) => {
        // Error callback
        console.error(err);
      }
    );
  }

  /**
   * Updates an existing bullet point.
   *
   * @param {Object} day
   * @param {Object} bulletPoint
   * @param {Function} callBack
   */
  updateBulletPoint(day, bulletPoint, callBack) {
    this.journalApi.postData(
      `days/${day._id}/${bulletPoint._id}`,
      {
        value: bulletPoint.value,
        bullet_type: bulletPoint.type,
        checked: bulletPoint.checked,
        indent: bulletPoint.indent,
      },
      (result) => {
        // Success callback
        if (callBack) {
          callBack(bulletPoint);
        }
      },
      (err) => {
        // Error callback
        console.error(err);
      }
    );
  }

  /**
   * Deletes an existing bullet point.
   *
   * @param {Object} day
   * @param {Object} bulletPoint
   */
  deleteBulletPoint(day, bulletPoint) {
    this.journalApi.deleteById(`days/${day._id}`, bulletPoint._id);
  }

  /**
   * Updates the mood array of a given month
   *
   * @param {String} monthId
   * @param {Number} day
   * @param {Number} mood
   */
  updateMood(monthId, day, mood) {
    console.log(monthId);
    this.journalApi.postData(
      `months/mood/${monthId}`,
      {
        day,
        mood,
      },
      (result) => {},
      (err) => {
        console.error(err);
      }
    );
  }

  // ------------------------------------------------- //

  // ------------------------------------------------- //
  // --- Application Logic --------------------------- //
  // ------------------------------------------------- //

  /**
   * Changes the selected month locally and refreshes the month data.
   *
   * @param {Number} newMonth
   * @param {Number} newYear
   */
  changeMonth(newMonth, newYear) {
    // Reset current State
    this.setState(
      {
        monthData: {
          _id: false,
          days: [],
          mood: [],
        },
        loadedDays: 0,
        numDays: 0,
        selectedMonth: newMonth,
        selectedYear: newYear,
      },
      () => {
        // Fetch new selected month
        this.fetchMonth(newMonth, newYear, (month) => {
          this.onMonthFetched(month);
        });
      }
    );
  }

  /**
   * Loads all days when the month was fetched.
   * Adds a new day, if the current day does not exist.
   *
   * @param {Object} month
   */
  onMonthFetched(month) {
    let numDays = month.days.length;
    // Set the month state
    this.setState(
      {
        monthData: month,
        numDays,
        loadedDays: 0,
      },
      () => {
        // Fetch all days of the currently selected month by ID
        for (let i = 0; i < month.days.length; ++i) {
          let dayId = month.days[i]._id;
          this.fetchDayById(dayId, (day) => {
            let monthData = this.state.monthData;
            monthData.days[i] = day;

            let loadedDays = this.state.loadedDays + 1;
            let todayExists = this.state.todayExists;

            if (day.day === new Date().getDate()) {
              todayExists = true;
            }

            this.setState({
              monthData,
              loadedDays,
              todayExists,
            });

            // When all days are loaded, check if the current day was also loaded.
            // If not, create the current day as a new day.
            if (loadedDays >= this.state.numDays) {
              // Sort the fetched days
              let monthData = this.state.monthData;
              monthData.days.sort((a, b) => {
                return a.day - b.day;
              });

              this.setState({
                monthData,
              });

              if (
                todayExists === false &&
                this.state.selectedMonth === new Date().getMonth()
              ) {
                // Create the current day
                this.createDay(
                  monthData._id,
                  new Date().getDate(),
                  (newDay) => {
                    let monthData = this.state.monthData;
                    monthData.days.push(newDay);
                    monthData.days = monthData.days.sort((a, b) => {
                      return b.day - a.day;
                    });

                    this.setState({
                      monthData,
                    });
                  }
                );
              }
            }
          });
        }
      }
    );

    // If the current month doesn't have any days, create the current day
    if (numDays === 0 && this.state.selectedMonth === new Date().getMonth()) {
      this.createDay(month._id, new Date().getDate(), (newDay) => {
        let monthData = this.state.monthData;
        monthData.days = [newDay];
        this.setState({ monthData });
      });
    }
  }

  /**
   * Add a new day to the month. Updates the
   * state and synchronizes with the server
   *
   * @param {Number} day
   */
  addNewDay(day) {
    // Check, if the day already exists
    let existing = this.state.monthData.days.find((dayObject) => {
      return dayObject.day === day;
    });

    if (existing) {
      // If day already exists, set it to active and scroll to the selected section
      this.setState({
        activeDay: day,
      });

      window.location = `#day-${day}`;
    } else {
      // Create the day on the server
      this.createDay(this.state.monthData._id, day, (newDay) => {
        let monthData = this.state.monthData;
        monthData.days.push(newDay);
        monthData.days = monthData.days.sort((a, b) => {
          return a.day - b.day;
        });

        // Set the new added day to active and scroll to the selected section
        this.setState({ monthData, activeDay: day }, () => {
          window.location = `#day-${day}`;
        });
      });
    }
  }

  /**
   * Creates new bullet point for a given day.
   * Parses the value string for alternative dates to add to.
   * Updates the local state and the server afterwards.
   *
   * @param {Object} day
   * @param {Object} bulletPoint
   */
  createBulletPoint(day, bulletPoint) {
    // Check if the value contains a date at the beginning to add to a specified date
    const dateRegex = /^((\d{1,2})[./](\d{1,2})[./]?(\d\d\d\d|\d\d)?):?/;
    let value = bulletPoint.value.trim();
    let match = dateRegex.exec(value);

    // If date was entered by the user
    if (match !== null) {
      let replaceString = match[0];
      let day = parseInt(match[2]);
      let month = match[3] - 1;
      let year = match[4] || this.state.selectedYear;

      // Check if the day already exists in this month
      let dayExists = this.state.monthData.days.find((findDay) => {
        return findDay.day === day;
      });

      // Get the selected date from the server. The server creates a new date
      // object if it was not created before
      this.fetchDayByDate(day, month, year, (newDay) => {
        // If the day didn't exist and is in the currently selected month, update the state
        if (
          !dayExists &&
          month === this.state.selectedMonth &&
          year === this.state.selectedYear
        ) {
          let monthData = this.state.monthData;
          monthData.days.push(newDay);
          // Make sure the day is in the right position
          monthData.days = monthData.days.sort((a, b) => {
            return a.day - b.day;
          });

          this.setState({ monthData, activeDay: day });
        }

        // Add the new created bullet point to server and state

        let newBullet = {
          value: value.replace(replaceString, ""),
          bullet_type: bulletPoint.type,
          indent: bulletPoint.indent,
          checked: false,
        };

        this.addBulletPoint(newDay, newBullet, (result) => {
          // Update the local state, if the new bullet point is in this month
          if (
            month === this.state.selectedMonth &&
            year === this.state.selectedYear
          ) {
            this.addBulletPointToState(newDay, result);
          }
        });
      });

      // Bullet point was added to another day. Can return
      return;
    }

    // Add the bullet point to the current day
    this.addBulletPoint(day, bulletPoint, (result) => {
      // Local State Update
      this.addBulletPointToState(day, result);
    });
  }

  // ------------------------------------------------- //

  // ------------------------------------------------- //
  // --- Helper Functions ---------------------------- //
  // ------------------------------------------------- //

  /**
   * Finds the index of a day in the state based on the object id.
   * returns the index of the day object in the days array, if it was found. -1 otherwise.
   *
   * @param {String} dayId
   */
  getDayIndexById(dayId) {
    for (let i = 0; i < this.state.monthData.days.length; ++i) {
      if (dayId === this.state.monthData.days[i]._id) return i;
    }
    return -1;
  }

  /**
   * Finds the index of a bullet point in the given day object based on the object id.
   * returns the index of the bullet point object in the array, if it was found. -1 otherwise.
   *
   * @param {Object} day
   * @param {String} bulletPointId
   */
  getBulletIndexById(day, bulletPointId) {
    for (let i = 0; i < day.bulletPoints.length; ++i) {
      if (bulletPointId === day.bulletPoints[i]._id) return i;
    }
    return -1;
  }

  /**
   * Updates the state with a new bullet point
   *
   * @param {Object} day
   * @param {Object} bulletPoint
   */
  addBulletPointToState(day, bulletPoint) {
    let dayIndex = this.getDayIndexById(day._id);
    let monthData = this.state.monthData;
    monthData.days[dayIndex].bulletPoints.push(bulletPoint);
    this.setState({ monthData });
  }

  /**
   * Updates a bullet point of the current state
   *
   * @param {Object} day
   * @param {Object} bulletPoint
   */
  updateStateBulletPoint(day, bulletPoint) {
    let dayIndex = this.getDayIndexById(day._id);
    let bulletIndex = this.getBulletIndexById(day, bulletPoint._id);

    let monthData = this.state.monthData;
    monthData.days[dayIndex].bulletPoints[bulletIndex] = bulletPoint;

    this.setState({ monthData });
  }

  /**
   * Deletes a bullet point of the current state
   *
   * @param {Object} day
   * @param {Object} bulletPoint
   */
  deleteStateBulletPoint(day, bulletPoint) {
    let dayIndex = this.getDayIndexById(day._id);
    let bulletIndex = this.getBulletIndexById(day, bulletPoint._id);

    let monthData = this.state.monthData;
    let bulletPoints = monthData.days[dayIndex].bulletPoints;
    bulletPoints.splice(bulletIndex, 1);
    monthData.days[dayIndex].bulletPoints = bulletPoints;
    this.setState({ monthData });
  }

  // ------------------------------------------------- //
}

export default MonthView;
