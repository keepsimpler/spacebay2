import React, {Component} from 'react';
import {NavLink} from 'react-router-dom'
import {logout} from '../util/LogoutUtil'
import '../css/views/navMenu.css';
import SubMenu from "../components/SubMenu";
import classNames from 'classnames'
import Badge from "./Badge";

class NavMenu extends Component {

    constructor(props) {
        super(props);

        this.state = {
            activeSubmenu: '',
        };

        this.setActiveMenuItem = this.setActiveMenuItem.bind(this);
    }

    componentDidMount() {
        document.body.addEventListener('click', this.hideSubmenu);
    }

    componentWillUnmount() {
        document.body.removeEventListener('click', this.hideSubmenu);
    }

    logout = event => {
        event.stopPropagation();
        event.preventDefault();
        this.props.closeNavMenu();
        logout(this.props.handleLogout, false);
    };

    toggleSubmenu = menuItemPath => {
        if (this.state.activeSubmenu !== menuItemPath) {
            this.showSubmenu(menuItemPath);
        } else {
            this.hideSubmenu();
        }
    };

    showSubmenu = menuItemPath => {
        this.setState({activeSubmenu: menuItemPath});
    };

    hideSubmenu = () => {
        this.setState({activeSubmenu: "", displaySignUpView: false});
    };

    setActiveMenuItem = (menuItem) => {
        this.props.closeNavMenu();
        this.setState({
            activeMenuItem: menuItem.path
        });
    };

    render() {
        return (
            <div id="ssNavMenuContainer" className={this.props.showMenu ? "ss-show" : "ss-hidden"} onScroll={(e) => e.stopPropagation()}>
                <img alt="" className="ss-close-left" src="../app-images/close.png" onClick={() => this.props.closeNavMenu()}/>
                <ul id="ssNavMenu">
                    {this.props.navMenu ?
                        this.props.navMenu.map((menuItem, index) =>

                            menuItem.submenus ?

                                <li key={index} className={'ss-nav-menu-item'+ (menuItem.badge ? " has-badge " : "")}>
                                    <a href="#"
                                       className={"ss-nav-submenu-toggle" + (this.state.activeMenuItem === menuItem.path ? " active" : "")}
                                       onClick={(event) => {
                                           event.stopPropagation();
                                           event.preventDefault();
                                           this.toggleSubmenu(menuItem.path);
                                       }}
                                    >
                                        {
                                            menuItem.badge && !!this.props.pendingApprovalCount && this.props.pendingApprovalCount > 0 &&
                                            <Badge
                                                type="left"
                                                pendingBookings={this.props.pendingApprovalCount}
                                            />
                                        }
                                        {menuItem.label}
                                    </a>
                                    <SubMenu show={this.state.activeSubmenu === menuItem.path}
                                             menuItem={menuItem}
                                             menuItemIndex={index}
                                             menuTotalItems={this.props.navMenu.length}
                                             onSubMenuItemClick={this.setActiveMenuItem}
                                             handleLogout={this.logout}
                                             pendingApprovalCount={this.props.pendingApprovalCount}
                                    />
                                </li>

                                :

                                <li key={ index } className="ss-nav-menu ss-nav-menu-item">
                                    {
                                        (menuItem.modal)
                                            ?
                                            <span
                                                className={ menuItem.highlighted ? "pointer ss-nav-menu-item-highlighted" : "pointer" }
                                                onClick={ () => this.setActiveMenuItem(menuItem) }>{ menuItem.label }</span>
                                            :
                                            <NavLink className={ classNames(menuItem.linkClassName) }
                                                     activeClassName="active"
                                                     to={ '/' + menuItem.path }
                                                     onClick={ () => this.setActiveMenuItem(menuItem) }>
                                                <span
                                                    className={ classNames({ "ss-nav-menu-item-highlighted": menuItem.highlighted }, menuItem.className) }>{ menuItem.label }</span>
                                            </NavLink>
                                    }
                                </li>
                        )
                        :
                        null
                    }
                </ul>
                <div id="menuCloser" onClick={() => this.props.closeNavMenu()}/>
            </div>
        );
    }
}

export default NavMenu;
