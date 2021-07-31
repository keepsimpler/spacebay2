import React from "react";
import * as PropTypes from "prop-types";

const MultiSelectContentItem = (props) => {
  const { value, checked, name, displayName, onChange, isDisabled } = props;

  return (
    <label>
      <input type="checkbox"
             name={name}
             value={value}
             checked={checked}
             onChange={onChange}
             disabled={isDisabled}
      />
      <span>{displayName}</span>
    </label>
  )
}

MultiSelectContentItem.propTypes = {
  value: PropTypes.any,
  checked: PropTypes.bool,
  name: PropTypes.any,
  displayName: PropTypes.string,
  onChange: PropTypes.func,
  isDisabled: PropTypes.bool
}

export default MultiSelectContentItem;
