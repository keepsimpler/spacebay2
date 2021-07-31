import { CheckInFields } from "../constant/check-in-constant";
import _ from 'underscore'

export const validateCustomCheckInConfiguration = (state, checkInFields) => {
    const fieldNameToFieldConfigAndDescriptor = {}
    _.each((checkInFields), (field) => {
        const fieldDescriptor = CheckInFields[field.checkInFieldType]
        fieldNameToFieldConfigAndDescriptor[fieldDescriptor.field] = { fieldConfig: field, fieldDescriptor }
    })

    let errorMessage = null

    _.find(Object.keys(state), (stateField) => {
        if(fieldNameToFieldConfigAndDescriptor[stateField]) {
            const fieldConfigAndDescriptor = fieldNameToFieldConfigAndDescriptor[stateField]
            const { fieldConfig, fieldDescriptor } = fieldConfigAndDescriptor

            if(fieldConfig.required && !state[stateField]) {
                errorMessage = fieldDescriptor.requiredMessage
                return true
            }
        }
    })

    return errorMessage
}

export const generateInitialStateFromCustomCheckinConfiguration = (checkInFields) => {
    const initState = {}

    _.each(checkInFields, (field) => {
        if(field.defaultValue) {
            const fieldDescriptor = CheckInFields[field.checkInFieldType]
            initState[fieldDescriptor.field] = field.defaultValue
        }
    })

    return initState
}
