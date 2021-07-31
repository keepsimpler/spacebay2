import React, {Component} from 'react';
import '../css/views/navMenu.css';
import '../css/components/subMenu.css';
import {NavLink} from "react-router-dom";
import Radium from "radium";
import _ from 'underscore'
import Badge from "../views/Badge";

class SubMenu extends Component {

    render() {
        let styles = calculateStyles(this.props.menuItem, this.props.menuItemIndex, this.props.menuTotalItems);

        return (
            <div className={this.props.show ? "ss-submenu-visible" : "ss-submenu-hidden"} style={[styles.submenu]}>
                <ul style={[styles.menuItemList]} className="ss-submenu-list">
                    {
                        _.map(this.props.menuItem.submenus, (subMenuItem, subindex) =>
                            <li key={this.props.menuItemIndex + '_' + subindex}
                                className="ss-submenu-vertical ss-submenu-item"
                                onClick={() => this.props.onSubMenuItemClick(this.props.menuItem)}
                            >
                                {
                                    <NavLink activeClassName=" active" to={ '/' + subMenuItem.path }>
                                            <span
                                                className={ subMenuItem.highlighted ? "ss-nav-menu-item-highlighted" : "" }>{ subMenuItem.label }</span>
                                        {
                                            subMenuItem.badge && !!this.props.pendingApprovalCount
                                            && this.props.pendingApprovalCount > 0 &&
                                            <Badge
                                                type="left"
                                                pendingBookings={ this.props.pendingApprovalCount }
                                            />
                                        }
                                    </NavLink>
                                }
                            </li>
                        )
                    }
                </ul>
            </div>
        );
    }
}

let calculateStyles = function(menuItem, menuItemIndex, menuTotalItems) {
    let menuWidth = menuItem.submenuWidth ? menuItem.submenuWidth : 100;//px
    let menuRightPosition = (menuItemIndex === menuTotalItems - 1) ? -20 : -5;

    return {
        submenu: {
            '@media all and (min-width: 1000px)': {
                left: menuRightPosition + "px"
            }
        },
        menuItemList: {
            '@media all and (min-width: 1000px)': {
                width: menuWidth + "px"
            }
        },
        menuDivider: {
            marginTop: "0",
            marginBottom: "0",
            position: "absolute",
            top: "-6px",
            left: "-65px",
            right: "0",
            width: "110px"
        },
        logoutContainer: {
            position: "relative",
            top: "7px",
            height: "22px"
        }
    };
};

export default Radium(SubMenu);
