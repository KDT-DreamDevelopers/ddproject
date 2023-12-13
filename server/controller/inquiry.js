import * as inquiryRepository from '../data/inquiry.js'
import * as authRepository from '../data/auth.js'

// 문의하기 글 생성   /inquiry/write
export async function createInquiry(req, res, next){
    // body에서 받아온 정보
    const {category, title, text} = req.body;
    // 문의하기 생성   inquiry: 생성된 문의 글
    const inquiry = await inquiryRepository.create(category, title, text, req.userId)
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
    // 사용자 정보
    const user = await authRepository.getById(req.userId)
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





// 문의하기 글 수정   /inquiry/update       수정 못하게 하기로함....
// export async function updateInqury(req, res){
//     // 문의하기 _id
//     const id = req.params.id
//     const {category, title, text} = req.body;
//     const update = await inquiryRepository.update(id, category, title, text)
//     res.status(201).json({message: '수정되었습니다', update})
// }