import express from 'express'
import {body, validationResult} from 'express-validator'
import {validate} from '../middleware/validator.js'
import * as authController from '../controller/auth.js'
import multer from 'multer'      // 파일업로드 할때 사용
import path from 'path'
import {isAuth} from '../middleware/auth.js';

const router = express.Router()


// 로그인 validate
const validateCredential = [
    body('userid')
        .trim()
        .notEmpty().withMessage('userid는 반드시 입력해야 함')
        .isLength({ min: 5, max: 15 }).withMessage('userid는 5~15자 이어야 함')
        .matches(/^[A-Za-z0-9]{5,15}$/).withMessage('userid는 영문 대소문자와 숫자로 5~15자 이어야 함'),
    body('userpw')
        .trim()
        .notEmpty().withMessage('userpw는 반드시 입력해야 함')
        .isLength({ min: 8, max: 15 }).withMessage('userpw는 8~15자 이어야 함')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*+=-])[A-Za-z\d~!@#$%^&*+=-]+$/)
        .withMessage('userpw는 적어도 하나의 알파벳, 하나의 숫자, 하나의 특수문자(~!@#$%^&*+=-)가 포함된 8-15자리의 공백이 없는 문자열이어야 함'),
    validate
]

// 회원가입 validate
const validateSignup = [
    ...validateCredential,
    body('name')
        .notEmpty().withMessage('name은 반드시 입력')
        .matches(/^(?:[A-Za-z]+|[가-힣]+)$/).withMessage('name은 영문 알파벳 또는 한글문자로 1-20자 이어야 함'),
    body('ssn1')
        .notEmpty().withMessage('ssn1은 반드시 입력')
        .isLength({ min: 6, max: 6 }).withMessage('ssn1은 6자리여야 함'),
    body('ssn2')
        .notEmpty().withMessage('ssn2은 반드시 입력')
        .isLength({ min: 7, max: 7 }).withMessage('ssn1은 7자리여야 함'),
    body('hp')
        .notEmpty().withMessage('hp는 반드시 입력')
        .isLength({ min: 11, max: 11 }).withMessage('hp는 11자리여야 함'),
    validate
]

// 아이디 중복 확인
router.post('/userid_check', authController.useridCheck)
// 본인인증
router.post('/check', authController.check)
// 회원가입
router.post('/signup', authController.upload.single('file'), validateSignup, authController.signup)
// 로그인
router.post('/login', validateCredential, authController.login)
// id 찾기
router.post('/findID', authController.findID)
// pw 찾기
router.post('/findPW', authController.findPW)
// 새로운 pw 등록
router.put('/newPW', authController.newPW)

// -----------------------------------------------------------
// 회원정보 수정

// 회원정보 수정 비밀번호 확인
router.post('/checkPW', isAuth, authController.checkPw)
// 회원정보 보내기
router.get('/userInfo', isAuth, authController.userInfo)
// 회원정보 수정
router.put('/modify', isAuth, authController.modify)
// 비밀번호 변경
router.put('/newPW_id', isAuth, authController.newPW_id)


// ----------------------------------------------------------
// 관리자 페이지

// 관리자 로그인
router.post('/adminlogin', validateCredential, authController.login_Admin)

// 관리자 부여
router.put('/admin/:id', isAuth, authController.updateOkFieldById_Administrator);

// 가입된 정보 확인
router.get('/members',isAuth, authController.getAllUsers)
// 등록증 승인
router.put('/identifyOk/:id', isAuth, authController.updateOkFieldById);
// 등록증 거부
router.put('/refuse/:id', isAuth, authController.updateOkFieldById_Refuse);

// 회원정보 하나 가져오기
router.get('/user/:id',authController.getOneUser)
// 회원정보 수정
router.put('/edit/:id', isAuth, authController.user_modify)
// 회원정보 삭제
router.delete('/delete/:id', isAuth, authController.deleteUser);

// 등록증 파일 보내기
router.get('/getImage/:id', isAuth, authController.readFile)

export default router