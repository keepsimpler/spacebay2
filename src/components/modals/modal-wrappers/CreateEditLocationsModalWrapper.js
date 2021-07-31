import React, { useContext } from 'react'
import { AppContext } from "../../../context/app-context";
import LegacyModalWrapper from "../LegacyModalWrapper";
import CreateEditLocation from "../../../views/CreateEditLocation";
import PropTypes from 'prop-types'

const CreateEditLocationsModalWrapper = (props) => {
    const appContext = useContext(AppContext)
    const { user, logout } = appContext
    const { closeModal } = props

    return (
        <LegacyModalWrapper
            component={CreateEditLocation}
            path="edit-location"
            closeModal={closeModal}
            props={{
                ...props,
                account: user,
                handleLogout: logout,
            }}
        />
    )
}

CreateEditLocationsModalWrapper.propTypes = {
    closeModal: PropTypes.func.isRequired,
    updateEditLocation: PropTypes.func.isRequired,
    locationToEdit: PropTypes.object
}

export default CreateEditLocationsModalWrapper
