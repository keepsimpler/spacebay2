import React, { useContext } from 'react'
import ManageUserItem from "./ManageUserItem";
import { AppContext } from "../../context/app-context";
import { AccountType } from "../constants/securspace-constants";
import classNames from 'classnames'
import PropTypes from 'prop-types'
import _ from 'underscore'

import 'css/manage-existing-users.css'

const ManageExistingUsers = (props) => {
  const { users, locationOptions, onRemoveUser, onUpdateLocations } = props

  const { user: { type } } = useContext(AppContext)

  return (
    <div className="report-container">
      {
        users && users.length === 0 ?
          <h4>There are currently no users for this account.
            Use the button to the left to add your first one.</h4>
          :
          <div className={classNames("manage-existing-users-container",
            { "manage-existing-users-container-supplier" : type === AccountType.SUPPLIER })}>

            <div className="manage-users-header">
              <div className="manage-users-header-item">USERNAME</div>
              <div className="manage-users-header-item">ROLE</div>
              <div className="manage-users-header-item actions-header-item">ACTIONS</div>
            </div>

            <div className="existing-users-container">
              {
                _.map(users, (user, idx) => {
                  return (
                    <ManageUserItem
                      key={idx}
                      user={user}
                      locationOptions={locationOptions}
                      onRemoveUser={onRemoveUser}
                      onUpdateLocations={onUpdateLocations}
                      accountType={type}
                    />
                  )
                })
              }
            </div>
          </div>
      }
    </div>
  )
}

ManageExistingUsers.propTypes = {
  users: PropTypes.array.isRequired,
  locationOptions: PropTypes.array.isRequired,
  onRemoveUser: PropTypes.func.isRequired,
  onUpdateLocations: PropTypes.func.isRequired
}

export default ManageExistingUsers
