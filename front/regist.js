// 기본 설정
window.onload = function(){
    localStorage.setItem("check",'')
}

const userid = document.getElementById('userid')
userid.addEventListener('input',() => {
    document.getElementById('isUserid').value = 'n'
})

const hp = document.getElementById('hp')
hp.addEventListener('input',() => {
    document.getElementById('check').value = 'n'
})

// 시작 페이지로 이동
const back = document.getElementById('back')
back.addEventListener('click', (e)=>{
    window.location.href = './start.html'
})


// 아이디 중복 확인
function useridCheck(){
    const userid = document.getElementById('userid')
    const expIdText = /^[A-Za-z0-9]{5,15}$/
    if (!expIdText.test(userid.value)){
        alert('아이디는 5자 이상 15자 이하의 영문자 또는 숫자로 입력하세요')
        userid.focus()
        return false
    }
    const useridData = {userid: userid.value}
    const userid_jsonData = JSON.stringify(useridData)
    fetch('https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/auth/userid_check', {
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: userid_jsonData
        })
        .then(res => res.json())
        .then(data =>{
            if (data.message == '이 아이디로 등록된 계정이 이미 있습니다'){
                alert('이 아이디로 등록된 계정이 이미 있습니다')
            }else if(data.message == '사용가능한 아이디 입니다'){
                alert('사용가능한 아이디 입니다')
                document.getElementById('isUserid').value = 'y'
            }
        })
}

let code
// 본인인증
const phone_check = document.getElementById('phone_check')
phone_check.disabled = false;
phone_check.addEventListener('click', function(){
    selfCheckButton()
})

function selfCheckButton(){
    const expNameText = /^(?:[가-힣]{1,20}|[A-Za-z]{1,20})$/
    const expSsn1Text = /^\d{6}$/
    const expSsn2Text = /^\d{7}$/
    const expHpText = /^\d{11}$/

    const name = document.getElementById('name').value;
    const ssn1 = document.getElementById('ssn1').value;
    const ssn2 = document.getElementById('ssn2').value;
    const hp = document.getElementById('hp').value;

    if (!expNameText.test(name)){
        alert('이름을 올바르게 작성하세요.')
        return false
    }
    else if (!expSsn1Text.test(ssn1)){
        alert('주민등록 번호가 올바르지 않습니다')
        return false
    }
    else if (!expSsn2Text.test(ssn2)){
        alert('주민등록 번호가 올바르지 않습니다')
        return false
    }
    else if (!expHpText.test(hp)){
        alert('하이픈(-)을 제외한 전화번호 11자리를 올바르게 입력하세요')
        return false
    }
    const formData = {
        name:name,
        ssn1:ssn1,
        ssn2:ssn2,
        hp:hp
    }
    const jsonData = JSON.stringify(formData)

    phone_check.disabled = true;

    // 3분 후에 다시 활성화
    setTimeout(()=>{
        phone_check.disabled = false;
    }, 180000)
    console.log(1)

    fetch("https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/auth/check", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: jsonData
    })
    .then(res => res.json())
    .then(data => {
        code = data.code;
        console.log(code)
        const container2 = document.getElementById('container2');
        container2.style.display = 'block';
        startTimer()
        document.getElementById('check').value = 'y'
    })
    .catch(error => {
        alert(error)
    })
}

let durationInSeconds = 180;
const timerElement = document.getElementById('timer')
// 타이머 시작 함수
function startTimer(){
    let timer = durationInSeconds

     let interval = setInterval(function(){
         let minutes = Math.floor(timer / 60)
         let seconds = timer % 60

         timerElement.textContent = minutes + ':' + seconds
         timer --

         if (timer<0){
         clearInterval(interval)
         timerElement.textContent = '인증시간 초과'
         }
     }, 1000)
 }
    

// 본인인증 확인
const codeBtn = document.getElementById('codeBtn')
codeBtn.addEventListener('click', async (e)=>{
    const codeCheck = document.getElementById('codeCheck').value
    if (codeCheck == code){
        alert('인증되었습니다')
        
        const container2 = document.getElementById('container2');
        container2.style.display = 'none';
        document.getElementById('check').value = 'y'
    }else{
        alert('인증번호가 틀렸습니다.')
    }

})

// 처음으로 돌아가기
function home(){
    window.location.href =  './index.html'
}

// 서버에 회원 정보 보내기 (회원가입 정보 클릭!)
const signUp = document.getElementById('signUp')
signUp.addEventListener('click', async (e)=>{
    e.preventDefault();
    signUp.disabled = true

    // 입력 정보 추출
    const userid = document.getElementById('userid').value
    const userpw = document.getElementById('userpw').value
    const name = document.getElementById('name').value
    const ssn1 = document.getElementById('ssn1').value
    const ssn2 = document.getElementById('ssn2').value
    const hp = document.getElementById('hp').value
    const fileInput = document.getElementById('fileInput')
    const file = fileInput.files[0]
    
    
    // 정규표현식 확인  // 중복아이디, 본인인증 확인
    if (checkAll() && okUserid()&& okSelf()) {       

        // 데이터 전송  (파일때문에 json이 아닌 FormData()로 전송해야함)
        const formData = new FormData();
        formData.append('userid', userid)
        formData.append('userpw', userpw)
        formData.append('name', name)
        formData.append('ssn1', ssn1)
        formData.append('ssn2', ssn2)
        formData.append('hp', hp)
        formData.append('file', file)
        
        try{
            const response = await fetch('https://port-0-ddproject-iad5e2alq1winnk.sel4.cloudtype.app/auth/signup', {
                method:'POST',
                body: formData
            })
            if (response.ok) {
                const data = await response.json();
                alert('회원가입 되었습니다.')
                console.log(data);
                window.location.href = './login.html';
            } else {
                const data = await response.json()
                console.log(data)
                console.error('회원가입 실패');
                alert(data.message)
                signUp.disabled = false
            }
        } catch (error) {
            console.error('에러 발생', error);
            signUp.disabled = false
        }
    }
})



// 정규 표현식 확인 함수
function checkAll(){
    const userid = document.getElementById('userid')
    const userpw = document.getElementById('userpw')
    const userpw_re = document.getElementById('userpw_re')
    const name = document.getElementById('name')
    const ssn1 = document.getElementById('ssn1')
    const ssn2 = document.getElementById('ssn2')
    const hp = document.getElementById('hp')

    // 정규 표현식
    const expIdText = /^[A-Za-z0-9]{5,15}$/
    const expPwText = /^(?=.*[A-Za-z])(?=.*[~!@#$%^*+=-])(?=.*[0-9])\S{8,15}$/
    const expPw_reText = /^(?=.*[A-Za-z])(?=.*[~!@#$%^*+=-])(?=.*[0-9])\S{8,15}$/
    const expNameText = /^(?:[가-힣]{1,20}|[A-Za-z]{1,20})$/
    const expSsn1Text = /^\d{6}$/
    const expSsn2Text = /^\d{7}$/
    const expHpText = /^\d{11}$/

    // 파일 업로드 되었는지 확인
    const fileInput = document.getElementById('fileInput')
    const file = fileInput.files[0]

    if (!expIdText.test(userid.value)){
        alert('아이디는 5자 이상 15자 이하의 영문자 또는 숫자로 입력하세요')
        userid.focus()
        return false
    }
    else if (!expPwText.test(userpw.value)){
        alert('비밀번호는 5자 이상 20자 이하의 영문자, 숫자, 특수기호(~!@#$%^*+=-)의 조합으로 입력하세요')
        userpw.focus()
        return false
    }
    else if (userpw_re.value !== userpw.value){
        alert('비밀번호가 일치하지 않습니다.')
        userpw_re.focus()
        return false
    }
    else if (!expNameText.test(name.value)){
        alert('이름을 올바르게 작성하세요.')
        name.focus()
        return false
    }
    else if (!expSsn1Text.test(ssn1.value)){
        alert('주민등록 번호가 올바르지 않습니다')
        ssn1.focus()
        return false
    }
    else if (!expSsn2Text.test(ssn2.value)){
        alert('주민등록 번호가 올바르지 않습니다')
        ssn2.focus()
        return false
    }
    else if (!expHpText.test(hp.value)){
        alert('하이픈(-)을 제외한 전화번호 11자리를 올바르게 입력하세요')
        hp.focus()
        return false
    }
    else if (!file){
        alert('파일을 선택하세요')
        return false
    }
    else{
        return true
    }
}


// 본인인증 완료했는지 확인하는 함수
function okSelf(){
    const self = document.getElementById('check').value

    // 본인인증 완료했는지 확인
    if (self === 'n'){
        alert('본인인증을 진행해주세요')
        return false
    }
    else{
        return true
    }
}

// 아이디 중복확인 완료했는지 확인하는 함수
function okUserid(){
    const id = document.getElementById('isUserid').value

    // 아이디 중복확인 체크
    if (id === 'n'){
        alert('아이디 중복 확인을 진행해주세요')
        return false
    }else{
        return true
    }
}

