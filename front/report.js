var script = document.createElement('script');
script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=f4a2aebd448b6fcc485c8aea465c19a1&libraries=services';
document.head.appendChild(script);

// Kakao Maps API 스크립트 로드 완료 후 실행될 콜백 함수 정의
script.onload = function() {
    // Kakao Maps API 스크립트 로드 완료 후 실행될 코드
    var container = document.getElementById('map');
    var options = { 
        center: new kakao.maps.LatLng(33.450701, 126.570667),
        level: 3 
    };

    var map = new kakao.maps.Map(container, options);
};

function showCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;  // 위도
            var lon = position.coords.longitude; // 경도
            
            var mapContainer = document.getElementById('map');
            var options = {
                center: new kakao.maps.LatLng(lat, lon),
                level: 3
            };
            
            var map = new kakao.maps.Map(mapContainer, options);
            
            // 마커 표시
            var markerPosition = new kakao.maps.LatLng(lat, lon);
            var marker = new kakao.maps.Marker({
                position: markerPosition
            });
            marker.setMap(map);

            // 좌표를 주소로 변환
            var geocoder = new kakao.maps.services.Geocoder();
            geocoder.coord2Address(lon, lat, function(result, status) {
                if (status === kakao.maps.services.Status.OK) {
                    var roadAddress = result[0].address.address_name;
                    console.log(roadAddress);
                    document.getElementById('location').value = roadAddress
                }
            })
        });
    } else {
        alert("Geolocation을 지원하지 않습니다.");
    }
}

// 로그인 여부 확인
let token;
const userInfo = localStorage.getItem('userInfo')
if (!userInfo){
      alert('로그인 후 사용바랍니다')
      window.location.href = '../login.html'
  }else{
      token = JSON.parse(userInfo).value
      if(!token){
          alert('로그인 후 사용바랍니다')
          window.location.href = '../login.html'
      }
  }

const sendBtn = document.getElementById('sendBtn')
sendBtn.addEventListener('click', async (e)=>{
    e.preventDefault();
    sendBtn.disabled = true

    // 입력 정보 추출
    const location = document.getElementById('location').value
    const text = document.getElementById('text').value
    const fileInput = document.getElementById('fileInput')
    const file = fileInput.files[0]

    if (!location){
        alert('위치를 입력하세요')
    }else if (!text){
        alert('불편사항을 입력하세요')
    }else if(!fileInput){
        alert('사진파일을 함께 첨부하세요')
    }else{
        // 데이터 전송
        const formData = new FormData()
        formData.append('location', location)
        formData.append('text', text)
        formData.append('file', file)

        try{
            const response = await fetch('https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/report/write', {
                method:'POST',
                headers:{
                    "Authorization":`Bearer ${token}`
                },
                body: formData
            })
            if (response.ok) {
                const data = await response.json();
                alert(data.message)
                window.location.href = './rep_complete.html';
            } else {
                const data = await response.json()
                console.log(data)
                console.error('신고하기 실패');
                alert(data.message)
                login.disabled = false
            }
        } catch (error) {
            console.error('에러 발생', error);
            login.disabled = false
        }
    }

})