import express from 'express'
import * as reportController from '../controller/report.js'
import {body} from 'express-validator'
import {validate} from '../middleware/validator.js'
import {isAuth} from '../middleware/auth.js';

const router = express.Router()

const validateReport = [
    body('location')
        .trim()
        .notEmpty()
        .withMessage('location은 반드시 입력해야 함'),
    body('text')
        .trim()
        .notEmpty()
        .withMessage('text는 반드시 입력해야 함'),
    validate
]

// 불편신고 글 생성
router.post('/write', isAuth, reportController.upload.single('file'), validateReport, reportController.createreport)

// ----------------------------------------------
// 관리자 페이지

// 불편신고 데이터 불러오기 (관리자 페이지)
router.get('/all', isAuth, reportController.ViewReport )

// 불편신고 데이터 하나 선택해서 불러오기 (관리자 페이지)
router.get('/:id', isAuth, reportController.getReportById);

// 불편신고 데이터 신고완료
router.put('/check/:id', isAuth, reportController.DoneReport)

// 불편신고 이미지 파일 보내기
router.get('/getImage/:filename', isAuth, reportController.readFile)

// 문의글 삭제
router.delete('/deletebyadmin/:id',reportController.deletePost)

export default router