async function sendIsNearBus(userX, userY, targetBusId){
    try {
        const response = await fetch(`https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/isNearBus/${userX}/${userY}/${targetBusId}`);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error);
        return 500;
    }
}

async function findSubwayAddress(targetSubwayName){
    try {
        const response = await fetch(`https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/isNearSubway/${targetSubwayName}`);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error)
    }
}