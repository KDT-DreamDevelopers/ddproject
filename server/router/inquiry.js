import express from 'express'
import * as inquiryController from '../controller/inquiry.js'
import {body} from 'express-validator'
import {validate} from '../middleware/validator.js'
import {isAuth} from '../middleware/auth.js';

const router = express.Router()

const validateInquiry = [
    body('category')
        .trim()
        .notEmpty()
        .withMessage('카테고리를 지정해주세요'),
    body('title')
        .trim()
        .notEmpty()
        .withMessage('제목을 입력하세요'),
    body('text')
        .trim()
        .notEmpty()
        .withMessage('내용이 반드시 입력되어야 합니다'),
    validate
]


// 고객문의 글 생성
router.post('/write', isAuth, validateInquiry, inquiryController.createInquiry)
// 자신이 쓴 문의하기 글 보기
router.get('/myInquiries', isAuth, inquiryController.getAllInquiry)
// 특정 글만 가져오기 (_id이용)
router.get('/myInquiry/:id', isAuth, inquiryController.getInquiry)
// 문의하기 글 삭제
router.delete('/delete/:id', isAuth, inquiryController.deleteInquiry)


// -------------------------------------- 
// 관리자 페이지

// 고객센터 자주하는 질문 보기
router.post('/questions', inquiryController.getAllQuestion)

// 모든 문의 내역
router.get('/all', isAuth,inquiryController.getAllInquery)

// 자주하는 질문 특정 글만 가져오기 (_id이용)  
router.get('/question/:id', inquiryController.getInquiry)

// 관리자 페이지 전용 문의 하나 선택
router.get('/:id', isAuth, inquiryController.getInquiryById);

// 답변 달기
router.put('/answer/:id',isAuth,inquiryController.PostAnswer)

// 문의글 삭제
router.delete('/deletebyadmin/:id',inquiryController.deletePost)

export default router