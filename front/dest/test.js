async function sendIsNear(userX, userY, targetBusName){
    console.log(await userX, await userY, await targetBusName);
    const response = await fetch(`https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/isNear/${userX}/${userY}/${targetBusName}`);
    const result = await response.json();
    console.log("sendIsNear: ", result)
    return result;
}