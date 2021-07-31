import React, {useEffect, useRef} from "react";
import '../../css/components/multiSelect.css';
import {useState} from "react";
import MultiSelectContent from "./MultiSelectContent";
import _ from "underscore";
import MultiSelectSearch from "./MultiSelectSearch";
import * as PropTypes from "prop-types";

const MultiSelect = (props) => {
  const [filter, setFilter] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [totalSelected, setTotalSelected] = useState(0);
  const [isClosed, setIsClosed] = useState(true);
  const baseRef = useRef(null);
  const { value, options, onChange, label, isDisabled = false } = props;

  useEffect(() => {
    setTotalSelected(value.length);
  }, [value])

  useEffect(() => {
    if (filter && filter.length) {
      const matchedOptions = _.filter(options, option => option.displayName.toUpperCase().includes(filter.toUpperCase()));
      setFilteredOptions(matchedOptions);
    } else {
      setFilteredOptions(options);
    }
  }, [filter, options]);

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick, true)
    return () => {
      document.removeEventListener('click', handleOutsideClick, true)
    }
  }, [isClosed]);

  const handleOutsideClick = (event) => {
    if (baseRef.current && !baseRef.current.contains(event.target)) {
      setIsClosed(true);
      setFilter("");
    }
  }

  const filterOnChange = (event) => {
    setFilter(event.target.value);
  }

  const filterOnFocus = () => {
    setIsClosed(false);
  }

  const onSelectedLocationIdsChange = (event) => {
    const VIEW_ALL_NAME = "view-all";
    const name = event.target.name;
    const targetOptionValue = event.target.value;
    const checked = event.target.checked;
    let [...updatedValue] = value;

    if (VIEW_ALL_NAME === name) {
      if (checked) {
        updatedValue = [];
      }
    } else {
      if (_.contains(value, targetOptionValue)) {
        updatedValue = _.reject(updatedValue, v => v === targetOptionValue);
      } else {
        updatedValue.push(targetOptionValue);
      }
    }

    onChange(updatedValue);
  }

  return (
    <fieldset ref={baseRef} className="ss-stand-alone">
      <div className="ss-multiselect-dropdown ss-form ss-block">
        <MultiSelectSearch label={label}
                           value={filter}
                           placeholder={`${totalSelected ? totalSelected + ' Selected' : 'View all'}`}
                           onChange={filterOnChange}
                           onFocus={filterOnFocus}
                           isDisabled={isDisabled}
        />
        {
          !isClosed &&
            <MultiSelectContent value={value}
                                options={filteredOptions}
                                onChange={onSelectedLocationIdsChange}
                                isDisabled={isDisabled}
            />
        }
      </div>
    </fieldset>
  );
}

MultiSelect.propTypes = {
  value: PropTypes.array.isRequired,
  options: PropTypes.arrayOf(PropTypes.exact({
    value: PropTypes.any,
    displayName: PropTypes.string
  })).isRequired,
  onChange: PropTypes.func,
  label: PropTypes.string,
  isDisabled: PropTypes.bool
}

export default MultiSelect;
