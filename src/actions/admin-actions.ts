"use server"

interface Product {
  product_content: string
  id?: number
  product_name: string
  product_image: string
  product_link: string
  product_category: string
  partner_mall: string
  price: string
  created_at?: string
  status?: "active" | "inactive"
}

interface PartnerMall {
  id?: number
  mall_name: string
  mall_url: string
  commission_rate: number
  status: "active" | "inactive"
  created_at?: string
}

// 새로운 인터페이스들 추가
interface ProductAnalytics {
  product_id: number
  product_name: string
  view_count: number
  purchase_count: number
  total_sales: number
  conversion_rate: number
}

interface PartnerAnalytics {
  partner_id: number
  partner_name: string
  total_sales: number
  commission_owed: number
  commission_paid: number
  payment_status: "paid" | "pending" | "overdue"
  payment_due_date: string
  is_active: boolean
}

interface PartnershipApplication {
  id: number
  company_name: string
  contact_email: string
  contact_phone: string
  business_registration: string
  application_date: string
  status: "pending" | "approved" | "rejected"
  documents: string[]
}

interface ProductApproval {
  id: number
  product_name: string
  partner_name: string
  images: string[]
  description: string
  price: string
  category: string
  status: "pending" | "approved" | "rejected"
  submitted_date: string
}

// 임시 데이터 저장소 (실제로는 데이터베이스 사용)
const products: Product[] = [
  {
    id: 1,
    product_name: "나이키 에어포스 1",
    product_content: "편하고 이쁜 나이키 신발",
    product_image: "/placeholder.svg?height=200&width=200",
    product_link: "https://example-mall.com/nike-airforce1",
    product_category: "신발",
    partner_mall: "패션몰A",
    price: "129,000원",
    created_at: "2024-01-15",
  },
  {
    id: 2,
    product_name: "유니클로 화이트 티셔츠",
    product_content: "시원한 티셔츠",
    product_image: "/placeholder.svg?height=200&width=200",
    product_link: "https://example-mall.com/uniqlo-tshirt",
    product_category: "상의",
    partner_mall: "패션몰B",
    price: "29,000원",
    created_at: "2024-01-14",
  },
]

// 임시 데이터 추가
const productAnalytics: ProductAnalytics[] = [
  {
    product_id: 1,
    product_name: "나이키 에어포스 1",
    view_count: 1250,
    purchase_count: 45,
    total_sales: 5805000,
    conversion_rate: 3.6,
  },
  {
    product_id: 2,
    product_name: "유니클로 화이트 티셔츠",
    view_count: 890,
    purchase_count: 67,
    total_sales: 1943000,
    conversion_rate: 7.5,
  },
]

const partnerAnalytics: PartnerAnalytics[] = [
  {
    partner_id: 1,
    partner_name: "패션몰A",
    total_sales: 15750000,
    commission_owed: 866250,
    commission_paid: 500000,
    payment_status: "pending",
    payment_due_date: "2024-02-15",
    is_active: true,
  },
  {
    partner_id: 2,
    partner_name: "패션몰B",
    total_sales: 8920000,
    commission_owed: 356800,
    commission_paid: 356800,
    payment_status: "paid",
    payment_due_date: "2024-01-31",
    is_active: true,
  },
]

const partnershipApplications: PartnershipApplication[] = [
  {
    id: 1,
    company_name: "스타일샵",
    contact_email: "contact@styleshop.com",
    contact_phone: "02-1234-5678",
    business_registration: "123-45-67890",
    application_date: "2024-01-20",
    status: "pending",
    documents: ["business_license.pdf", "product_catalog.pdf"],
  },
]

const productApprovals: ProductApproval[] = [
  {
    id: 1,
    product_name: "프리미엄 가죽 재킷",
    partner_name: "스타일샵",
    images: ["/placeholder.svg?height=200&width=200"],
    description: "고급 양가죽으로 제작된 프리미엄 가죽 재킷입니다.",
    price: "299,000원",
    category: "아우터",
    status: "pending",
    submitted_date: "2024-01-22",
  },
]

// 상품 관련 액션들
export async function addProduct(formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // 로딩 시뮬레이션

  const newProduct: Product = {
    id: products.length + 1,
    product_name: formData.get("product_name") as string,
    product_content: formData.get("product_content") as string,
    product_image: formData.get("product_image") as string,
    product_link: formData.get("product_link") as string,
    product_category: formData.get("product_category") as string,
    partner_mall: formData.get("partner_mall") as string,
    price: formData.get("price") as string,
    created_at: new Date().toISOString().split("T")[0],
  }

  products.push(newProduct)

  return {
    success: true,
    message: "상품이 성공적으로 추가되었습니다.",
    product: newProduct,
  }
}

export async function getProducts() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return products
}

export async function deleteProduct(productId: number) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = products.findIndex((p) => p.id === productId)
  if (index > -1) {
    products.splice(index, 1)
    return { success: true, message: "상품이 삭제되었습니다." }
  }

  return { success: false, message: "상품을 찾을 수 없습니다." }
}

export async function updateProduct(productId: number, formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const index = products.findIndex((p) => p.id === productId)
  if (index > -1) {
    products[index] = {
      ...products[index],
      product_name: formData.get("product_name") as string,
      product_image: formData.get("product_image") as string,
      product_link: formData.get("product_link") as string,
      product_category: formData.get("product_category") as string,
      partner_mall: formData.get("partner_mall") as string,
      price: formData.get("price") as string,
    }

    return { success: true, message: "상품이 수정되었습니다.", product: products[index] }
  }

  return { success: false, message: "상품을 찾을 수 없습니다." }
}

// 새로운 액션들 추가
export async function getProductAnalytics() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return productAnalytics
}

export async function deletePartnerMall(id: number) {
  const token = localStorage.getItem("token"); // 토큰 필요시
  const res = await fetch(`/api/admin/stores/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("삭제 실패");
}

export async function getPartnerAnalytics() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return partnerAnalytics
}

export async function togglePartnerStatus(partnerId: number, isActive: boolean) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const partner = partnerAnalytics.find((p) => p.partner_id === partnerId)
  if (partner) {
    partner.is_active = isActive
    return { success: true, message: `제휴사가 ${isActive ? "활성화" : "비활성화"}되었습니다.` }
  }

  return { success: false, message: "제휴사를 찾을 수 없습니다." }
}

export async function markCommissionPaid(partnerId: number) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const partner = partnerAnalytics.find((p) => p.partner_id === partnerId)
  if (partner) {
    partner.commission_paid = partner.commission_owed
    partner.payment_status = "paid"
    return { success: true, message: "수수료 납부가 완료되었습니다." }
  }

  return { success: false, message: "제휴사를 찾을 수 없습니다." }
}

export async function getPartnershipApplications() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return partnershipApplications
}

export async function approvePartnershipApplication(applicationId: number, approved: boolean) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const application = partnershipApplications.find((a) => a.id === applicationId)
  if (application) {
    application.status = approved ? "approved" : "rejected"
    return { success: true, message: `제휴 신청이 ${approved ? "승인" : "거절"}되었습니다.` }
  }

  return { success: false, message: "신청서를 찾을 수 없습니다." }
}

export async function getProductApprovals() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return productApprovals
}

export async function approveProduct(productId: number, approved: boolean) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const product = productApprovals.find((p) => p.id === productId)
  if (product) {
    product.status = approved ? "approved" : "rejected"
    return { success: true, message: `상품이 ${approved ? "승인" : "거절"}되었습니다.` }
  }

  return { success: false, message: "상품을 찾을 수 없습니다." }
}

export async function toggleProductStatus(productId: number, isActive: boolean) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const product = products.find((p) => p.id === productId)
  if (product) {
    product.status = isActive ? "active" : "inactive"
    return { success: true, message: `상품이 ${isActive ? "활성화" : "비활성화"}되었습니다.` }
  }

  return { success: false, message: "상품을 찾을 수 없습니다." }
}
