import React from "react";
import styled from "styled-components";

const Overlay = styled.div`
  @keyframes initAnimation {
    0% {
      transform: translateY(-7%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
  position: absolute;
  z-index: 1;
  width: 350px;
  left: -175px;
  background-color: white;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.06), 0 3px 6px rgba(0, 0, 0, 0.13);
  padding-top: 1rem;
  padding-bottom: 2rem;
  animation: 0.3s ease-in 0s 1 initAnimation;
`;

const MonthRow = styled.div`
  display: flex;
  justify-content: center;

  div {
    user-select: none;
    width: 72px;
    height: 58px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid;
    &:hover {
      background-color: #efefef;
      cursor: pointer;
    }
  }
`;

/**
 * Display a month selection to choose a new month
 */
const MonthCalendar = (props) => {
  return (
    <Overlay>
      <MonthRow>
        <div onClick={() => props.onMonthSelect(0)}>JAN</div>
        <div onClick={() => props.onMonthSelect(1)}>FEB</div>
        <div onClick={() => props.onMonthSelect(2)}>MAR</div>
        <div onClick={() => props.onMonthSelect(3)}>APR</div>
      </MonthRow>
      <MonthRow>
        <div onClick={() => props.onMonthSelect(4)}>MAY</div>
        <div onClick={() => props.onMonthSelect(5)}>JUN</div>
        <div onClick={() => props.onMonthSelect(6)}>JUL</div>
        <div onClick={() => props.onMonthSelect(7)}>AUG</div>
      </MonthRow>
      <MonthRow>
        <div onClick={() => props.onMonthSelect(8)}>SEP</div>
        <div onClick={() => props.onMonthSelect(9)}>OCT</div>
        <div onClick={() => props.onMonthSelect(10)}>NOV</div>
        <div onClick={() => props.onMonthSelect(11)}>DEC</div>
      </MonthRow>
    </Overlay>
  );
};

export default MonthCalendar;
