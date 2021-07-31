export default {
    OPTIONS: [
        "Container/Chassis (20'/40'/45')",
        "Container/Chassis (40'/45'/53')",
        "Container/Chassis (20'/40')",
        "Container/Chassis (45')",
        "Truck + Trailer",
        "Truck Only",
        "Truck Only (25')",
        "Trailer (53')",
        "Refrigerated Plug In"
    ],
    jsonTypes: [
        {"name": "Container/Chassis (20'/40'/45')", "assetType": "Container/Chassis (20'/40'/45')",  "available": 1,  "icon":"container.png"},
        {"name": "Container/Chassis (40'/45'/53')", "assetType": "Container/Chassis (40'/45'/53')",  "available": 1,  "icon":"container.png"},
        {"name": "Container/Chassis (20'/40')", "assetType": "Container/Chassis (20'/40')",  "available": 1,  "icon":"container.png"},
        {"name": "Container/Chassis (45')", "assetType": "Container/Chassis (45')",  "available": 1,  "icon":"container.png"},
        {"name": "Truck + Container/Chassis", "assetType": "Truck + Container/Chassis", "available": 0, "icon":"truck-container.png"},
        {"name": "Truck + Trailer", "assetType": "Truck + Trailer",  "available": 1,"icon":"truck-trailer.png"},
        {"name": "Truck Only", "assetType": "Truck Only",  "available": 1,"icon":"truck-only.png"},
        {"name": "Truck Only (25')", "assetType": "Truck Only (25')",  "available": 1,"icon":"truck-only.png"},
        {"name": "Trailer (53')", "assetType": "Trailer (53')",  "available": 1,"icon":"53-trailer.png"},
        {"name": "Refrigerated Plug In", "assetType": "Refrigerated Plug In", "available": 1,"icon":"refrigerated.png"}
    ],
    getEqType: function (assetType) {
        return  assetType ? assetType : "Container/Chassis";
    },
    getIconByName: function(name){
        let icon="";
        this.jsonTypes.forEach(function (item) {
            if (item.name === name) {
                icon= item.icon;
                return;
            }
        });
        return icon;
    },
    getRatesByEqType: function (item, locationEqTypes) {
        let eqType = this.getEqType(item.assetType);
        if (!eqType) return null;
        let selectedEq = null;
        for (let i = 0; i < locationEqTypes.length; i++) {
            if (locationEqTypes[i]['equipmentType'] === eqType) {
                selectedEq = locationEqTypes[i];
                break;
            }
        }
        return selectedEq;
    },
    sortLocationEquipmentTypes(temp) {
        temp.sort((a, b) => {
            var nameA = a.equipmentType.toLowerCase(), nameB = b.equipmentType.toLowerCase();
            if (nameA < nameB) //sort string ascending
                return -1
            if (nameA > nameB)
                return 1
            return 0;
        });
        return temp;
    }
};


