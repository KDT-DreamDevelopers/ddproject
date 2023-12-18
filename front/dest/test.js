async function sendIsNearBus(userX, userY, targetBusId){
    const response = await fetch(`https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/isNearBus/${userX}/${userY}/${targetBusId}`);
    const result = await response.json();
    return result;
}

async function findSubwayAddress(targetSubwayName){
    const response = await fetch(`https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/${targetSubwayName}`);
    const result = await response.json();
    return result;
}