import React from "react";
import _ from "underscore";
import MultiSelectContentItem from "./MultiSelectContentItem";
import * as PropTypes from "prop-types";

const MultiSelectContent = (props) => {
  const { value, options, onChange, isDisabled } = props;

  return (
    <div className={`w100 pull-left ss-multiselect-dropdown-content`}>
      <MultiSelectContentItem value={[]}
                              checked={!value.length}
                              name="view-all"
                              displayName="View All"
                              onChange={onChange}
                              isDisabled={isDisabled}
      />
      {
        options && options.length > 0 &&
          _.map(options, (option, idx) => {
            return (
              <MultiSelectContentItem key={idx}
                                      value={option.value}
                                      checked={_.contains(value, option.value)}
                                      name={idx}
                                      displayName={option.displayName}
                                      onChange={onChange}
                                      isDisabled={isDisabled}
              />
            )
          })
      }
    </div>
  )
}

MultiSelectContent.propTypes = {
  value: PropTypes.array.isRequired,
  options: PropTypes.arrayOf(PropTypes.exact({
    value: PropTypes.any,
    displayName: PropTypes.string
  })).isRequired,
  onChange: PropTypes.func,
  isDisabled: PropTypes.bool
}

export default MultiSelectContent;
