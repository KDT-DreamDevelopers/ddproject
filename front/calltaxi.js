// 콜택시 홈페이지로 이동
function goToHomepage() {
    window.location.href = "https://www.sisul.or.kr/open_content/calltaxi/";
}


document.addEventListener('DOMContentLoaded', function () {
    var callButton = document.getElementById('callButton');
    var callDisplay = document.getElementById('callDisplay');

    callButton.addEventListener('click', () => {
        toggleCalling(); // 전화연결 버튼을 클릭할 때 toggleCalling 함수 호출
    });
});

function toggleCalling() {
    var callDisplay = document.getElementById('callDisplay');

    if (callDisplay.style.display === 'none') {
        callDisplay.style.display = 'inline';
    } else {
        callDisplay.style.display = 'none';
    }
}

function makeCall() {
    var phoneNumber = document.getElementById('callDisplay').innerText.trim();  
    window.location.href = "tel:" + phoneNumber;
}
