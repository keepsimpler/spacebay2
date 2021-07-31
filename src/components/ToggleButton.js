import React from 'react';

export default ({isActive, activeTag, inactiveTag, onToggle, baseClass, activeClass, inactiveClass, firstTooltip, secondTooltip}) =>
    (   <div className={baseClass}>
            <div className={!isActive ? `${inactiveClass} ${activeClass}` : `${inactiveClass}`}
                 data-tip data-for={firstTooltip ? firstTooltip  : ''}
                 onClick={() => onToggle(false)}>
                {inactiveTag}
            </div>
            <div className={isActive ? `${inactiveClass} ${activeClass}` : `${inactiveClass}`}
                 data-tip data-for={secondTooltip ? secondTooltip  : ''}
                 onClick={() => onToggle(true)}>
                {activeTag}
            </div>
        </div>
    );

