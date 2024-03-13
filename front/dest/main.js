datalist = []
let datas = { "data": datalist };

async function sendToMarking(data, title) {
    try {
        const useInMarkingTargetX = await data.latitude;
        const useInMarkingTargetY = await data.longitude;
        const useInMarkingTitle = title;
    
        localStorage.setItem("useInMarkingTargetX", useInMarkingTargetX);
    
        localStorage.setItem("useInMarkingTargetY", useInMarkingTargetY);
    
        localStorage.setItem("useInMarkingTitle", useInMarkingTitle);
    
        window.location.href = "./marking.html";
    } catch(error){
        console.error(error)
    }
}



async function send(startX, startY, endX, endY) {
    try {
        const response = await fetch(`https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/send/${startY}/${startX}/${endY}/${endX}`)
    
        const result = await response.json();
        
        const next_data = [
            result["0"],
            result["1"],
            result["2"],
            result["3"],
            result["4"]
        ]
    
        return next_data;
    }
    catch (error){
        console.error("send 함수 : ", error);
    }

}