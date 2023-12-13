import express from 'express'
import * as inquiryController from '../controller/inquiry.js'
import {isAuth} from '../middleware/auth.js';

const router = express.Router()

// 고객문의 글 생성
router.post('/write', isAuth, inquiryController.createInquiry)
// 자신이 쓴 문의하기 글 보기
router.get('/myInquiries', isAuth, inquiryController.getAllInquiry)
// 특정 글만 가져오기 (_id이용)
router.get('/myInquiry/:id', isAuth, inquiryController.getInquiry)
// 문의하기 글 삭제
router.delete('/delete/:id', isAuth, inquiryController.deleteInquiry)


// -------------
// 관리자 페이지 - 문의하기 답변 예정

// 문의하기 글 수정     수정 못하게 하기로함....
// router.put('/update/:id', isAuth, inquiryController.updateInqury)

export default router