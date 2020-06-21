import React from "react";
import styled from "styled-components";
import deleteIcon from "./../assets/icons/delete.svg";

const Bullet = styled.span`
  margin-right: 0.5rem;
`;

const DeleteButton = styled.span`
   {
    position: relative;

    &:hover {
      cursor: pointer;
      img {
        transform: scale(1.1);
      }
    }

    img {
      position: absolute;
      left: -42px;
      top: 2px;
      width: 30px;
      transition: transform 0.1s;
    }
  }
`;

const Input = styled.input`
  border: none;
  outline: none;
  border-bottom: 1px solid black;
  font-size: 1.5rem;
  line-height: 1.5rem;
  font-family: "Caveat", cursive;
  min-width: 500px;
`;

/**
 * The BulletPoint component renders one bullet point
 */
const BulletPoint = (props) => {
  // choose the bullet type and add prefix
  let bullet = "- ";

  switch (props.type) {
    case "TASK":
      bullet = (
        <input
          type="checkbox"
          checked={props.checked}
          onChange={(evnt) => {
            props.onCheck(evnt.target.checked);
          }}
        />
      );
      break;
    case "EVENT":
      bullet = "* ";
      break;
    default:
      bullet = "- ";
      break;
  }

  // If in edit mode, display the input field
  if (props.editMode) {
    return (
      <div>
        {/* Delete button */}
        {props.canDelete && (
          <DeleteButton
            onMouseDown={() => {
              props.onDelete();
            }}
          >
            <img src={deleteIcon} alt="delete icon" />
          </DeleteButton>
        )}
        {/* Bullet point */}
        <Bullet>{bullet}</Bullet>
        {/* Input field to edit */}
        <span>
          <Input
            ref={props.inputRef}
            onChange={(evnt) => {
              props.onInputChange(evnt.target.value);
            }}
            onKeyDown={(evnt) => {
              props.onInputKey(evnt);
            }}
            onBlur={(evnt) => {
              props.onEditMode(false);
            }}
          />
        </span>
      </div>
    );
  } else {
    // Display the bullet point content
    return (
      <div>
        <Bullet>{bullet}</Bullet>
        <span
          onDoubleClick={() => {
            props.onEditMode(true);
          }}
        >
          {props.value}
        </span>
      </div>
    );
  }
};

export default BulletPoint;
