// 인증번호 코드 선언
let code

// 받아올 userid 변수 선언
let userid
// 오류 res 받았을때 받아올 메시지
let message

// 다시 login 페이지로 이동
// const loginBack = document.getElementById('loginPage')
// loginBack.addEventListener('click', loginPage())


// ID 찾기 버튼 클릭 이벤트 (인증메세지 보내기)
const searchId = document.getElementById('searchId')
searchId.addEventListener('click', async (e)=>{
    e.preventDefault()
    searchId.disabled = true

    // 입력 정보 추출
    const name = document.getElementById('name').value
    const hp = document.getElementById('hp').value

    const formData = {
        name: name,
        hp: hp
    }

    const jsonData = JSON.stringify(formData)

    if (checkAll()){
        // container1 div 숨김
        const container1 = document.getElementById('container1');
        container1.style.display = 'none';

        // container2 div 보이게
        const container2 = document.getElementById('container2');
        container2.style.display = 'block';

        fetch('https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/auth/check',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData
        })
        .then(res => {return res.json()})
        .then((data) => {
            code = data.code
            console.log(code)
        })
        .catch(error=>{
            alert('에러발생')
            searchId.disabled = false
        })
    }
})

// page2 -----------------------------------------------

// 뒤로가기
const cancel = document.getElementById('back')
cancel.addEventListener('back', backPage)

console.log(code)

// 코드 인증번호 맞는지 확인하기 (맞다면 userid받아오기)
const codeBtn = document.getElementById('codeBtn')
codeBtn.addEventListener('click', (e)=>{
    codeBtn.disabled = true
    const codeCheck = document.getElementById('codeCheck').value
    console.log(codeCheck)
    if (codeCheck == code){
        // 아까 입력했던 정보 추출
        const name = document.getElementById('name').value
        const hp = document.getElementById('hp').value

        const formData = {
            name: name,
            hp: hp
        }

        const jsonData = JSON.stringify(formData)

        // userid 찾기
        fetch('https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/auth/findID',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData
        })
        .then(res => {return res.json()})
        .then((data) => {
            if(data.userid){
                userid = data.userid

                // container2 div 숨김
                const container2 = document.getElementById('container2');
                container2.style.display = 'none';

                // container3 div 보이게
                const container3 = document.getElementById('container3');
                container3.style.display = 'block';

                const result = document.getElementById('result')
                result.innerHTML = `${name}님의 아이디는
                <br> <span class="your_id2" id="result2">[${userid}]</span> <span>입니다</span>`
            }else{
                message = data.message
                alert(message)
            }
            
        })

        alert('인증되었습니다')
        console.log(userid)
        
    }else{
        alert('인증번호가 틀렸습니다')
        codeBtn.disabled = false
    }
})
// page3 -----------------------------------------------


// 함수 -------------------------------------------------

// 취소시 창 닫기
function backPage(){
    window.history.back()
}

// 아이디 확인 후 로그인창으로 다시 이동
function loginPage(){
    console.log(2)
    window.location.href = '../login.html'
}

// 제대로 입력하도록 정규표현식
function checkAll(){
        const name = document.getElementById('name')
        const hp = document.getElementById('hp')

        const expNameText = /^(?:[가-힣]{1,20}|[A-Za-z]{1,20})$/
        const expHpText = /^\d{11}$/

        if (!expNameText.test(name.value)){
            alert('이름을 올바르게 작성하세요.')
            name.focus()
            return false
        }
        else if (!expHpText.test(hp.value)){
            alert('하이픈(-)을 제외한 전화번호 11자리를 올바르게 입력하세요')
            hp.focus()
            return false
        }
        else{
            return true
        }
    }