import Option from "./Option";

class LocationRefOption extends Option {

    constructor(location) {
        super(location.id);
        this.displayValue = location.locationName;
        this.equipmentTypes = location.locationEquipmentTypes ?
            location.locationEquipmentTypes.map(locationEquipmentType => locationEquipmentType.equipmentType) :
            [];
    }

    getDisplayValue() {
        return this.displayValue;
    }
}

export {LocationRefOption};
