async function sendIsNearBus(userX, userY, targetBusName){
    console.log(await userX, await userY, await targetBusName);
    const response = await fetch(`https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/isNearBus/${userX}/${userY}/${targetBusName}`);
    const result = await response.json();
    console.log("sendIsNear: ", result)
    return result;
}

async function findSubwayAddress(targetSubwayName){
    const response = await fetch(`https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/isNearSubway/${targetSubwayName}`);
    const result = await response.json();
    console.log("findSubwayAddress:", result);
    return result;
}