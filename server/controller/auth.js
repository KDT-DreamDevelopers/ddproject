import * as authRepository from '../data/auth.js'
import bcrypt from 'bcrypt'
import {config} from '../config.js'
import jwt from 'jsonwebtoken'
import multer from 'multer'      // 파일업로드 할때 사용
import path from 'path'

// 토큰 생성
function createJwtToken(id){
    return jwt.sign({id}, config.jwt.secretKey, {expiresIn:config.jwt.expiresInSec})
}

// -----------------------------------------------

// 아이디 중복확인 함수 /auth/userid_check
export async function useridCheck(req, res){
    console.log(4)
    const userid = req.body
    console.log(userid.userid)
    const found = await authRepository.findByUserid(userid.userid)
    if (found){
        return res.status(409).json({message: '이 아이디로 등록된 계정이 이미 있습니다'})
    } else{
        return res.status(201).json({message: '사용가능한 아이디 입니다'})
    }
}
// --------------------------------------------------

// 랜덤 번호 6자리 생성
function randomNumber(){
    const min = 100000
    const max = 999999
    return Math.floor(Math.random()*(max - min +1) + min)
}

// 본인인증 함수 /auth/check
export async function check(req, res, next){
    console.log(2)
    const code = randomNumber()
    console.log(code)
    const {hp} = req.body
    const check = await authRepository.sendMessage(code, hp)
    res.status(200).json({code})
}

// -----------------------------------------------------

// 회원가입 /auth/signup
export async function signup(req, res){
    const {userid, userpw, name, ssn1, ssn2, hp} = req.body
    const found = await authRepository.findByUserHp(hp)
    if (found){
        return res.status(409).json({message: `${hp}로 이미 가입된 아이디가 있습니다`})
    }
    const foundID = await authRepository.findByUserid(userid)
    if (foundID){
        return res.status(408).json({message: `${userid}로 이미 가입된 아이디가 있습니다`})
    }
    const hashed = await bcrypt.hash(userpw, config.bcrypt.saltRounds)
    const users = await authRepository.createUser({
        userid,
        userpw: hashed,
        name,
        ssn1,
        ssn2,
        hp,
        img: `../uploads/${filename}`
    })
    res.status(201).json({message:'가입되었습니다.', users})
}

let filename

// 파일이 저장될 폴더 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './/uploads/'); 
    },
    filename: function (req, file, cb) {
        filename = Date.now() + path.extname(file.originalname)
      cb(null, filename); // 파일명을 고유하게 설정
    },
  });
// 미들웨어 설정
export const upload = multer({ storage: storage });

// ------------------------------------------------

// 로그인   /auth/login
export async function login(req, res){
    const {userid, userpw} = req.body
    const user = await authRepository.findByUserid(userid)
    if(!user){
        return res.status(401).json({message:'아이디 비밀번호가 틀렸습니다'})
    }
    const isValidpassword = bcrypt.compareSync(userpw, user.userpw)
    if (!isValidpassword){
        return res.status(401).json({message: '아이디 비밀번호가 틀렸습니다'})
    }
    const token = createJwtToken(user.id)
    console.log(token)
    res.status(200).json({token, message: '로그인 되었습니다'})
}

// ID 찾기   /auth/findID
export async function findID(req, res, next){
    const {name, hp} = req.body
    const found = await authRepository.findByUserHp(hp)
    if (!found){
        return res.status(409).json({message: '해당 전화번호로 가입된 아이디가 없음'})
    }else{
        if (found.name !== name){
            return res.status(408).json({message: '이름과 hp가 일치하지 않음'})
        }else{
            res.status(200).json({userid:found.userid})
        }
    }
    
}

// PW 찾기   /auth/findPW
export async function findPW(req, res, next){
    const {userid, hp} = req.body
    const found = await authRepository.findByUserHp(hp)
    if (!found){
        return res.status(409).json({message: `${hp}로 가입된 아이디가 없음`})
    }else{
        console.log(found)
        console.log(userid)
        if (found.userid !== userid){
            return res.status(408).json({message: '아이디와 hp가 일치하지 않음'})
        }else{
            res.status(200).json({message: 'ok'})
        }
    }
    
}

// 새로운 pw 등록   /auth/newPW     (아이디 찾기 시 이용)
export async function newPW(req, res, next){
    const {userid, new_pw} = req.body
    const new_hashed = await bcrypt.hash(new_pw, config.bcrypt.saltRounds)
    const user = await authRepository.findByUserid(userid)
    if(!user){
        res.status(404).json({message: `에러: 유저를 찾을 수 없습니다`})
    }
    const update = await authRepository.updatePW(user.id, new_hashed)
    res.status(200).json({update, message: '새로운 비밀번호가 등록되었습니다'})
}

// 새로운 pw 등록   /auth/newPW_id       (회원정보 수정시 이용)
export async function newPW_id(req, res, next){
    const new_pw = req.body.new_pw
    console.log(new_pw)
    const new_hashed = await bcrypt.hash(new_pw, config.bcrypt.saltRounds)
    const user = await authRepository.getById(req.userId)
    if(!user){
        res.status(404).json({message: `에러: 유저를 찾을 수 없습니다`})
    }
    const update = await authRepository.updatePW(user.id, new_hashed)
    res.status(200).json({update, message: '새로운 비밀번호가 등록되었습니다'})
}

// 비밀번호 확인    /auth/checkPw       
export async function checkPw(req, res){
    const userpw = req.body.userpw
    // 토큰에 저장된 유저정보에서 _id 가져와서 유저찾기
    const user = await authRepository.getById(req.userId)
    // 비밀번호가 맞는지 확인
    const isValidpassword = bcrypt.compareSync(userpw, user.userpw)
    if(!isValidpassword){
        return res.status(403).json({message: '비밀번호 틀림'})
    }
    res.status(200).json({message: 'ok'})
}

// 유저정보 보내기 /auth/userInfo
export async function userInfo(req, res){
    // 토큰에 저장된 유저정보에서 _id 가져와서 유저찾기
    const user = await authRepository.getById(req.userId)
    // 유저정보 전송
    res.status(201).json({userid:user.userid, name:user.name , hp:user.hp})
}

// 유저 정보 수정   /auth/modify
export async function modify(req,res){
    const {name, hp} = req.body;
    const user = await authRepository.getById(req.userId)
    if (user.hp !== hp){
        const found = await authRepository.findByUserHp(hp)
        if (found){
            return res.status(409).json({message: `이미 ${hp}로 가입된 아이디가 있음`})
        }
    }
    const update = await authRepository.updateUserInfo(req.userId, name, hp)
    res.status(200).json({message: '회원정보가 수정되었습니다', update})
}