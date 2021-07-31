import React from "react";
import * as PropTypes from "prop-types";

const MultiSelectSearch = (props) => {
  const { label, value, placeholder, onChange, onFocus, isDisabled } = props;

  return (
    <div>
      <label htmlFor="multi-select-search">{label}</label>
      <input type="text"
             id="multi-select-search"
             name="multi-select-search"
             placeholder={placeholder}
             value={value}
             onChange={onChange}
             onFocus={onFocus}
             autoComplete={"off"}
             disabled={isDisabled}
      />
    </div>
  )
}

MultiSelectSearch.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  isDisabled: PropTypes.bool
}

export default MultiSelectSearch;