async function sendIsNear(userX, userY, targetBusName){
    console.log(userX, userY, targetBusName);
    const response = await fetch(`https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/isNear/${userX}/${userY}/${targetBusName}`);

    const result = await response.json();
    return result;
}