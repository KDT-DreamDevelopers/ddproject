async function sendIsNear(userX, userY, targetBusName){
    console.log(userX, userY, targetBusName);
    const response = await fetch(`http://localhost:8080/isNear/${userX}/${userY}/${targetBusName}`);

    const result = await response.json();

    console.log(result);
    return result;
}