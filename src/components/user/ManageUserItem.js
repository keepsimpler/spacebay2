import React, { useState, useEffect } from 'react'
import { UserTypeName } from "../constants/securspace-constants";
import MultiSelect from "../multiSelect/MultiSelect";
import { AccountType } from "../constants/securspace-constants";
import PropTypes from 'prop-types'

import SolidButton from "../form/SolidButton";
import OutlinedButton from "../form/OutlinedButton";

import 'css/manage-user-item.css'

const displayMap = new Map([
  ['ROLE_USERTYPE_GATECLERK', UserTypeName.GATE_CLERK],
  ['ROLE_USERTYPE_GATEMANAGER', UserTypeName.GATE_MANAGER],
  ['ROLE_USERTYPE_DISPATCHER', UserTypeName.DISPATCHER],
  ['ROLE_USERTYPE_OWNER', UserTypeName.ADMIN]
]);

const ManageUserItem = (props) => {
  const {
    user,
    locationOptions,
    onRemoveUser,
    onUpdateLocations,
    accountType
  } = props

  const isSupplierAccount = accountType === AccountType.SUPPLIER

  const [editLocationsOpen, setEditLocationsOpen] = useState(false)
  const [updatedLocations, setUpdatedLocations] = useState(user.locationIds)

  const toggleLocationVisibility = () => {
    setEditLocationsOpen(!editLocationsOpen)

    if(!editLocationsOpen) {
      setUpdatedLocations(user.locationIds)
    }
  }

  const internalSubmit = () => {
    onUpdateLocations(user, updatedLocations)
  }

  useEffect(() => {
    setEditLocationsOpen(false)
    setUpdatedLocations(user.locationIds)
  }, [user.locationIds])

  return (
    <div>
      <div className="manage-user-item-info-container">
        <div className="manage-user-info-item">{user.username}</div>
        <div className="manage-user-info-item">{displayMap.get(user.role)}</div>
        <div className="manage-user-info-action-item-container">
          {
            isSupplierAccount &&
            <OutlinedButton
              label="Edit"
              onClick={toggleLocationVisibility}
              className="edit-locations-button"
            />
          }
          <SolidButton label="Remove" onClick={() => onRemoveUser(user)} />
        </div>
      </div>
      <div>
        {
          editLocationsOpen &&
            <div className="edit-locations-form-container">
              <form className="ss-form ss-block">
                <MultiSelect
                  value={updatedLocations || []}
                  options={locationOptions}
                  label="LOCATIONS"
                  onChange={setUpdatedLocations}
                />
              </form>
              <div className="edit-locations-form-btn-container">
                <div className="edit-locations-cancel-btn">
                  <OutlinedButton label="Cancel" onClick={toggleLocationVisibility} />
                </div>
                <div>
                  <SolidButton label="Save" onClick={internalSubmit} />
                </div>
              </div>
            </div>
        }
      </div>
    </div>
  )
}

ManageUserItem.propTypes = {
  user: PropTypes.object.isRequired,
  onUpdateLocations: PropTypes.func.isRequired,
  onRemoveUser: PropTypes.func.isRequired,
  locationOptions: PropTypes.array.isRequired,
  accountType: PropTypes.string.isRequired
}

export default ManageUserItem
