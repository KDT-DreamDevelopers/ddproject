//  고객센터 : 전화연결 누를 때마다 번호 나왔다 안나왔다 하기
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

// 전화걸기
function makeCall() {
    var phoneNumber = document.getElementById('callDisplay').innerText.trim();  
    window.location.href = "tel:" + phoneNumber;
}


// 긴급신고 : 전화연결 누를 때마다 번호 나왔다 안나왔다 하기
document.addEventListener('DOMContentLoaded', function () {
    var callButton = document.getElementById('callButton1');
    var callDisplay = document.getElementById('callDisplay1');

    callButton.addEventListener('click', () => {
        toggleCalling1(); // 전화연결 버튼을 클릭할 때 toggleCalling 함수 호출
    });
});

function toggleCalling1() {
    var callDisplay = document.getElementById('callDisplay1');

    if (callDisplay.style.display === 'none') {
        callDisplay.style.display = 'inline';
    } else {
        callDisplay.style.display = 'none';
    }
}

// 전화걸기
function makeCall1() {
    var phoneNumber = document.getElementById('callDisplay1').innerText.trim();  
    window.location.href = "tel:" + phoneNumber;
}
