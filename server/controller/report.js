import * as reportRepository from '../data/report.js'
import * as authRepository from '../data/auth.js'
import multer from 'multer'      // 파일업로드 할때 사용
import path from 'path'

let filename

// 파일이 저장될 폴더 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './/reports_img/'); 
    },
    filename: function (req, file, cb) {
        filename = Date.now() + path.extname(file.originalname)
      cb(null, filename); // 파일명을 고유하게 설정
    },
  });
// 미들웨어 설정
export const upload = multer({ storage: storage });


// 불편신고 글 생성   /report/write
export async function createreport(req, res, next){
    // body에서 받아온 정보
    const {location, text} = req.body;
    // 불편신고 생성   report: 생성된 불편신고 글
    const report = await reportRepository.create(location, text, req.userId)
    res.status(201).json({message: '신고가 접수되었습니다'})
}

// 불편신고 글 전부 가져오기     /report/all
export async function ViewReport(req, res){
    const reports = await reportRepository.getAll()
    res.status(200).json(reports)
}

// 불편신고 글 하나만 가져오기   /:id
export async function getReportById(req, res) {
  const id = req.params.id;
  try {
      const inquiry = await reportRepository.getById(id);
      res.status(200).json(inquiry);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
}

// 불편신고 완료   /report/check
export async function DoneReport(req, res){
    // 신고 완료한 불편신고 데이터 id 
    const id = req.params.id
    console.log(id)
    const update = await reportRepository.checkOk(id)
    res.status(201).json(update)
} 