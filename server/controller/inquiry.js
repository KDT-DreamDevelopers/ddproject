import * as inquiryRepository from '../data/inquiry.js'
import * as authRepository from '../data/auth.js'

// 문의하기 글 생성   /inquiry/write
export async function createInquiry(req, res, next){
    // body에서 받아온 정보
    const {category, title, text, myanswer} = req.body;
    // 문의하기 생성   inquiry: 생성된 문의 글
    const inquiry = await inquiryRepository.create(category, title, text, myanswer, req.userId)
    res.status(201).json(inquiry)
}

// 나의 문의하기 내역    /inquiry/myInquiries
export async function getAllInquiry(req, res){
    // 사용자 정보
    const user = await authRepository.getById(req.userId)
    // 나의 문의글 전부
    const inquiry = await inquiryRepository.getAllByUserid(user.userid)
    res.status(200).json(inquiry)
}

// 선택한 나의 문의글 하나만 가져오기   /inquiry/myInquiry/:id
export async function getInquiry(req, res){
    // 선택한 글의 id
    const id = req.params.id
    // 나의 문의글 전부
    const inquiry = await inquiryRepository.getById(id)
    if(!inquiry){
        return res.status(403).json({message:'Not Found'})
    }
    res.status(200).json(inquiry)
}

// 나의 문의하기 글 삭제    /inquiry/delete
export async function deleteInquiry(req, res){
    // 삭제할 글의 _id
    const id = req.params.id
    // 사용자 정보 
    const user = await authRepository.getById(req.userId)
    const inquiry = await inquiryRepository.getById(id)
    if(!inquiry){
        return res.status(404).json({message: `Inquiry id(${id}) not found`})
    }
    if (inquiry.userid !== user.userid){
        return res. status(403).json({message: '본인의 글만 삭제가능합니다'})
    }
    await inquiryRepository.remove(id)
    res.status(201).json({message:'삭제되었습니다'})
}

// --------------------------------------------------------

// 고객센터 자주하는 질문 내역    /inquiry/questions
export async function getAllQuestion(req, res){
    // 관리자 _id
    const {id} = req.body
    const user = await authRepository.getById(id)
    // 관리자 문의글 전부
    const inquiry = await inquiryRepository.getAllByUserid(user.userid)
    res.status(200).json(inquiry)
}

// 관리자 페이지 문의 하나 선택해서 보기
export async function getInquiryById(req, res) {
    const id = req.params.id;
    try {
        const inquiry = await inquiryRepository.getById(id);
        res.status(200).json(inquiry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// 모든 문의 정보 가져오기
export async function getAllInquery(req, res) {
    try {
        const data = await inquiryRepository.allInquiry();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// 문의하기 답변
export async function PostAnswer(req,res,next){
    const id = req.params.id
    const answer = req.body.answer;
    const inquiry = await inquiryRepository.answer(id,answer)
    res.status(201).json(inquiry)
}

// 관리자용 사용자 질문 삭제 
export async function deletePost(req, res) {
    try {
        const user = req.user || {};  // user가 null이면 빈 객체로 초기화

        const id = req.params.id;
        const inquiry = await inquiryRepository.getById(id);

        if (!inquiry) {
            return res.status(404).json({ message: `Inquiry id(${id}) not found` });
        }

        if (user.userid !== inquiry.userid && user.role !== 'admin') {
            // 본인, 관리자인 경우만 삭제 가능하도록 체크하고, 이 외의 경우에도 삭제 허용
        }

        await inquiryRepository.remove(id);
        res.status(201).json({ message: '삭제되었습니다' });
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}