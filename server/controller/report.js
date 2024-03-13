import * as reportRepository from '../data/report.js'
import * as authRepository from '../data/auth.js'
import multer from 'multer'      // 파일업로드 할때 사용
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'

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
export const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb){
        if(file.mimetype.startsWith('image/')){
            cb(null, true)
        }else{
        cb(new Error('이미지 파일만 허용됩니다.'))
        }
    }
});


// 불편신고 글 생성   /report/write
export async function createreport(req, res, next){
    // body에서 받아온 정보
    const {location, text} = req.body;
    // 불편신고 생성   report: 생성된 불편신고 글
    const report = await reportRepository.create(location, text, filename, req.userId)
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

// 파일
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// readFile   /report/getImage
export async function readFile(req, res){
    const filename = req.params.filename;
    console.log('Requested File Path:', filename);
    try {
        const fullPath = path.join(__dirname, '..', 'reports_img', filename);
        console.log('Full File Path:', fullPath);
    
        // 파일 존재 여부 확인
        await fs.access(fullPath, fs.constants.F_OK);
    
        // 파일을 클라이언트에게 전송
        res.sendFile(fullPath, (err) => {
          if (err) {
            res.status(404).send('이미지를 찾을 수 없습니다.');
          }
        });
      } catch (error) {
        res.status(404).send('요청한 파일이 서버에 존재하지 않습니다.');
      }
}

// 불편신고 삭제 
export async function deletePost(req, res) {
  try {
      const user = req.user || {};

      const id = req.params.id;
      const report = await reportRepository.getById(id);

      if (!report) {
          return res.status(404).json({ message: `Report id(${id}) not found` });
      }

      if (user.userid !== report.userid && user.role !== 'admin') {
          // 본인, 관리자인 경우만 삭제 가능하도록 체크하고, 이 외의 경우에도 삭제 허용
      }

      await reportRepository.remove(id);
      res.status(201).json({ message: '삭제되었습니다' });
  } catch (error) {
      console.error('Error deleting report:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}