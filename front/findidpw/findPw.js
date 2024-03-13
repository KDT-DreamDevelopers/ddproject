// 인증번호 코드 선언
let code

// 오류 res 받았을때 받아올 메시지
let message

// 다시 login 페이지로 이동
const loginBack = document.getElementById('loginPage')
loginBack.addEventListener('click', loginPage)

// 아이디 확인 후 로그인창으로 다시 이동
function loginPage(){
    console.log(2)
    window.location.href = '../login.html'
}


// PW 찾기 버튼 클릭 이벤트 (인증메세지 보내기)
const searchPw = document.getElementById('searchPw')
searchPw.addEventListener('click', async (e)=>{
    e.preventDefault()
    searchPw.disabled = true

    // 입력 정보 추출
    const userid = document.getElementById('userid').value
    const hp = document.getElementById('hp').value

    const formData = {
        userid: userid,
        hp: hp
    }

    const jsonData = JSON.stringify(formData)

    if (checkAll()){
        // PW 찾기
        fetch('https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/auth/findPW',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData
        })
        .then(res => {return res.json()})
        .then((data) => {
            // 해당 유저 정보 있으면 인증코드 전송
            if(data.message === 'ok'){
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
                searchPw.disabled = false
            })

                // container1 div 숨김
                const container1 = document.getElementById('container1');
                container1.style.display = 'none';

                // container2 div 보이게
                const container2 = document.getElementById('container2');
                container2.style.display = 'block';
            }else{
                // 해당 유저 정보없음
                alert(data.message)
                location.reload()
            }            
        })
    }
})


// page2 -----------------------------------------------

// 뒤로가기
const cancel = document.getElementById('back')
cancel.addEventListener('back', ()=>{
    // container1 div 다시 보이게
    const container1 = document.getElementById('container1');
    container1.style.display = 'block';

    // container2 div 숨김
    const container2 = document.getElementById('container2');
    container2.style.display = 'none';
})

console.log(code)

// 코드 인증번호 맞는지 확인하기 (맞다면 container3)
const codeBtn = document.getElementById('codeBtn')
codeBtn.addEventListener('click', (e)=>{
    codeBtn.disabled = true
    const codeCheck = document.getElementById('codeCheck').value
    console.log(codeCheck)
    if (codeCheck == code){
        alert('인증되었습니다')

        // container2 div 숨김
        const container2 = document.getElementById('container2');
        container2.style.display = 'none';

        // container3 div 보이게
        const container3 = document.getElementById('container3');
        container3.style.display = 'block';
        
    }else{
        alert('인증번호가 틀렸습니다')
        codeBtn.disabled = false
    }
})
// page3 -----------------------------------------------

const new_pw_btn = document.getElementById('edit')
edit.addEventListener('click',()=>{
    // 새 비밀번호 입력값 추출
    const userid = document.getElementById('userid').value
    const new_pw = document.getElementById('new_pw').value

    if (checkPw()){
        const formData = {
            userid: userid,
            new_pw: new_pw
        }
    
        const jsonData = JSON.stringify(formData)
    
        // PW 찾기
        fetch('https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/auth/newPW',{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData
        })
        .then(res => {return res.json()})
        .then((data) => {
            console.log(data)
            alert(data.message)
            window.location.href = "../login.html"
        })
    }
})

// 함수 -------------------------------------------------

// 제대로 입력하도록 정규표현식
function checkAll(){
    const userid = document.getElementById('userid')
    const hp = document.getElementById('hp')

    const expIdText = /^[A-Za-z0-9]{5,15}$/
    const expHpText = /^\d{11}$/

    if (!expIdText.test(userid.value)){
        alert('아이디는 5자 이상 15자 이하의 영문자 또는 숫자로 입력하세요')
        userid.focus()
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

// 비밀번호 제대로 입력했는지 확인
function checkPw(){
    const new_pw = document.getElementById('new_pw')
    const new_pw_re = document.getElementById('new_pw_re')

    const expPwText = /^(?=.*[A-Za-z])(?=.*[~!@#$%^*+=-])(?=.*[0-9])\S{8,15}$/
    const expPw_reText = /^(?=.*[A-Za-z])(?=.*[~!@#$%^*+=-])(?=.*[0-9])\S{8,15}$/

    if (!expPwText.test(new_pw.value)){
        alert('비밀번호는 5자 이상 20자 이하의 영문자, 숫자, 특수기호(~!@#$%^*+=-)의 조합으로 입력하세요')
        new_pw.focus()
        return false
    }
    else if (new_pw_re.value !== new_pw.value){
        alert('비밀번호가 일치하지 않습니다.')
        new_pw_re.focus()
        return false
    }
    else{
        return true
    }
}